import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MembershipService, MembershipTier } from '../../core/services/membership.service';

@Component({
  selector: 'app-membership',
  standalone: true,
  templateUrl: './membership.component.html',
  styleUrl: './membership.component.scss'
})
export class MembershipComponent {
  readonly auth = inject(AuthService);
  readonly membershipService = inject(MembershipService);
  private readonly router = inject(Router);

  readonly currentPlan = computed(() => this.membershipService.membership());

  async upgradeTo(tier: MembershipTier): Promise<void> {
    await this.membershipService.upgrade(tier);
  }

  async downgrade(): Promise<void> {
    await this.membershipService.upgrade('basic');
  }

  isCurrentPlan(tier: MembershipTier): boolean {
    return this.membershipService.membership() === tier;
  }
}
