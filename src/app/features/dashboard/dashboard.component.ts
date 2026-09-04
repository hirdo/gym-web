import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { WorkoutService } from '../../core/services/workout.service';
import { WorkoutSessionService } from '../../core/services/workout-session.service';
import { ProgramService } from '../../core/services/program.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  readonly auth = inject(AuthService);
  readonly workoutService = inject(WorkoutService);
  readonly sessionService = inject(WorkoutSessionService);
  readonly programService = inject(ProgramService);
}
