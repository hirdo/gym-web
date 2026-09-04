import { inject, Injectable, signal, computed, effect, OnDestroy } from '@angular/core';
import { TrainingProgram } from '../models/workout.model';
import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';
import { where, Unsubscribe } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class ProgramService implements OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly firestore = inject(FirestoreService);
  private readonly COLLECTION = 'programs';
  private readonly programsSignal = signal<TrainingProgram[]>([]);
  private unsubscribe: Unsubscribe | null = null;

  readonly programs = this.programsSignal.asReadonly();

  readonly activeProgram = computed(() =>
    this.programsSignal().find(p => p.isActive)
  );

  readonly totalPrograms = computed(() => this.programsSignal().length);

  constructor() {
    effect(() => {
      const userId = this.auth.userId();
      this.cleanupSubscription();
      if (userId) {
        this.subscribeToPrograms(userId);
      } else {
        this.programsSignal.set([]);
      }
    });
  }

  ngOnDestroy(): void {
    this.cleanupSubscription();
  }

  getById(id: string): TrainingProgram | undefined {
    return this.programsSignal().find(p => p.id === id);
  }

  async create(program: Omit<TrainingProgram, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<TrainingProgram> {
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
    await this.firestore.updateDocument(this.COLLECTION, id, {
      ...changes,
      updatedAt: new Date().toISOString()
    });
  }

  async delete(id: string): Promise<void> {
    await this.firestore.deleteDocument(this.COLLECTION, id);
  }

  async setActive(id: string): Promise<void> {
    const current = this.activeProgram();
    if (current && current.id !== id) {
      await this.update(current.id, { isActive: false });
    }
    await this.update(id, { isActive: true });
  }

  async advanceDay(id: string): Promise<void> {
    const program = this.getById(id);
    if (!program) return;

    const nextDay = (program.currentDay || 0) + 1;
    const completedSessions = (program.completedSessions || 0) + 1;

    await this.update(id, {
      currentDay: nextDay >= program.totalDays ? 0 : nextDay,
      completedSessions
    });
  }

  private subscribeToPrograms(userId: string): void {
    this.unsubscribe = this.firestore.subscribe<TrainingProgram>(
      this.COLLECTION,
      (programs) => {
        programs.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
        this.programsSignal.set(programs);
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
