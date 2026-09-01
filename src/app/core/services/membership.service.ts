import { inject, Injectable, signal, effect } from '@angular/core';
import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';

export type MembershipTier = 'basic' | 'premium' | 'elite';

@Injectable({ providedIn: 'root' })
export class MembershipService {
  private readonly auth = inject(AuthService);
  private readonly firestore = inject(FirestoreService);

  readonly membership = signal<MembershipTier>('basic');

  constructor() {
    effect(() => {
      const userId = this.auth.userId();
      if (userId) {
        this.loadMembership(userId);
      }
    });
  }

  async upgrade(tier: MembershipTier): Promise<void> {
    this.membership.set(tier);
    const userId = this.auth.userId();
    if (userId) {
      await this.firestore.updateDocument('users', userId, { membership: tier });
    }
  }

  async getMembershipForUser(userId: string): Promise<MembershipTier> {
    const doc = await this.firestore.getDocument<{ membership?: string }>('users', userId);
    const tier = doc?.membership;
    if (tier && ['basic', 'premium', 'elite'].includes(tier)) {
      return tier as MembershipTier;
    }
    return 'basic';
  }

  async setMembershipForUser(userId: string, tier: MembershipTier): Promise<void> {
    await this.firestore.updateDocument('users', userId, { membership: tier });
    const currentUserId = this.auth.userId();
    if (currentUserId === userId) {
      this.membership.set(tier);
    }
  }

  private async loadMembership(userId: string): Promise<void> {
    const tier = await this.getMembershipForUser(userId);
    this.membership.set(tier);
  }
}
