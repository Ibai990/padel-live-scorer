import { Component, computed, effect, inject } from '@angular/core';
import { PartidoService } from '../../../core/partido.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-resultado',
  imports: [],
  templateUrl: './resultado.html',
  styleUrl: './resultado.css',
})
export class Resultado {
  partido = inject(PartidoService);
  private router = inject(Router);

/*  constructor(){
    effect(() =>{
      if(this.partido.ganador() !== null)
    });
  }*/

  nombreGanador = computed(() =>{
    const s = this.partido.state();
    const g = this.partido.ganador();
    return s && g !== null ? s.equipos[g] : '';
  });

  duracion = computed(() => {
    const s = this.partido.state();
    if (!s?.finalizadoEn) return '';
    const min = Math.round((s.finalizadoEn - s.comenzadoEn) / 60000);
    return min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${min % 60} min`;
  });

  async revancha(): Promise<void>{
    const s = this.partido.state();
    if(!s) return;
    this.partido.start(s.equipos[0], s.equipos[1], s.config, { equipo: 0, jugador: 0 });
    
  }

  nuevoPartido(): void {
    this.router.navigate(['/']);
  }

}
