import { defineFunction, secret } from '@aws-amplify/backend';

export const dashboardFunction = defineFunction({
  name: 'dashboard',
  entry: './handler.ts',
  environment: { SESSION_COOKIE_SECRET: secret('SESSION_COOKIE_SECRET') },
});
