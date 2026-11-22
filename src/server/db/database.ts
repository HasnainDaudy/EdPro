import initSqlJs, { Database as SqlDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';

let dbInstance: SqlDatabase | null = null;
let dbPath: string = '';

export interface QueryResultRow {
  [key: string]: any;
}

export async function getDatabase(): Promise<SqlDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  const SQL = await initSqlJs();
  const dataDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  dbPath = path.join(dataDir, 'edpro.sqlite');

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    dbInstance = new SQL.Database(fileBuffer);
  } else {
    dbInstance = new SQL.Database();
    persistDatabase();
  }

  return dbInstance;
}

export function persistDatabase(): void {
  if (!dbInstance || !dbPath) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (err) {
    console.error('Failed to persist database to disk:', err);
  }
}

/**
 * Execute a query with parameters and return array of objects
 */
export async function query<T = QueryResultRow>(sql: string, params: any[] = []): Promise<T[]> {
  const db = await getDatabase();
  const stmt = db.prepare(sql);
  
  if (params && params.length > 0) {
    stmt.bind(params);
  }

  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as unknown as T);
  }
  stmt.free();
  return results;
}

/**
 * Execute a single-row query
 */
export async function queryOne<T = QueryResultRow>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Execute an INSERT / UPDATE / DELETE statement and persist to disk
 */
export async function execute(sql: string, params: any[] = []): Promise<void> {
  const db = await getDatabase();
  db.run(sql, params);
  persistDatabase();
}

/**
 * Execute multiple statements in a single batch (e.g. migration script)
 */
export async function executeBatch(sqlBatch: string): Promise<void> {
  const db = await getDatabase();
  db.run(sqlBatch);
  persistDatabase();
}
