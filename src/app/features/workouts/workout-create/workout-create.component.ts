import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormArray,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { WorkoutService } from '../../../core/services/workout.service';
import { WorkoutCategory } from '../../../core/models/workout.model';

@Component({
  selector: 'app-workout-create',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './workout-create.component.html',
  styleUrl: './workout-create.component.scss'
})
export class WorkoutCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly workoutService = inject(WorkoutService);

  readonly categories: { value: WorkoutCategory; label: string }[] = [
    { value: 'strength', label: 'Strength' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'flexibility', label: 'Flexibility' },
    { value: 'hiit', label: 'HIIT' },
    { value: 'custom', label: 'Custom' }
  ];

  readonly form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    category: ['strength' as WorkoutCategory, Validators.required],
    scheduledDate: [''],
    exercises: this.fb.array([this.createExerciseGroup()])
  });

  get exercises(): FormArray {
    return this.form.get('exercises') as FormArray;
  }

  createExerciseGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      sets: [3, [Validators.required, Validators.min(1)]],
      reps: [10, [Validators.required, Validators.min(1)]],
      weight: [null as number | null],
      duration: [null as number | null],
      notes: ['']
    });
  }

  addExercise(): void {
    this.exercises.push(this.createExerciseGroup());
  }

  removeExercise(index: number): void {
    if (this.exercises.length > 1) {
      this.exercises.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const value = this.form.getRawValue();
    const workout = this.workoutService.add({
      name: value.name!,
      description: value.description || undefined,
      category: value.category as WorkoutCategory,
      scheduledDate: value.scheduledDate || undefined,
      exercises: value.exercises.map((e) => ({
        id: crypto.randomUUID(),
        name: e['name']!,
        sets: e['sets']!,
        reps: e['reps']!,
        weight: e['weight'] || undefined,
        duration: e['duration'] || undefined,
        notes: e['notes'] || undefined
      }))
    });

    this.router.navigate(['/workouts', workout.id]);
  }

  cancel(): void {
    this.router.navigate(['/workouts']);
  }
}
