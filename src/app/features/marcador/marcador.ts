import { Component, computed, HostListener, inject } from '@angular/core';
import { PartidoService } from '../../core/partido.service';
import { Router } from '@angular/router';
import { EquipoIdx, Pareja } from '../../core/partido.models';
import { Marca } from '../../shared/marca/marca';
import { PanelEquipo } from './panel-equipo/panel-equipo';
import { MiniCampo } from './mini-campo/mini-campo';

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
    this.order()[0] === this.partido.state()?.equipoSaque
  );

  @HostListener('window:keydown', ['$event'])
  onKey(event: KeyboardEvent): void{
    if (event.key === 'ArrowLeft') this.partido.sumaPunto(this.order()[0]);
    if (event.key === 'ArrowRight') this.partido.sumaPunto(this.order()[1]);
    if (event.key === 'Backspace') this.partido.undo();

  }

  newMatch(): void{
    this.router.navigate(['/']);
  }
}
