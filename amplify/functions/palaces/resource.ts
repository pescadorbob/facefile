import { defineFunction, secret } from '@aws-amplify/backend';

export const palacesFunction = defineFunction({
  name: 'palaces',
  entry: './handler.ts',
  environment: { SESSION_COOKIE_SECRET: secret('SESSION_COOKIE_SECRET') },
});
