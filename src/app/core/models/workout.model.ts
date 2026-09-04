export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  restTime?: number;
  notes?: string;
  imageUrl?: string;
}

export interface Workout {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  exercises: Exercise[];
  scheduledDate?: string;
  completedDate?: string;
  durationMinutes?: number;
  category: WorkoutCategory;
  programId?: string;
  createdAt: string;
  updatedAt: string;
}

export type WorkoutCategory =
  | 'strength'
  | 'cardio'
  | 'flexibility'
  | 'hiit'
  | 'custom';

export type MuscleGroup =
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps'
  | 'forearms' | 'core' | 'quads' | 'hamstrings' | 'glutes' | 'calves';

export type Equipment =
  | 'barbell' | 'dumbbell' | 'machine' | 'cable'
  | 'bodyweight' | 'kettlebell' | 'band' | 'other';

export interface ExerciseTemplate {
  id: string;
  name: string;
  category: WorkoutCategory;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles?: MuscleGroup[];
  equipment: Equipment;
  imageUrl?: string;
  instructions?: string;
  isCustom?: boolean;
  createdBy?: string;
}

export interface SetRecord {
  setNumber: number;
  weight: number;
  reps: number;
  completedAt: string;
  isWarmup?: boolean;
}

export interface ExerciseSession {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetReps: number;
  targetWeight?: number;
  restTime?: number;
  sets: SetRecord[];
}

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutId?: string;
  programId?: string;
  dayNumber?: number;
  name: string;
  startedAt: string;
  completedAt?: string;
  durationSeconds?: number;
  exercises: ExerciseSession[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramDay {
  dayNumber: number;
  name: string;
  exercises: {
    exerciseId: string;
    exerciseName: string;
    targetSets: number;
    targetReps: number;
    targetWeight?: number;
    restTime?: number;
  }[];
}

export type ProgramDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface TrainingProgram {
  id: string;
  userId: string;
  name: string;
  description?: string;
  difficulty: ProgramDifficulty;
  totalDays: number;
  sessionsPerWeek: number;
  days: ProgramDay[];
  isActive?: boolean;
  currentDay?: number;
  completedSessions?: number;
  createdAt: string;
  updatedAt: string;
}
