import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ApiConfigService } from '../services/api-config.service';

/**
 * Rewrites `/api/...` requests to the deployed API Gateway endpoint and
 * marks them credentialed. Frontend (Amplify Hosting) and API (API Gateway)
 * are different origins, so the session cookie is only sent at all if
 * withCredentials is set here — see functions/_shared/session.ts for the
 * matching SameSite=None; Secure cookie attributes on the backend side.
 */
export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) return next(req);

  const apiUrl = inject(ApiConfigService).apiUrl;
  return next(req.clone({ url: `${apiUrl}${req.url.slice('/api'.length)}`, withCredentials: true }));
};
