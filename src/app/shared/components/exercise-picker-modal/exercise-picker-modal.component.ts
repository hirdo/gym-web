import { Component, inject, signal, computed, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { ExerciseLibraryService } from '../../../core/services/exercise-library.service';
import { ExerciseTemplate, MuscleGroup, Equipment } from '../../../core/models/workout.model';

@Component({
  selector: 'app-exercise-picker-modal',
  standalone: true,
  imports: [FormsModule, TitleCasePipe],
  templateUrl: './exercise-picker-modal.component.html',
  styleUrl: './exercise-picker-modal.component.scss'
})
export class ExercisePickerModalComponent {
  readonly exerciseService = inject(ExerciseLibraryService);

  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
  @Output() exerciseSelected = new EventEmitter<ExerciseTemplate>();

  readonly searchQuery = signal('');
  readonly selectedMuscle = signal<MuscleGroup | ''>('');
  readonly selectedEquipment = signal<Equipment | ''>('');

  readonly allMuscleGroups: MuscleGroup[] = [
    'chest', 'back', 'shoulders', 'biceps', 'triceps',
    'forearms', 'core', 'quads', 'hamstrings', 'glutes', 'calves'
  ];

  readonly allEquipment: Equipment[] = [
    'barbell', 'dumbbell', 'machine', 'cable',
    'bodyweight', 'kettlebell', 'band', 'other'
  ];

  readonly filteredExercises = computed(() => {
    let results = this.exerciseService.search(this.searchQuery());
    const muscle = this.selectedMuscle();
    if (muscle) {
      results = results.filter(e => e.primaryMuscles.includes(muscle));
    }
    const equip = this.selectedEquipment();
    if (equip) {
      results = results.filter(e => e.equipment === equip);
    }
    return results;
  });

  select(exercise: ExerciseTemplate): void {
    this.exerciseSelected.emit(exercise);
    this.close();
  }

  close(): void {
    this.searchQuery.set('');
    this.selectedMuscle.set('');
    this.selectedEquipment.set('');
    this.closed.emit();
  }
}
