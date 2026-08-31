import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { AuthGuardData, createAuthGuard } from 'keycloak-angular';

const isAccessAllowed = async (
  route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot,
  authData: AuthGuardData
): Promise<boolean | UrlTree> => {
  const { authenticated, grantedRoles } = authData;

  if (!authenticated) {
    authData.keycloak.login();
    return false;
  }

  const requiredRoles = route.data['roles'] as string[] | undefined;
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const hasRequiredRole = requiredRoles.some((role) =>
    grantedRoles.realmRoles.includes(role) ||
    Object.values(grantedRoles.resourceRoles).some((roles) =>
      roles.includes(role)
    )
  );

  return hasRequiredRole || inject(Router).parseUrl('/');
};

export const canActivateAuth = createAuthGuard<CanActivateFn>(isAccessAllowed);
