import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');

// Only try to load .env file if it exists
// In Kubernetes, environment variables are injected via secrets and don't need .env file
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else if (process.env.NODE_ENV !== 'production') {
  // Only warn in development if .env is missing
  console.warn('⚠️  .env file not found - using environment variables only');
}
