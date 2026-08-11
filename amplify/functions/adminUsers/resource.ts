import { defineFunction } from '@aws-amplify/backend';

export const adminUsersFunction = defineFunction({
  name: 'admin-users',
  entry: './handler.ts',
});
