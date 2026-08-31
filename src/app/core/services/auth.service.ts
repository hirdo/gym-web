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

  constructor() {
    effect(() => {
      const event = this.keycloakSignal();

      if (event.type === KeycloakEventType.Ready) {
        const args = typeEventArgs<ReadyArgs>(event.args);
        this.isAuthenticated.set(!!args);
        this.isInitialized.set(true);
        if (args) {
          this.loadProfile();
        }
      }

      if (event.type === KeycloakEventType.AuthLogout) {
        this.isAuthenticated.set(false);
        this.userProfile.set(null);
      }

      if (event.type === KeycloakEventType.AuthSuccess) {
        this.isAuthenticated.set(true);
        this.loadProfile();
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

  private async loadProfile(): Promise<void> {
    try {
      const profile = await this.keycloak.loadUserProfile();
      this.userProfile.set(profile);
    } catch {
      // Profile loading may fail if user doesn't have view-profile role
    }
  }
}
