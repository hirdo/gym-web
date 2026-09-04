import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProgramService } from '../../core/services/program.service';

@Component({
  selector: 'app-program-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './program-list.component.html',
  styleUrl: './program-list.component.scss'
})
export class ProgramListComponent {
  readonly programService = inject(ProgramService);

  progressPercent(currentDay: number | undefined, totalDays: number): number {
    return totalDays > 0 ? Math.round(((currentDay || 0) / totalDays) * 100) : 0;
  }
}
