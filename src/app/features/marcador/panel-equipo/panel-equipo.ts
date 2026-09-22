import { Component, input, output } from '@angular/core';
import { EquipoIdx } from '../../../core/partido.models';

@Component({
  selector: 'app-panel-equipo',
  imports: [],
  templateUrl: './panel-equipo.html',
  styleUrl: './panel-equipo.css',
  host: {
    '[class.equipo-2]': 'index() === 1',
    '(click)': 'point.emit()',
  },
})
export class PanelEquipo {
  index = input.required<EquipoIdx>();
  name = input.required<string>();
  games = input.required<number>();
  points = input.required<string>();
  serving = input(false);
  keyHint = input('');

  point = output<void>();
}
