import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { MembershipService, MembershipTier } from '../../core/services/membership.service';

interface MockUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  membershipType: MembershipTier;
  joinDate: string;
  lastLogin: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {
  readonly auth = inject(AuthService);
  readonly membershipService = inject(MembershipService);
  readonly activeTab = signal<'users' | 'stats'>('users');

  readonly users = signal<MockUser[]>([
    {
      id: '1',
      username: 'testuser',
      email: 'testuser@gymtrack.app',
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      status: 'active',
      membershipType: 'basic',
      joinDate: '2025-01-15T00:00:00Z',
      lastLogin: '2026-08-30T14:22:00Z'
    },
    {
      id: '2',
      username: 'admin',
      email: 'admin@gymtrack.app',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      status: 'active',
      membershipType: 'premium',
      joinDate: '2024-12-01T00:00:00Z',
      lastLogin: '2026-08-31T09:15:00Z'
    },
    {
      id: '3',
      username: 'janefit',
      email: 'jane@gymtrack.app',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'user',
      status: 'active',
      membershipType: 'elite',
      joinDate: '2025-03-10T00:00:00Z',
      lastLogin: '2026-08-28T18:45:00Z'
    },
    {
      id: '4',
      username: 'mike_iron',
      email: 'mike@gymtrack.app',
      firstName: 'Mike',
      lastName: 'Johnson',
      role: 'user',
      status: 'suspended',
      membershipType: 'basic',
      joinDate: '2025-06-20T00:00:00Z',
      lastLogin: '2026-07-15T10:30:00Z'
    },
    {
      id: '5',
      username: 'sarah_lifts',
      email: 'sarah@gymtrack.app',
      firstName: 'Sarah',
      lastName: 'Williams',
      role: 'user',
      status: 'active',
      membershipType: 'premium',
      joinDate: '2025-08-05T00:00:00Z',
      lastLogin: '2026-08-31T07:00:00Z'
    }
  ]);

  get activeUsers(): number {
    return this.users().filter(u => u.status === 'active').length;
  }

  get suspendedUsers(): number {
    return this.users().filter(u => u.status === 'suspended').length;
  }

  get adminCount(): number {
    return this.users().filter(u => u.role === 'admin').length;
  }

  toggleUserStatus(userId: string): void {
    this.users.update(users =>
      users.map(u =>
        u.id === userId
          ? { ...u, status: u.status === 'active' ? 'suspended' as const : 'active' as const }
          : u
      )
    );
  }

  toggleUserRole(userId: string): void {
    this.users.update(users =>
      users.map(u =>
        u.id === userId
          ? { ...u, role: u.role === 'admin' ? 'user' as const : 'admin' as const }
          : u
      )
    );
  }

  changeMembership(userId: string, tier: MembershipTier): void {
    this.users.update(users =>
      users.map(u =>
        u.id === userId ? { ...u, membershipType: tier } : u
      )
    );
    this.membershipService.setMembershipForUser(userId, tier);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
