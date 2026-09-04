import { inject, Injectable, signal, computed, effect, OnDestroy } from '@angular/core';
import { WorkoutSession, ExerciseSession, SetRecord } from '../models/workout.model';
import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';
import { WorkoutService } from './workout.service';
import { where, orderBy, Unsubscribe } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class WorkoutSessionService implements OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly firestore = inject(FirestoreService);
  private readonly workoutService = inject(WorkoutService);
  private readonly COLLECTION = 'workout_sessions';
  private readonly sessionsSignal = signal<WorkoutSession[]>([]);
  private unsubscribe: Unsubscribe | null = null;

  readonly sessions = this.sessionsSignal.asReadonly();

  readonly activeSession = computed(() =>
    this.sessionsSignal().find(s => !s.completedAt)
  );

  readonly completedSessions = computed(() =>
    this.sessionsSignal().filter(s => s.completedAt)
  );

  readonly recentSessions = computed(() =>
    this.completedSessions()
      .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))
      .slice(0, 10)
  );

  readonly thisWeekCount = computed(() => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const mondayISO = monday.toISOString();
    return this.completedSessions().filter(s => s.completedAt! >= mondayISO).length;
  });

  readonly streak = computed(() => {
    const completed = this.completedSessions()
      .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));
    if (completed.length === 0) return 0;

    const uniqueDays = new Set(
      completed.map(s => s.completedAt!.substring(0, 10))
    );
    const sortedDays = Array.from(uniqueDays).sort().reverse();

    const today = new Date().toISOString().substring(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().substring(0, 10);

    if (sortedDays[0] !== today && sortedDays[0] !== yesterday) return 0;

    let count = 1;
    for (let i = 1; i < sortedDays.length; i++) {
      const prev = new Date(sortedDays[i - 1]);
      const curr = new Date(sortedDays[i]);
      const diffDays = (prev.getTime() - curr.getTime()) / 86400000;
      if (diffDays === 1) {
        count++;
      } else {
        break;
      }
    }
    return count;
  });

  constructor() {
    effect(() => {
      const userId = this.auth.userId();
      this.cleanupSubscription();
      if (userId) {
        this.subscribeToSessions(userId);
      } else {
        this.sessionsSignal.set([]);
      }
    });
  }

  ngOnDestroy(): void {
    this.cleanupSubscription();
  }

  async startSession(
    workoutId?: string,
    programId?: string,
    dayNumber?: number
  ): Promise<WorkoutSession> {
    const userId = this.auth.userId();
    const now = new Date().toISOString();

    let exercises: ExerciseSession[] = [];
    let name = 'Quick Workout';

    if (workoutId) {
      const workout = this.workoutService.getById(workoutId);
      if (workout) {
        name = workout.name;
        exercises = workout.exercises.map(e => ({
          exerciseId: e.id,
          exerciseName: e.name,
          targetSets: e.sets,
          targetReps: e.reps,
          targetWeight: e.weight,
          restTime: e.restTime,
          sets: []
        }));
      }
    }

    const data = {
      userId: userId || '',
      workoutId,
      programId,
      dayNumber,
      name,
      startedAt: now,
      exercises,
      createdAt: now,
      updatedAt: now
    };

    const id = await this.firestore.addDocument(this.COLLECTION, data);
    return { ...data, id } as WorkoutSession;
  }

  async logSet(sessionId: string, exerciseIndex: number, setRecord: SetRecord): Promise<void> {
    const session = this.sessionsSignal().find(s => s.id === sessionId);
    if (!session) return;

    const updatedExercises = [...session.exercises];
    const exercise = { ...updatedExercises[exerciseIndex] };
    exercise.sets = [...exercise.sets, setRecord];
    updatedExercises[exerciseIndex] = exercise;

    await this.firestore.updateDocument(this.COLLECTION, sessionId, {
      exercises: updatedExercises,
      updatedAt: new Date().toISOString()
    });
  }

  async completeSession(sessionId: string): Promise<void> {
    const session = this.sessionsSignal().find(s => s.id === sessionId);
    if (!session) return;

    const completedAt = new Date().toISOString();
    const startedAt = new Date(session.startedAt).getTime();
    const durationSeconds = Math.round((Date.now() - startedAt) / 1000);

    await this.firestore.updateDocument(this.COLLECTION, sessionId, {
      completedAt,
      durationSeconds,
      updatedAt: completedAt
    });
  }

  async updateSessionNotes(sessionId: string, notes: string): Promise<void> {
    await this.firestore.updateDocument(this.COLLECTION, sessionId, {
      notes,
      updatedAt: new Date().toISOString()
    });
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.firestore.deleteDocument(this.COLLECTION, sessionId);
  }

  getExerciseHistory(exerciseName: string): { date: string; sets: SetRecord[] }[] {
    return this.completedSessions()
      .filter(s => s.exercises.some(e => e.exerciseName === exerciseName))
      .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))
      .map(s => {
        const exercise = s.exercises.find(e => e.exerciseName === exerciseName)!;
        return {
          date: s.completedAt!,
          sets: exercise.sets
        };
      });
  }

  getSessionsForWorkout(workoutId: string): WorkoutSession[] {
    return this.completedSessions()
      .filter(s => s.workoutId === workoutId)
      .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));
  }

  getLastWeight(exerciseName: string): number | undefined {
    const history = this.getExerciseHistory(exerciseName);
    if (history.length === 0) return undefined;
    const lastSets = history[0].sets;
    if (lastSets.length === 0) return undefined;
    return lastSets[lastSets.length - 1].weight;
  }

  private subscribeToSessions(userId: string): void {
    this.unsubscribe = this.firestore.subscribe<WorkoutSession>(
      this.COLLECTION,
      (sessions) => {
        sessions.sort((a, b) => (b.startedAt || '').localeCompare(a.startedAt || ''));
        this.sessionsSignal.set(sessions);
      },
      where('userId', '==', userId)
    );
  }

  private cleanupSubscription(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}
