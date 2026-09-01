import { inject, Injectable, signal, effect } from '@angular/core';
import { AuthService } from './auth.service';

export type MembershipTier = 'basic' | 'premium' | 'elite';

@Injectable({ providedIn: 'root' })
export class MembershipService {
  private readonly auth = inject(AuthService);
  private readonly STORAGE_PREFIX = 'gymtrack-membership-';

  readonly membership = signal<MembershipTier>('basic');

  constructor() {
    effect(() => {
      const userId = this.auth.userId();
      if (userId) {
        this.loadMembership(userId);
      }
    });
  }

  upgrade(tier: MembershipTier): void {
    this.membership.set(tier);
    this.saveMembership();
  }

  getMembershipForUser(userId: string): MembershipTier {
    try {
      const data = localStorage.getItem(this.STORAGE_PREFIX + userId);
      if (data && ['basic', 'premium', 'elite'].includes(data)) {
        return data as MembershipTier;
      }
    } catch {}
    return 'basic';
  }

  setMembershipForUser(userId: string, tier: MembershipTier): void {
    try {
      localStorage.setItem(this.STORAGE_PREFIX + userId, tier);
    } catch {}
    const currentUserId = this.auth.userId();
    if (currentUserId === userId) {
      this.membership.set(tier);
    }
  }

  private loadMembership(userId: string): void {
    this.membership.set(this.getMembershipForUser(userId));
  }

  private saveMembership(): void {
    const userId = this.auth.userId();
    if (!userId) return;
    try {
      localStorage.setItem(this.STORAGE_PREFIX + userId, this.membership());
    } catch {}
  }
}
