import { Database } from "sqlite3"
import { open, type Database as SQLiteDatabase } from "sqlite"
import { mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import bcrypt from "bcryptjs"

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
      category TEXT NOT NULL,
      isEnabled BOOLEAN NOT NULL DEFAULT 0
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

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL DEFAULT 'user',
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // Check if we need to add the isEnabled column to an existing database
  const tableInfo = await db.all("PRAGMA table_info(categories)")
  const hasIsEnabled = tableInfo.some((column) => column.name === "isEnabled")

  if (!hasIsEnabled) {
    // Add the isEnabled column to existing database
    await db.exec(`
      ALTER TABLE categories ADD COLUMN isEnabled BOOLEAN NOT NULL DEFAULT 0;
    `)
  }

  // Create admin user if it doesn't exist
  const adminExists = await db.get("SELECT * FROM users WHERE username = 'admin'")
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash("admin123", 10)
    await db.run(
      "INSERT INTO users (role, username, email, password) VALUES (?, ?, ?, ?)",
      "administrator",
      "admin",
      "admin@example.com",
      hashedPassword,
    )
    console.log("Admin user created")
  }

  return db
}
