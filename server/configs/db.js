import '../env.js'
import {neon} from '@neondatabase/serverless'

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Trim whitespace and validate URL
const trimmedUrl = databaseUrl.trim();

// Validate that it looks like a valid PostgreSQL connection string
if (!trimmedUrl.startsWith('postgresql://') && !trimmedUrl.startsWith('postgres://')) {
  console.error('Invalid DATABASE_URL format:', trimmedUrl.substring(0, 50) + '...');
  throw new Error('DATABASE_URL must start with postgresql:// or postgres://');
}

try {
  const sql = neon(trimmedUrl);
  export default sql;
} catch (error) {
  console.error('Failed to initialize database connection:', error.message);
  console.error('DATABASE_URL preview:', trimmedUrl.substring(0, 100) + '...');
  throw error;
}
