import { Database } from "sqlite3"
import { open, type Database as SQLiteDatabase } from "sqlite"
import { mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

let db: SQLiteDatabase | null = null

export async function getDb() {
  if (db) return db

  // Ensure the data directory exists
  const dataDir = path.join(process.cwd(), "data")
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true })
  }

  // Open the database
  db = await open({
    filename: path.join(dataDir, "quizdb.sqlite"),
    driver: Database,
  })

  // Initialize the database schema
  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      answer TEXT NOT NULL,
      isCorrect BOOLEAN NOT NULL DEFAULT 0,
      FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
    );
  `)

  return db
}
