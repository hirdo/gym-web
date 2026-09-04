import { inject, Injectable, signal, computed, OnDestroy } from '@angular/core';
import { TrainingProgram, Exercise } from '../models/workout.model';
import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';
import { WorkoutService } from './workout.service';
import { Unsubscribe } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class ProgramService implements OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly firestore = inject(FirestoreService);
  private readonly workoutService = inject(WorkoutService);
  private readonly COLLECTION = 'programs';
  private readonly programsSignal = signal<TrainingProgram[]>([]);
  private unsubscribe: Unsubscribe | null = null;

  readonly programs = this.programsSignal.asReadonly();

  readonly activeProgram = computed(() =>
    this.programsSignal().find(p => p.isActive)
  );

  readonly totalPrograms = computed(() => this.programsSignal().length);

  constructor() {
    this.subscribeToPrograms();
  }

  ngOnDestroy(): void {
    this.cleanupSubscription();
  }

  getById(id: string): TrainingProgram | undefined {
    return this.programsSignal().find(p => p.id === id);
  }

  async create(program: Omit<TrainingProgram, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<TrainingProgram> {
    if (!this.auth.isAdmin()) throw new Error('Admin access required');
    const userId = this.auth.userId();
    const now = new Date().toISOString();
    const data = {
      ...program,
      userId: userId || '',
      createdAt: now,
      updatedAt: now
    };
    const id = await this.firestore.addDocument(this.COLLECTION, data);
    return { ...data, id } as TrainingProgram;
  }

  async update(id: string, changes: Partial<TrainingProgram>): Promise<void> {
    if (!this.auth.isAdmin()) throw new Error('Admin access required');
    await this.firestore.updateDocument(this.COLLECTION, id, {
      ...changes,
      updatedAt: new Date().toISOString()
    });
  }

  async delete(id: string): Promise<void> {
    if (!this.auth.isAdmin()) throw new Error('Admin access required');
    await this.firestore.deleteDocument(this.COLLECTION, id);
  }

  async setActive(id: string): Promise<void> {
    if (!this.auth.isAdmin()) throw new Error('Admin access required');
    const current = this.activeProgram();
    if (current && current.id !== id) {
      await this.firestore.updateDocument(this.COLLECTION, current.id, {
        isActive: false,
        updatedAt: new Date().toISOString()
      });
    }
    await this.firestore.updateDocument(this.COLLECTION, id, {
      isActive: true,
      updatedAt: new Date().toISOString()
    });
  }

  async applyProgram(id: string): Promise<void> {
    const program = this.getById(id);
    if (!program) return;

    const dates = this.calculateScheduleDates(program.sessionsPerWeek, program.days.length);

    for (let i = 0; i < program.days.length; i++) {
      const day = program.days[i];
      const exercises: Exercise[] = day.exercises.map(e => ({
        id: crypto.randomUUID(),
        name: e.exerciseName,
        sets: e.targetSets,
        reps: e.targetReps,
        weight: e.targetWeight,
        restTime: e.restTime
      }));

      await this.workoutService.add({
        name: `${program.name} - ${day.name}`,
        category: 'strength',
        exercises,
        scheduledDate: dates[i],
        programId: program.id
      });
    }
  }

  async advanceDay(id: string): Promise<void> {
    if (!this.auth.isAdmin()) throw new Error('Admin access required');
    const program = this.getById(id);
    if (!program) return;

    const nextDay = (program.currentDay || 0) + 1;
    const completedSessions = (program.completedSessions || 0) + 1;

    await this.firestore.updateDocument(this.COLLECTION, id, {
      currentDay: nextDay >= program.totalDays ? 0 : nextDay,
      completedSessions,
      updatedAt: new Date().toISOString()
    });
  }

  private calculateScheduleDates(sessionsPerWeek: number, totalDays: number): string[] {
    const weeklyPattern = this.getWeeklyPattern(sessionsPerWeek);
    const dates: string[] = [];
    const start = this.getNextMonday();

    let weekOffset = 0;
    let patternIndex = 0;

    while (dates.length < totalDays) {
      const date = new Date(start);
      date.setDate(date.getDate() + weekOffset * 7 + weeklyPattern[patternIndex]);
      dates.push(date.toISOString().split('T')[0]);

      patternIndex++;
      if (patternIndex >= weeklyPattern.length) {
        patternIndex = 0;
        weekOffset++;
      }
    }

    return dates;
  }

  private getWeeklyPattern(sessionsPerWeek: number): number[] {
    switch (sessionsPerWeek) {
      case 1: return [0];
      case 2: return [0, 3];
      case 3: return [0, 2, 4];
      case 4: return [0, 1, 3, 4];
      case 5: return [0, 1, 2, 3, 4];
      case 6: return [0, 1, 2, 3, 4, 5];
      case 7: return [0, 1, 2, 3, 4, 5, 6];
      default: return [0, 2, 4];
    }
  }

  private getNextMonday(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = today.getDay();
    const daysUntilMonday = day === 0 ? 1 : day === 1 ? 0 : 8 - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + daysUntilMonday);
    return monday;
  }

  private subscribeToPrograms(): void {
    this.unsubscribe = this.firestore.subscribe<TrainingProgram>(
      this.COLLECTION,
      (programs) => {
        programs.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
        this.programsSignal.set(programs);
      }
    );
  }

  private cleanupSubscription(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}
