import { defineFunction, secret } from '@aws-amplify/backend';

export const tutorialFunction = defineFunction({
  name: 'tutorial',
  entry: './handler.ts',
  environment: { SESSION_COOKIE_SECRET: secret('SESSION_COOKIE_SECRET') },
});
