import { inject, Injectable, signal, computed, effect } from '@angular/core';
import { Workout } from '../models/workout.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class WorkoutService {
  private readonly auth = inject(AuthService);
  private readonly STORAGE_PREFIX = 'gymtrack-workouts-';
  private readonly LEGACY_KEY = 'gymtrack-workouts';
  private readonly workoutsSignal = signal<Workout[]>([]);

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

  constructor() {
    effect(() => {
      const userId = this.auth.userId();
      if (userId) {
        this.migrateIfNeeded(userId);
        this.workoutsSignal.set(this.loadFromStorage(userId));
      } else {
        this.workoutsSignal.set([]);
      }
    });
  }

  getById(id: string): Workout | undefined {
    return this.workoutsSignal().find((w) => w.id === id);
  }

  getByCategory(category: string): Workout[] {
    return this.workoutsSignal().filter((w) => w.category === category);
  }

  add(workout: Omit<Workout, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Workout {
    const userId = this.auth.userId();
    const now = new Date().toISOString();
    const newWorkout: Workout = {
      ...workout,
      id: crypto.randomUUID(),
      userId: userId || undefined,
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

  getAllWorkoutsForAdmin(): { userId: string; workouts: Workout[] }[] {
    const result: { userId: string; workouts: Workout[] }[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.STORAGE_PREFIX)) {
          const uid = key.slice(this.STORAGE_PREFIX.length);
          const data = localStorage.getItem(key);
          if (data) {
            result.push({ userId: uid, workouts: JSON.parse(data) });
          }
        }
      }
    } catch {}
    return result;
  }

  private storageKey(): string | null {
    const userId = this.auth.userId();
    return userId ? this.STORAGE_PREFIX + userId : null;
  }

  private migrateIfNeeded(userId: string): void {
    try {
      const legacyData = localStorage.getItem(this.LEGACY_KEY);
      if (!legacyData) return;
      const legacyWorkouts: Workout[] = JSON.parse(legacyData);
      if (legacyWorkouts.length === 0) {
        localStorage.removeItem(this.LEGACY_KEY);
        return;
      }
      const userKey = this.STORAGE_PREFIX + userId;
      const existing = localStorage.getItem(userKey);
      if (!existing) {
        const tagged = legacyWorkouts.map(w => ({ ...w, userId }));
        localStorage.setItem(userKey, JSON.stringify(tagged));
      }
      localStorage.removeItem(this.LEGACY_KEY);
    } catch {}
  }

  private loadFromStorage(userId: string): Workout[] {
    try {
      const data = localStorage.getItem(this.STORAGE_PREFIX + userId);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(): void {
    const key = this.storageKey();
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify(this.workoutsSignal()));
    } catch {}
  }
}
