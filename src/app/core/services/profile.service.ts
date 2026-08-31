import { inject, Injectable, computed } from '@angular/core';
import { AuthService } from './auth.service';
import { UserProfile } from '../models/user-profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly auth = inject(AuthService);

  readonly profile = computed<UserProfile | null>(() => {
    const kcProfile = this.auth.userProfile();
    if (!kcProfile) return null;

    return {
      id: kcProfile.id || '',
      email: kcProfile.email || '',
      firstName: kcProfile.firstName || '',
      lastName: kcProfile.lastName || '',
      membershipType: 'basic',
      joinDate: kcProfile.createdTimestamp
        ? new Date(kcProfile.createdTimestamp).toISOString()
        : undefined
    };
  });
}
