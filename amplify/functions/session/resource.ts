import { defineFunction, secret } from '@aws-amplify/backend';

export const sessionFunction = defineFunction({
  name: 'session',
  entry: './handler.ts',
  environment: { SESSION_COOKIE_SECRET: secret('SESSION_COOKIE_SECRET') },
});
