import { NhostClient } from '@nhost/nhost-js';

export const nhost = new NhostClient({
  subdomain: process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN || 'your-subdomain',
  region: process.env.NEXT_PUBLIC_NHOST_REGION || 'your-region'
});