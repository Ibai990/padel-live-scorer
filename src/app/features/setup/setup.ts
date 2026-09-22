import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Marca } from '../../shared/marca/marca';
import { PartidoService } from '../../core/partido.service';
import { routes } from '../../app.routes';
import { Router } from '@angular/router';
import { Meta } from '@angular/platform-browser';

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

  form = this.fb.nonNullable.group({
    equipo1: ['', Validators.required],
    equipo2: ['', Validators.required],
  });

  start(): void {
    if (this.form.invalid) return;

    const { equipo1, equipo2 } = this.form.getRawValue();
    this.partido.start(equipo1, equipo2);
    this.router.navigate(['/partido'])
  }
}