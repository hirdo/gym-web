import { Injectable, signal, computed } from '@angular/core';
import { Workout } from '../models/workout.model';

@Injectable({ providedIn: 'root' })
export class WorkoutService {
  private readonly STORAGE_KEY = 'gymtrack-workouts';
  private readonly workoutsSignal = signal<Workout[]>(this.loadFromStorage());

  readonly workouts = this.workoutsSignal.asReadonly();

  readonly recentWorkouts = computed(() =>
    this.workoutsSignal()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
  );

  readonly totalWorkouts = computed(() => this.workoutsSignal().length);

  readonly completedWorkouts = computed(() =>
    this.workoutsSignal().filter(w => w.completedDate).length
  );

  getById(id: string): Workout | undefined {
    return this.workoutsSignal().find((w) => w.id === id);
  }

  getByCategory(category: string): Workout[] {
    return this.workoutsSignal().filter((w) => w.category === category);
  }

  add(workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>): Workout {
    const now = new Date().toISOString();
    const newWorkout: Workout = {
      ...workout,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now
    };
    this.workoutsSignal.update((list) => [...list, newWorkout]);
    this.saveToStorage();
    return newWorkout;
  }

  update(id: string, changes: Partial<Workout>): void {
    this.workoutsSignal.update((list) =>
      list.map((w) =>
        w.id === id
          ? { ...w, ...changes, updatedAt: new Date().toISOString() }
          : w
      )
    );
    this.saveToStorage();
  }

  delete(id: string): void {
    this.workoutsSignal.update((list) => list.filter((w) => w.id !== id));
    this.saveToStorage();
  }

  markComplete(id: string): void {
    this.update(id, { completedDate: new Date().toISOString() });
  }

  private loadFromStorage(): Workout[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(this.workoutsSignal())
      );
    } catch {
      // Storage might be full or unavailable
    }
  }
}
