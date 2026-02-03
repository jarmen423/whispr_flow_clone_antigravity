#!/usr/bin/env node
// Prebuild script for Vercel - reads Firebase config and generates env vars

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'chromebook-extension', 'firebase-config.json');

if (!fs.existsSync(configPath)) {
  console.warn('⚠️  firebase-config.json not found, skipping env generation');
  process.exit(0);
}

try {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  // Extract project ID from database URL (e.g., "whispr-chromebook" from "https://whispr-chromebook-default-rtdb.firebaseio.com/")
  const projectId = config.firebaseDbUrl ? config.firebaseDbUrl.match(/https:\/\/(.*)-default-rtdb/)?.[1] || '' : '';

  const envVars = {
    NEXT_PUBLIC_FIREBASE_API_KEY: config.firebaseApiKey || '',
    NEXT_PUBLIC_FIREBASE_DATABASE_URL: config.firebaseDbUrl || '',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: projectId ? `${projectId}.firebaseapp.com` : '',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: projectId,
  };

  // Generate .env.production file
  const envContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  fs.writeFileSync(path.join(__dirname, '..', '.env.production'), envContent);

  console.log('✅ Generated .env.production from firebase-config.json');
  console.log('   Project:', envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
} catch (err) {
  console.error('❌ Error reading firebase-config.json:', err.message);
  process.exit(1);
}
