import { defineFunction, secret } from '@aws-amplify/backend';

export const quizFunction = defineFunction({
  name: 'quiz',
  entry: './handler.ts',
  environment: { SESSION_COOKIE_SECRET: secret('SESSION_COOKIE_SECRET') },
});
