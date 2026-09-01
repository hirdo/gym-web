import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { WorkoutService } from '../../core/services/workout.service';
import { MembershipService } from '../../core/services/membership.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  readonly auth = inject(AuthService);
  readonly profileService = inject(ProfileService);
  readonly workoutService = inject(WorkoutService);
  readonly membershipService = inject(MembershipService);
}
