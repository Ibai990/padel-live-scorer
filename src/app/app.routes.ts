import { Routes } from '@angular/router';
import { Setup } from './features/setup/setup';

export const routes: Routes = [
    {path: '', component: Setup},
    {path: '**', redirectTo: ''},
];
