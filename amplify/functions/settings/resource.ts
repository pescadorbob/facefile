import { defineFunction, secret } from '@aws-amplify/backend';

export const settingsFunction = defineFunction({
  name: 'settings',
  entry: './handler.ts',
  environment: { SESSION_COOKIE_SECRET: secret('SESSION_COOKIE_SECRET') },
});
