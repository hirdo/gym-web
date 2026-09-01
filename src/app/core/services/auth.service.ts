import { inject, Injectable, signal, effect } from '@angular/core';
import Keycloak from 'keycloak-js';
import {
  KEYCLOAK_EVENT_SIGNAL,
  KeycloakEventType,
  typeEventArgs,
  ReadyArgs
} from 'keycloak-angular';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly keycloak = inject(Keycloak);
  private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);

  readonly isAuthenticated = signal(false);
  readonly userProfile = signal<Keycloak.KeycloakProfile | null>(null);
  readonly isInitialized = signal(false);
  readonly isAdmin = signal(false);
  readonly profileLoaded = signal(false);
  readonly profileError = signal(false);
  readonly userId = signal<string | null>(null);

  constructor() {
    effect(() => {
      const event = this.keycloakSignal();

      if (event.type === KeycloakEventType.Ready) {
        const args = typeEventArgs<ReadyArgs>(event.args);
        this.isAuthenticated.set(!!args);
        this.isInitialized.set(true);
        if (args) {
          this.extractUserId();
          this.loadProfile();
          this.checkAdminRole();
        } else {
          this.profileLoaded.set(true);
        }
      }

      if (event.type === KeycloakEventType.AuthLogout) {
        this.isAuthenticated.set(false);
        this.userProfile.set(null);
        this.isAdmin.set(false);
        this.userId.set(null);
        this.profileLoaded.set(false);
        this.profileError.set(false);
      }

      if (event.type === KeycloakEventType.AuthSuccess) {
        this.isAuthenticated.set(true);
        this.extractUserId();
        this.loadProfile();
        this.checkAdminRole();
      }
    });
  }

  login(): void {
    this.keycloak.login();
  }

  logout(): void {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }

  getToken(): string | undefined {
    return this.keycloak.token;
  }

  getUserName(): string {
    const profile = this.userProfile();
    if (profile) {
      return profile.firstName || profile.username || 'User';
    }
    return 'User';
  }

  hasRole(role: string): boolean {
    return this.keycloak.hasRealmRole(role) ||
      this.keycloak.hasResourceRole(role);
  }

  private extractUserId(): void {
    const sub = this.keycloak.tokenParsed?.['sub'] as string | undefined;
    this.userId.set(sub || this.keycloak.subject || null);
  }

  private checkAdminRole(): void {
    this.isAdmin.set(this.keycloak.hasRealmRole('admin'));
  }

  private async loadProfile(): Promise<void> {
    try {
      const profile = await this.keycloak.loadUserProfile();
      this.userProfile.set(profile);
      this.profileError.set(false);
    } catch {
      this.profileError.set(true);
      const token = this.keycloak.tokenParsed;
      if (token) {
        this.userProfile.set({
          id: (token['sub'] as string) || '',
          username: (token['preferred_username'] as string) || '',
          email: (token['email'] as string) || '',
          firstName: (token['given_name'] as string) || '',
          lastName: (token['family_name'] as string) || '',
        });
      }
    } finally {
      this.profileLoaded.set(true);
    }
  }
}
