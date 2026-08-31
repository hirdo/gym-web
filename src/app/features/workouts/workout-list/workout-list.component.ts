import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WorkoutService } from '../../../core/services/workout.service';
import { WorkoutCategory } from '../../../core/models/workout.model';

@Component({
  selector: 'app-workout-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './workout-list.component.html',
  styleUrl: './workout-list.component.scss'
})
export class WorkoutListComponent {
  readonly workoutService = inject(WorkoutService);
  readonly selectedCategory = signal<WorkoutCategory | 'all'>('all');

  readonly categories: { value: WorkoutCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'strength', label: 'Strength' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'flexibility', label: 'Flexibility' },
    { value: 'hiit', label: 'HIIT' },
    { value: 'custom', label: 'Custom' }
  ];

  get filteredWorkouts() {
    const cat = this.selectedCategory();
    if (cat === 'all') return this.workoutService.workouts();
    return this.workoutService.getByCategory(cat);
  }

  filterBy(category: WorkoutCategory | 'all'): void {
    this.selectedCategory.set(category);
  }

  deleteWorkout(id: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.workoutService.delete(id);
  }
}
