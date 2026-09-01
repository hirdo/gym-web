import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
export class WorkoutCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly workoutService = inject(WorkoutService);

  readonly isEditMode = signal(false);
  private editId: string | null = null;

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

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const workout = this.workoutService.getById(id);
      if (workout && !workout.completedDate) {
        this.isEditMode.set(true);
        this.editId = id;
        this.form.patchValue({
          name: workout.name,
          description: workout.description || '',
          category: workout.category,
          scheduledDate: workout.scheduledDate || ''
        });
        this.exercises.clear();
        for (const ex of workout.exercises) {
          const group = this.createExerciseGroup();
          group.patchValue({
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight || null,
            duration: ex.duration || null,
            notes: ex.notes || ''
          });
          this.exercises.push(group);
        }
      } else if (workout?.completedDate) {
        this.router.navigate(['/workouts', id]);
      } else {
        this.router.navigate(['/workouts']);
      }
    }
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
    const exercises = value.exercises.map((e) => ({
      id: crypto.randomUUID(),
      name: e['name']!,
      sets: e['sets']!,
      reps: e['reps']!,
      weight: e['weight'] || undefined,
      duration: e['duration'] || undefined,
      notes: e['notes'] || undefined
    }));

    if (this.isEditMode() && this.editId) {
      this.workoutService.update(this.editId, {
        name: value.name!,
        description: value.description || undefined,
        category: value.category as WorkoutCategory,
        scheduledDate: value.scheduledDate || undefined,
        exercises
      });
      this.router.navigate(['/workouts', this.editId]);
    } else {
      const workout = this.workoutService.add({
        name: value.name!,
        description: value.description || undefined,
        category: value.category as WorkoutCategory,
        scheduledDate: value.scheduledDate || undefined,
        exercises
      });
      this.router.navigate(['/workouts', workout.id]);
    }
  }

  cancel(): void {
    if (this.isEditMode() && this.editId) {
      this.router.navigate(['/workouts', this.editId]);
    } else {
      this.router.navigate(['/workouts']);
    }
  }
}
