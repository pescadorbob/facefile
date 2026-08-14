import { defineFunction, secret } from '@aws-amplify/backend';

export const notificationsFunction = defineFunction({
  name: 'notifications',
  entry: './handler.ts',
  environment: { SESSION_COOKIE_SECRET: secret('SESSION_COOKIE_SECRET') },
});
