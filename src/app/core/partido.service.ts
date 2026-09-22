import { computed, effect, Injectable, signal } from "@angular/core";
import { EquipoIdx, JugadorIdx, Lado, Pareja, PartidoState } from './partido.models';
import { TemplateBindingParseResult } from "@angular/compiler";


@Injectable({ providedIn: 'root' })
export class PartidoService{
    
    private saved = loadSaved();

    //-------------RECUPERAR LO GUARDADO--------------
    readonly state = signal<PartidoState | null>(this.saved.state);
    private history = signal<PartidoState[]>(this.saved.history);

    constructor(){
        effect(() =>{
            const data: SavedData = {state: this.state(), history: this.history()};
            if(typeof localStorage !== 'undefined'){
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

        if(a >= 3 && b >= 3){
            if (a == b) return ['40', '40'];
            return a > b ? ['AD', '40'] : ['40', 'AD'];
        }

        return [PUNTOS_LABEL[a], PUNTOS_LABEL[b]];
    });

    readonly ganador = computed<EquipoIdx | null>(() =>{
        const s = this.state();
        if(!s) return null;
        if (s.sets[0] === 2) return 0;
        if (s.sets[1] === 2) return 1;
        return null;
    });


    readonly ladoSaque = computed<Lado>(() =>{
        const s = this.state();
        if(!s) return 'DERECHA';
        const played = s.puntos[0] + s.puntos[1];
        return played % 2 == 0 ? 'DERECHA': 'IZQUIERDA';
    });

    readonly nombreServicio = computed(() =>{
        const s = this.state();
        if(!s) return '';
        const equipo = s.equipoSaque;
        const jugador = s.siguienteSaque[equipo];
        return s.jugadores[equipo][jugador];
    })

    start(equipo1: string, equipo2: string): void{
        this.history.set([]);
        this.state.set({
            equipos: [equipo1.trim(), equipo2.trim()],
            jugadores: [separarJugadores(equipo1), separarJugadores(equipo2)],
            puntos: [0, 0],
            juegos: [0, 0],
            sets: [0, 0],
            marcadorSets: [],
            equipoSaque: 0,
            siguienteSaque: [0, 0],
            cambioCampo: false,
        });
    }


    sumaPunto(equipo: EquipoIdx): void{
        const s = this.state();
        if(!s || this.ganador() !== null) return;
        this.history.update(h => [...h, s]);
        this.state.set(this.applyPunto(s, equipo));
    }

    private applyPunto(s: PartidoState, equipo: EquipoIdx): PartidoState{
        const puntos: Pareja<number> = [...s.puntos];
        puntos[equipo]++;

        const target = isTieBreak(s) ? 7: 4; //Si es tieBreak se hace a 7 en vez de a 4
        const lead = puntos[equipo] - puntos[other(equipo)];

        //Sistema para yus y ventaja (hay que ganar con 2 de ventaja)
        if (puntos[equipo] >= target && lead >= 2){
            return this.JuegoGanado(s, equipo);
        }
        return { ...s, puntos};
    }


    private JuegoGanado(s: PartidoState, equipo: EquipoIdx): PartidoState{
        const juegos: Pareja<number> = [...s.juegos];
        juegos[equipo]++;

        //La pareja que acaba de sacar cambia de jugador
        const siguienteSaque: Pareja<JugadorIdx> = [...s.siguienteSaque];
        siguienteSaque[s.equipoSaque] = siguienteSaque[s.equipoSaque] === 0 ? 1 : 0;
        
        const afterGame: PartidoState ={
            ...s,
            puntos: [0, 0],
            juegos,
            equipoSaque: other(s.equipoSaque),
            siguienteSaque,
        }

        const lead = juegos[equipo] - juegos[other(equipo)];
        const setGanado = (juegos[equipo] >= 6 && lead >= 2) || juegos[equipo] === 7;
        if(!setGanado) return afterGame;

        const sets: Pareja<number> = [...s.sets];
        sets[equipo]++;

        return { ...afterGame, juegos: [0, 0], sets, marcadorSets: [...s.marcadorSets, juegos],};
    }


    //Deshacer
    undo(): void {
        const h = this.history();
        if(h.length === 0) return;
        this.state.set(h[h.length - 1]);
        this.history.set(h.slice(0, -1));
    }

    cambioCampo(): void{
        this.state.update(s=> (s ? {...s, cambioCampo: !s.cambioCampo} : s));
    }


}

//Separamos los jugadores para hacerlos individules para el saque en vez de parejas

function separarJugadores(equipo: string): Pareja<string> {
    const [p1 = 'Jugador 1', p2 = 'Jugador 2'] = equipo.split(' ').map(p => p.trim());
    return [p1, p2];
}


const PUNTOS_LABEL = ['0', '15', '30', '40'];

//Pareja contraria
function other(equipo: EquipoIdx): EquipoIdx{
    return equipo === 0 ? 1 : 0;
}

//Si quedan 6 a 6 hay tiebreak
function isTieBreak(s: PartidoState): boolean {
    return s.juegos[0] === 6 && s.juegos[1] === 6;
}

const STORAGE_KEY = 'padel-scorer';
interface SavedData{
    state: PartidoState | null;
    history: PartidoState[];
}

function loadSaved(): SavedData{

    if (typeof localStorage === 'undefined'){
        return {state: null, history: []};
    }

    try{
        const raw = localStorage.getItem(STORAGE_KEY);
        if(raw) return JSON.parse(raw) as SavedData;
    } catch{
        //Si los datos estan corruptos empezamos de cero
    }
    return {state: null, history: []};
}
