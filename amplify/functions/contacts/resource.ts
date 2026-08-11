import { defineFunction, secret } from '@aws-amplify/backend';

export const contactsFunction = defineFunction({
  name: 'contacts',
  entry: './handler.ts',
  timeoutSeconds: 30,
  environment: { SESSION_COOKIE_SECRET: secret('SESSION_COOKIE_SECRET') },
});
