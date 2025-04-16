'use client';

import fs from 'fs/promises';
import path from 'path';

interface Props {
  params: {
    id: string;
  };
}

export default async function PWAPage({ params }: Props) {
  const { id } = params;

  try {
    const filePath = path.join(process.cwd(), 'pwa-configs', `${id}.json`);
    const pwaConfig = JSON.parse(await fs.readFile(filePath, 'utf-8'));

    return (
      <div>
        <h1>PWA Configuration</h1>
        <p>Unique ID: {id}</p>
        <p>Original URL: {pwaConfig.originalUrl}</p>
        {/* Display any other PWA configurations here. */}
      </div>
    );
  } catch (e: any) {
    console.error("Error reading PWA configuration: ", e);
    return <div>PWA configuration not found.</div>;
  }
}
