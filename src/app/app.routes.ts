import { Router, Routes } from '@angular/router';
import { Setup } from './features/setup/setup';
import { inject } from '@angular/core';
import { PartidoService } from './core/partido.service';
import { Marcador } from './features/marcador/marcador';


const hasPartido = () => {
    const partido = inject(PartidoService);
    const router = inject(Router);
    return partido.state() !== null ? true : router.createUrlTree(['/']); //Sin atajos trampa desde el buscador
}

export const routes: Routes = [
    {path: '', component: Setup, title: 'Marcador de pádel online gratis | Padel Live Scorer'},
    {path: 'partido', component: Marcador, canActivate: [hasPartido], title: 'Partido en juego | Padel Live Scorer'},
    {path: '**', redirectTo: ''},
];
