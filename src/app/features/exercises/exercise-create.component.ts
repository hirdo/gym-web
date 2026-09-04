import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { ExerciseLibraryService } from '../../core/services/exercise-library.service';
import { WorkoutCategory, MuscleGroup, Equipment } from '../../core/models/workout.model';

@Component({
  selector: 'app-exercise-create',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TitleCasePipe],
  templateUrl: './exercise-create.component.html',
  styleUrl: './exercise-create.component.scss'
})
export class ExerciseCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly exerciseService = inject(ExerciseLibraryService);

  readonly categories: WorkoutCategory[] = ['strength', 'cardio', 'flexibility', 'hiit', 'custom'];
  readonly muscleGroups: MuscleGroup[] = [
    'chest', 'back', 'shoulders', 'biceps', 'triceps',
    'forearms', 'core', 'quads', 'hamstrings', 'glutes', 'calves'
  ];
  readonly equipmentList: Equipment[] = [
    'barbell', 'dumbbell', 'machine', 'cable',
    'bodyweight', 'kettlebell', 'band', 'other'
  ];

  readonly selectedMuscles = new Set<MuscleGroup>();

  readonly form = this.fb.group({
    name: ['', Validators.required],
    category: ['strength' as WorkoutCategory, Validators.required],
    equipment: ['barbell' as Equipment, Validators.required],
    instructions: ['']
  });

  toggleMuscle(muscle: MuscleGroup): void {
    if (this.selectedMuscles.has(muscle)) {
      this.selectedMuscles.delete(muscle);
    } else {
      this.selectedMuscles.add(muscle);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.selectedMuscles.size === 0) return;

    const value = this.form.getRawValue();
    const exercise = await this.exerciseService.addExercise({
      name: value.name!,
      category: value.category!,
      equipment: value.equipment!,
      primaryMuscles: Array.from(this.selectedMuscles),
      instructions: value.instructions || undefined,
      isCustom: true
    });
    this.router.navigate(['/exercises', exercise.id]);
  }
}
