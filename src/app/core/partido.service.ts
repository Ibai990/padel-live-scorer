import { computed, effect, Injectable, signal } from "@angular/core";
import { EquipoIdx, JugadorIdx, JugadorRef, Lado, Pareja, PartidoConfig, PartidoState } from './partido.models';
import { TemplateBindingParseResult } from "@angular/compiler";
import { config } from '../app.config.server';
import { first } from "rxjs";


@Injectable({ providedIn: 'root' })
export class PartidoService {

    private saved = loadSaved();

    //-------------RECUPERAR LO GUARDADO--------------
    readonly state = signal<PartidoState | null>(this.saved.state);
    private history = signal<PartidoState[]>(this.saved.history);

    constructor() {
        effect(() => {
            const data: SavedData = { state: this.state(), history: this.history() };
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            }
        });
    }
    //--------------------------------------------------

    readonly canUndo = computed(() => this.history().length > 0);

    readonly puntosLabels = computed<Pareja<string>>(() => { //Escribir los puntos
        const s = this.state();
        if (!s) return ['0', '0'];

        const [a, b] = s.puntos;
        if (isTieBreak(s)) return [String(a), String(b)];

        if (a >= 3 && b >= 3) {
            if (a == b) return ['40', '40'];
            return a > b ? ['AD', '40'] : ['40', 'AD'];
        }

        return [PUNTOS_LABEL[a], PUNTOS_LABEL[b]];
    });

    readonly ganador = computed<EquipoIdx | null>(() => {
        const s = this.state();
        if (!s) return null;
        if (s.sets[0] >= s.config.setsPaGanar) return 0;
        if (s.sets[1] >= s.config.setsPaGanar) return 1;
        return null;
    });


    readonly ladoSaque = computed<Lado>(() => {
        const s = this.state();
        if (!s) return 'DERECHA';
        const played = s.puntos[0] + s.puntos[1];
        return played % 2 == 0 ? 'DERECHA' : 'IZQUIERDA';
    });

    readonly servicio = computed<JugadorRef | null>(() => {
        const s = this.state();
        if (!s) return null;

        //Logica para el saque en el tiebreak
        if(isTieBreak(s)){
            if(!s.primerSaque) return null;

            const jugados = s.puntos[0] + s.puntos[1];
            const turno = Math.floor((jugados + 1) / 2);

            const equipo = turno % 2 === 0 ? s.primerSaque.equipo : other(s.primerSaque.equipo);
            const vuelta = Math.floor(turno / 2);
            const base = equipo === s.primerSaque.equipo ? s.primerSaque.jugador : s.siguienteSaque[equipo];
            const jugador = (vuelta % 2 === 0 ? base : (base === 0 ? 1 : 0)) as JugadorIdx;

            return { equipo, jugador};
        }
        
        return { equipo: s.equipoSaque, jugador: s.siguienteSaque[s.equipoSaque]}
        
    });

    readonly nombreServicio = computed(() => {
        const s = this.state();
        const ref = this.servicio();
        return s && ref ? s.jugadores[ref.equipo][ref.jugador] : '';
    })

    start(equipo1: string, equipo2: string, config: PartidoConfig, primerSaque: JugadorRef): void {
        this.history.set([]);

        const siguienteSaque: Pareja<JugadorIdx> = [0, 0];
        siguienteSaque[primerSaque.equipo] = primerSaque.jugador;

        this.state.set({
            equipos: [equipo1.trim(), equipo2.trim()],
            jugadores: [separarJugadores(equipo1), separarJugadores(equipo2)],
            puntos: [0, 0],
            juegos: [0, 0],
            sets: [0, 0],
            marcadorSets: [],
            equipoSaque: primerSaque.equipo,
            siguienteSaque,
            cambioCampo: false,
            config,
            comenzadoEn: Date.now(),
            finalizadoEn: null,
            primerSaque: null,
            saqueTiebrk: false,
        });
    }


    sumaPunto(equipo: EquipoIdx): void {
        const s = this.state();
        if (!s || s.saqueTiebrk || this.ganador() !== null) return;
        this.history.update(h => [...h, s]);
        this.state.set(this.applyPunto(s, equipo));
    }

    private applyPunto(s: PartidoState, equipo: EquipoIdx): PartidoState {
        const puntos: Pareja<number> = [...s.puntos];
        puntos[equipo]++;

        const target = isTieBreak(s) ? 7 : 4; //Si es tieBreak se hace a 7 en vez de a 4
        const lead = puntos[equipo] - puntos[other(equipo)];

        //Sistema para yus y ventaja (hay que ganar con 2 de ventaja)
        if (puntos[equipo] >= target && lead >= 2) {
            return this.JuegoGanado(s, equipo);
        }
        return { ...s, puntos };
    }


    private JuegoGanado(s: PartidoState, equipo: EquipoIdx): PartidoState {
        const juegos: Pareja<number> = [...s.juegos];
        juegos[equipo]++;

        //La pareja que acaba de sacar cambia de jugador
        const siguienteSaque: Pareja<JugadorIdx> = [...s.siguienteSaque];
        siguienteSaque[s.equipoSaque] = siguienteSaque[s.equipoSaque] === 0 ? 1 : 0;

        const afterGame: PartidoState = {
            ...s,
            puntos: [0, 0],
            juegos,
            equipoSaque: other(s.equipoSaque),
            siguienteSaque,
        }

        const lead = juegos[equipo] - juegos[other(equipo)];
        const setGanado =
            (juegos[equipo] >= 6 && lead >= 2) || (s.config.tieBreak && juegos[equipo] === 7);
        if (!setGanado) {
            if (s.config.tieBreak && juegos[0] === 6 && juegos[1] === 6) {
                return {
                    ...afterGame,
                    juegos,
                    saqueTiebrk: true,
                    primerSaque: {
                        equipo: afterGame.equipoSaque,
                        jugador: afterGame.siguienteSaque[afterGame.equipoSaque],
                    },
                };
            }
            return { ...afterGame, juegos };
        }

        const sets: Pareja<number> = [...s.sets];
        sets[equipo]++;
        const partidoFin = sets[equipo] >= s.config.setsPaGanar;

        return {
            ...afterGame,
            juegos: [0, 0],
            sets,
            marcadorSets: [...s.marcadorSets, juegos],
            finalizadoEn: partidoFin ? Date.now() : null,
        };
    }


    //Deshacer
    undo(): void {
        const h = this.history();
        if (h.length === 0) return;
        this.state.set(h[h.length - 1]);
        this.history.set(h.slice(0, -1));
    }

    cambioCampo(): void {
        this.state.update(s => (s ? { ...s, cambioCampo: !s.cambioCampo } : s));
    }

    setSacadorTieBreak(ref: JugadorRef): void {
        this.state.update(s =>{
            if(!s) return s;
            const siguienteSaque: Pareja<JugadorIdx> = [...s.siguienteSaque];
            siguienteSaque[ref.equipo] = ref.jugador;
            return{
                ...s,
                primerSaque: ref,
                saqueTiebrk: false,
                equipoSaque: ref.equipo,
                siguienteSaque,
            };
        });
    }


}

//Separamos los jugadores para hacerlos individules para el saque en vez de parejas

export function separarJugadores(equipo: string): Pareja<string> {
    const [p1 = 'Jugador 1', p2 = 'Jugador 2'] = equipo.split(' ').map(p => p.trim());
    return [p1, p2];
}


const PUNTOS_LABEL = ['0', '15', '30', '40'];

//Pareja contraria
function other(equipo: EquipoIdx): EquipoIdx {
    return equipo === 0 ? 1 : 0;
}

//Si quedan 6 a 6 hay tiebreak
function isTieBreak(s: PartidoState): boolean {
    return s.config.tieBreak && s.juegos[0] === 6 && s.juegos[1] === 6;
}






const STORAGE_KEY = 'padel-live-scorer';
const LEGACY_STORAGE_KEY = 'padel-scorer';
interface SavedData {
    state: PartidoState | null;
    history: PartidoState[];
}

function loadSaved(): SavedData {

    if (typeof localStorage === 'undefined') {
        return { state: null, history: [] };
    }

    try {
        const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
        if (raw) return JSON.parse(raw) as SavedData;
    } catch {
        //Si los datos estan corruptos empezamos de cero
    }
    return { state: null, history: [] };
}
