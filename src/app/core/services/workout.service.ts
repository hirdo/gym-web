import { inject, Injectable, signal, computed, effect, OnDestroy } from '@angular/core';
import { Workout } from '../models/workout.model';
import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';
import { where, orderBy, Unsubscribe } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class WorkoutService implements OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly firestore = inject(FirestoreService);
  private readonly COLLECTION = 'workouts';
  private readonly workoutsSignal = signal<Workout[]>([]);
  private unsubscribe: Unsubscribe | null = null;

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
      this.cleanupSubscription();
      if (userId) {
        this.subscribeToWorkouts(userId);
      } else {
        this.workoutsSignal.set([]);
      }
    });
  }

  ngOnDestroy(): void {
    this.cleanupSubscription();
  }

  getById(id: string): Workout | undefined {
    return this.workoutsSignal().find((w) => w.id === id);
  }

  getByCategory(category: string): Workout[] {
    return this.workoutsSignal().filter((w) => w.category === category);
  }

  async add(workout: Omit<Workout, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Workout> {
    const userId = this.auth.userId();
    const now = new Date().toISOString();
    const data = {
      ...workout,
      userId: userId || '',
      createdAt: now,
      updatedAt: now
    };
    const id = await this.firestore.addDocument(this.COLLECTION, data);
    const newWorkout: Workout = { ...data, id };
    return newWorkout;
  }

  async update(id: string, changes: Partial<Workout>): Promise<void> {
    await this.firestore.updateDocument(this.COLLECTION, id, {
      ...changes,
      updatedAt: new Date().toISOString()
    });
  }

  async delete(id: string): Promise<void> {
    await this.firestore.deleteDocument(this.COLLECTION, id);
  }

  async markComplete(id: string): Promise<void> {
    await this.update(id, { completedDate: new Date().toISOString() });
  }

  async getAllWorkoutsForAdmin(): Promise<{ userId: string; workouts: Workout[] }[]> {
    const all = await this.firestore.queryDocuments<Workout>(this.COLLECTION);
    const grouped = new Map<string, Workout[]>();
    for (const w of all) {
      const uid = w.userId || 'unknown';
      if (!grouped.has(uid)) grouped.set(uid, []);
      grouped.get(uid)!.push(w);
    }
    return Array.from(grouped, ([userId, workouts]) => ({ userId, workouts }));
  }

  private subscribeToWorkouts(userId: string): void {
    this.unsubscribe = this.firestore.subscribe<Workout>(
      this.COLLECTION,
      (workouts) => this.workoutsSignal.set(workouts),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
  }

  private cleanupSubscription(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}
