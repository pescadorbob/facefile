import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { apiUrlInterceptor } from './interceptors/api-url.interceptor';
import { ApiConfigService } from './services/api-config.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiUrlInterceptor])),
    // Resolves the deployed API endpoint from amplify_outputs.json before
    // the app renders, so every /api/... call already has somewhere real to go.
    provideAppInitializer(() => inject(ApiConfigService).load()),
  ],
};
