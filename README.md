# Simple Bookmark Manager  

A Next.js bookmark manager using Nhost’s PostgreSQL backend.  

## Setup  

### Prerequisites  
- Node.js (v14+)  
- Npm/Yarn  
- Nhost account ([nhost.io](https://nhost.io))  

### Installation  
```bash
git clone https://github.com/yourusername/simple-bookmark-manager.git
cd simple-bookmark-manager
npm install  # or yarn install

NEXT_PUBLIC_NHOST_SUBDOMAIN=your-subdomain  
NEXT_PUBLIC_NHOST_REGION=your-region  

import { NhostClient } from "@nhost/nhost-js";

export const nhost = new NhostClient({
  subdomain: process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN || "your-subdomain",
  region: process.env.NEXT_PUBLIC_NHOST_REGION || "your-region",
});

npm run dev  # or yarn dev
