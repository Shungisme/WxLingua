#!/usr/bin/env ts-node
/**
 * Database Setup Script
 *
 * Runs SQL scripts to setup the database:
 * 1. DROP all tables (clean slate)
 * 2. INIT tables (create schema)
 * 3. SEED data (populate with initial data)
 * 4. IMPORT radicals (214 Kangxi radicals)
 * 5. IMPORT dictionary (ALL 124k+ CC-CEDICT entries)
 *
 * Usage:
 *   npm run setup-db
 *   pnpm setup-db
 */

import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { importRadicals } from './import-radicals';
import { importCedict } from './import-cedict';

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
 * Additional setup steps after SQL scripts
 */
const IMPORT_STEPS = [
  {
    name: 'Import Radicals',
    description: 'Importing 214 Kangxi radicals',
    handler: importRadicals,
  },
  {
    name: 'Import Dictionary',
    description: 'Importing CC-CEDICT (ALL Chinese words)',
    handler: () => importCedict(0), // 0 = no limit, import all words
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

    // Disconnect from database before running Prisma imports
    await client.end();
    log.info('SQL scripts completed');
    console.log('');

    // Execute import steps (uses Prisma, needs to be after SQL scripts)
    const totalSteps = SQL_SCRIPTS.length + IMPORT_STEPS.length;

    for (let i = 0; i < IMPORT_STEPS.length; i++) {
      const step = IMPORT_STEPS[i];
      const stepNumber = SQL_SCRIPTS.length + i + 1;

      log.info(`[${stepNumber}/${totalSteps}] ${step.description}...`);

      try {
        await step.handler();
        log.success(`${step.name} completed`);
      } catch (error) {
        log.error(`${step.name} failed`);
        throw error;
      }

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
    // Ensure client is disconnected
    try {
      await client.end();
    } catch {
      // Already disconnected
    }
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
