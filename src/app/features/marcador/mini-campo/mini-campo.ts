import { Component, input } from '@angular/core';
import { Lado } from '../../../core/partido.models';

type Half = 'L' | 'R';
type Role = 'saque' | 'resto' | null;

@Component({
  selector: 'app-court-mini',
  imports: [],
  templateUrl: './mini-campo.html',
  styleUrl: './mini-campo.css',
})
export class MiniCampo {
  serverOnLeft = input.required<boolean>();
  side = input.required<Lado>();

  halves: Half[] = ['L', 'R'];
  rows = [0, 1];

  //En que fila (0 = arriba, 1 = abajo) está un lado en cada mitad
  private rowFor(half: Half, lado: Lado): number {
    if (half === 'L') return lado === 'IZQUIERDA' ? 0 : 1;
    return lado === 'DERECHA' ? 0 : 1;
  }

  role(half: Half, row: number): Role {
    if (row !== this.rowFor(half, this.side())) return null;
    const serverHalf: Half = this.serverOnLeft() ? 'L' : 'R';
    return half === serverHalf ? 'saque' : 'resto';
  }
}