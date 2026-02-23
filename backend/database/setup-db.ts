#!/usr/bin/env ts-node
/**
 * Database Setup Script
 *
 * Runs SQL scripts to setup the database:
 * 1. DROP all tables (clean slate)
 * 2. INIT tables (create schema)
 * 3. SEED data (populate with initial data)
 *
 * Usage:
 *   npm run setup-db
 *   pnpm setup-db
 */

import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) =>
    console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg: string) =>
    console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg: string) => console.error(`${colors.red}✗${colors.reset} ${msg}`),
};

/**
 * Database configuration from environment variables
 */
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || process.env.POSTGRES_DB || 'wxlingua',
  user: process.env.DB_USER || process.env.POSTGRES_USER || 'postgres',
  password:
    process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || 'password',
};

/**
 * SQL script files to execute in order
 */
const SQL_SCRIPTS = [
  {
    name: 'Drop Tables',
    file: 'drop-tables.sql',
    description: 'Removing existing tables',
  },
  {
    name: 'Init Tables',
    file: 'init-tables.sql',
    description: 'Creating schema',
  },
  {
    name: 'Seed Data',
    file: 'seed-tables.sql',
    description: 'Populating initial data',
  },
];

/**
 * Read SQL file content
 */
function readSqlFile(filename: string): string {
  const scriptPath = path.join(__dirname, filename);

  if (!fs.existsSync(scriptPath)) {
    throw new Error(`SQL script not found: ${scriptPath}`);
  }

  return fs.readFileSync(scriptPath, 'utf-8');
}

/**
 * Execute SQL script
 */
async function executeSqlScript(
  client: Client,
  scriptName: string,
  sqlContent: string,
): Promise<void> {
  try {
    await client.query(sqlContent);
    log.success(`${scriptName} completed`);
  } catch (error) {
    log.error(`${scriptName} failed`);
    throw error;
  }
}

/**
 * Ensure database exists, create if it doesn't
 */
async function ensureDatabaseExists(): Promise<void> {
  // Connect to default 'postgres' database to check/create target database
  const postgresClient = new Client({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: 'postgres', // Connect to default database
  });

  try {
    await postgresClient.connect();

    // Check if database exists
    const result = await postgresClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbConfig.database],
    );

    if (result.rows.length === 0) {
      // Database doesn't exist, create it
      log.info(`Creating database '${dbConfig.database}'...`);
      await postgresClient.query(`CREATE DATABASE ${dbConfig.database}`);
      log.success(`Database '${dbConfig.database}' created`);
    } else {
      log.info(`Database '${dbConfig.database}' already exists`);
    }
  } finally {
    await postgresClient.end();
  }
}

/**
 * Confirm destructive action in non-CI environments
 */
async function confirmAction(): Promise<boolean> {
  // Skip confirmation in CI/CD environments
  if (process.env.CI === 'true' || process.env.SKIP_CONFIRMATION === 'true') {
    return true;
  }

  // In Node.js, we'll just show a warning and proceed
  // For interactive confirmation, you'd need readline module
  log.warning('This will DELETE ALL DATA in the database!');
  log.warning('Set SKIP_CONFIRMATION=true to skip this warning');

  // Auto-proceed after 3 seconds
  return new Promise((resolve) => {
    let countdown = 3;
    const interval = setInterval(() => {
      if (countdown > 0) {
        process.stdout.write(
          `\rProceeding in ${countdown}... (Ctrl+C to cancel)`,
        );
        countdown--;
      } else {
        clearInterval(interval);
        process.stdout.write('\r\n');
        resolve(true);
      }
    }, 1000);
  });
}

/**
 * Main setup function
 */
async function setupDatabase(): Promise<void> {
  const startTime = Date.now();

  console.log('');
  console.log('='.repeat(50));
  console.log('WxLingua Database Setup');
  console.log('='.repeat(50));
  console.log('');

  log.info(`Database: ${dbConfig.database}`);
  log.info(`Host: ${dbConfig.host}:${dbConfig.port}`);
  log.info(`User: ${dbConfig.user}`);
  console.log('');

  // Confirm action
  const confirmed = await confirmAction();
  if (!confirmed) {
    log.info('Setup cancelled');
    process.exit(0);
  }

  console.log('');

  // Ensure database exists
  await ensureDatabaseExists();
  console.log('');

  // Create database client
  const client = new Client(dbConfig);

  try {
    // Connect to database
    log.info('Connecting to database...');
    await client.connect();
    log.success('Connected to database');
    console.log('');

    // Execute SQL scripts in order
    for (let i = 0; i < SQL_SCRIPTS.length; i++) {
      const script = SQL_SCRIPTS[i];

      log.info(`[${i + 1}/${SQL_SCRIPTS.length}] ${script.description}...`);

      const sqlContent = readSqlFile(script.file);
      await executeSqlScript(client, script.name, sqlContent);

      console.log('');
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('='.repeat(50));
    log.success(`Database setup completed in ${duration}s`);
    console.log('='.repeat(50));
    console.log('');
    log.info('Login credentials:');
    console.log('  Admin: admin@wxlingua.com / admin123');
    console.log('  User:  user@example.com / admin123');
    console.log('');
  } catch (error) {
    console.log('');
    console.log('='.repeat(50));
    log.error('Database setup failed');
    console.log('='.repeat(50));
    console.log('');

    if (error instanceof Error) {
      log.error(error.message);
      if (error.stack) {
        console.error(error.stack);
      }
    }

    process.exit(1);
  } finally {
    // Disconnect from database
    await client.end();
    log.info('Disconnected from database');
  }
}

// Run setup
if (require.main === module) {
  setupDatabase().catch((error) => {
    log.error('Unhandled error:');
    console.error(error);
    process.exit(1);
  });
}

export { setupDatabase };
