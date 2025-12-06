import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68ab56a3d9e7a878b1a32b44", 
  requiresAuth: true // Ensure authentication is required for all operations
});
