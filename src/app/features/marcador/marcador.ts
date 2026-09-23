import { Component, computed, HostListener, inject } from '@angular/core';
import { PartidoService } from '../../core/partido.service';
import { Router } from '@angular/router';
import { EquipoIdx, JugadorRef, Pareja } from '../../core/partido.models';
import { Marca } from '../../shared/marca/marca';
import { PanelEquipo } from './panel-equipo/panel-equipo';
import { MiniCampo } from './mini-campo/mini-campo';
import { equal } from 'assert';

@Component({
  selector: 'app-marcador',
  imports: [Marca, PanelEquipo, MiniCampo],
  templateUrl: './marcador.html',
  styleUrl: './marcador.css',
})
export class Marcador {
  partido = inject(PartidoService);
  private router = inject(Router);

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
