import { Component, computed, DestroyRef, HostListener, inject, signal } from '@angular/core';
import { PartidoService } from '../../core/partido.service';
import { Router } from '@angular/router';
import { EquipoIdx, JugadorRef, Pareja } from '../../core/partido.models';
import { Marca } from '../../shared/marca/marca';
import { PanelEquipo } from './panel-equipo/panel-equipo';
import { MiniCampo } from './mini-campo/mini-campo';
import { Resultado } from './resultado/resultado';

@Component({
  selector: 'app-marcador',
  imports: [Marca, PanelEquipo, MiniCampo, Resultado],
  templateUrl: './marcador.html',
  styleUrl: './marcador.css',
})
export class Marcador {
  partido = inject(PartidoService);
  private router = inject(Router);

  private ahora = signal(Date.now());

  constructor(){
    const id = setInterval(() => this.ahora.set(Date.now()), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(id));
  }
  
  tiempo = computed(() => {
    const s = this.partido.state();
    if(!s) return '0:00';

    const fin = s.finalizadoEn ?? this.ahora();
    const seg = Math.max(0, Math.floor((fin - s.comenzadoEn) / 1000));

    const h = Math.floor(seg / 3600);
    const m = Math.floor((seg % 3600) / 60);
    const sg = seg % 60;
    const dd = (n: number) => String(n).padStart(2, '0');

    return h > 0 ? `${h}:${dd(m)}:${dd(sg)}` : `${m}:${dd(sg)}`;
  })


  order = computed<Pareja<EquipoIdx>>(() =>
  this.partido.state()?.cambioCampo ? [1, 0] : [0, 1]
  );

  saqueIZQ = computed(()=>
    this.order()[0] === this.partido.servicio()?.equipo
  );

  @HostListener('window:keydown', ['$event'])
  onKey(event: KeyboardEvent): void{
    if (event.key === 'ArrowLeft') this.partido.sumaPunto(this.order()[0]);
    if (event.key === 'ArrowRight') this.partido.sumaPunto(this.order()[1]);
    if (event.key === 'Backspace') this.partido.undo();

  }

  opcionesTiebreak = computed(() => {
    const s = this.partido.state();
    if (!s) return [];

    const refs: JugadorRef[] = [
      {equipo: 0, jugador: 0}, {equipo: 0, jugador: 1},
      {equipo: 1, jugador: 0}, {equipo: 1, jugador: 1},
    ];

    return refs.map(ref => ({
      ref,
      value: `${ref.equipo}-${ref.jugador}`,
      label: s.jugadores[ref.equipo][ref.jugador],
      equipo: ref.equipo,
      sugerido: s.primerSaque?.equipo === ref.equipo && s.primerSaque?.jugador === ref.jugador,
    }));
  });

  elegirSacador(ref: JugadorRef): void {
    this.partido.setSacadorTieBreak(ref);
  }

  newMatch(): void{
    this.router.navigate(['/']);
  }
}
