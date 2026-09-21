import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Marca } from '../../shared/marca/marca';

@Component({
  selector: 'app-setup',
  imports: [ReactiveFormsModule, Marca],
  templateUrl: './setup.html',
  styleUrl: './setup.css',
})
export class Setup {
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    team1: ['', Validators.required],
    team2: ['', Validators.required],
  });

  start(): void {
    if (this.form.invalid) return;

    const { team1, team2 } = this.form.getRawValue();
    console.log('Empezar partido:', team1, 'vs', team2);
  }
}