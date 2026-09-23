import { Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Marca } from '../../shared/marca/marca';
import { PartidoService, separarJugadores } from '../../core/partido.service';
import { Router } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-setup',
  imports: [ReactiveFormsModule, Marca],
  templateUrl: './setup.html',
  styleUrl: './setup.css',
})
export class Setup {

  constructor(){
    inject(Meta).updateTag({
      name: 'description',
      content: 'Marcador de pádel gratis para el móvil. Lleva los puntos, juegos y sets, y sabe siempre quien saca y desde que lado. Sin instalar nada.',
    });
  }

  private fb = inject(FormBuilder);
  private partido = inject(PartidoService);
  private router = inject(Router);
  //private wake = inject(WakeLockService);

  form = this.fb.nonNullable.group({
    equipo1: ['', Validators.required],
    equipo2: ['', Validators.required],
    tieBreak: [true],
    setsPaGanar: [2],
    comienzaSacando: ['0-0'],
  });

  private values = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });


  serverOptions = computed(() =>{
    const v = this.values();
    const nombres = (equipo: string | undefined, n: 1 | 2): [string, string] =>{
      const [a, b] = separarJugadores(equipo ?? '');
      const vacio = !equipo?.trim();
      return[
        vacio || a === 'Jugador 1' ? `Jugador 1 (Pareja ${n})` : a,
        vacio || b === 'Jugador 2' ? `Jugador 2 (Pareja ${n})` : b,
      ];
    };

    const p1 = nombres(v.equipo1, 1);
    const p2 = nombres(v.equipo2, 2)

    return[
      {value: '0-0', label: p1[0]},
      {value: '0-1', label: p1[1]},
      {value: '1-0', label: p2[0]},
      {value: '1-1', label: p2[1]},
    ];
  });

  async start(): Promise<void>{
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const [equipo, jugador] = v.comienzaSacando.split("-").map(Number);

    this.partido.start(
      v.equipo1,
      v.equipo2,
      { tieBreak: v.tieBreak, setsPaGanar: v.setsPaGanar as 1 | 2},
      { equipo: equipo as 0 | 1, jugador: jugador as 0 | 1},
    );

    this.router.navigate(['/partido']);

  }

  
}