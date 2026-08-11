import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { SessionService } from '../services/session.service';

export const profileGuard: CanActivateFn = () => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  return sessionService.checkSession().pipe(
    map(() => true),
    catchError(() => of(router.createUrlTree(['/select-profile']))),
  );
};
