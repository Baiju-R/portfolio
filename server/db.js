import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "content.db");

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tag TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    bullets TEXT DEFAULT "",
    link_label TEXT DEFAULT "",
    link_url TEXT DEFAULT "",
    image TEXT DEFAULT "",
    images TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    details TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS blogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    link TEXT NOT NULL,
    images TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS certifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    issuer TEXT DEFAULT "",
    year TEXT DEFAULT "",
    description TEXT DEFAULT "",
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS about (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    heading TEXT DEFAULT "",
    summary TEXT DEFAULT "",
    bullets TEXT DEFAULT "",
    photo TEXT DEFAULT "",
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS featured_skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    details TEXT DEFAULT "",
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS hero_content (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    tagline TEXT DEFAULT "",
    headline TEXT DEFAULT "",
    subheading TEXT DEFAULT "",
    badges TEXT DEFAULT "",
    metrics TEXT DEFAULT "",
    primary_label TEXT DEFAULT "",
    primary_url TEXT DEFAULT "",
    secondary_label TEXT DEFAULT "",
    secondary_url TEXT DEFAULT "",
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

function ensureColumn(table, column, definition) {
  const info = db.prepare(`PRAGMA table_info(${table})`).all();
  const exists = info.some((col) => col.name === column);
  if (!exists) {
    db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
  }
}

ensureColumn("projects", "images", "TEXT DEFAULT '[]'");
ensureColumn("blogs", "images", "TEXT DEFAULT '[]'");

const seedAbout = db.prepare(`
  INSERT OR IGNORE INTO about (id, heading, summary, bullets, photo)
  VALUES (
    1,
    'From command line to business outcomes.',
    'I focus on the engineering fundamentals that matter: maintainable automation, predictable delivery, and visibility the entire company can rely on.',
    'Self-documenting CI/CD blueprints\nProduction-ready Kubernetes guardrails\nSLO dashboards tied to business metrics',
    ''
  )
`);

seedAbout.run();

const seedHero = db.prepare(`
  INSERT OR IGNORE INTO hero_content (
    id,
    tagline,
    headline,
    subheading,
    badges,
    metrics,
    primary_label,
    primary_url,
    secondary_label,
    secondary_url
  ) VALUES (
    1,
    'Platform & Reliability Partner',
    'Make launches feel calm and repeatable.',
    'I design guardrails, CI/CD, and observability stacks so engineering orgs can ship trustworthy code without firefights.',
    'Kubernetes Ops\nGitHub Actions\nTerraform\nSRE Coaching',
    '40+|services on shared pipelines\n15|K8s clusters with SLOs\n<20m|mean recovery target',
    'Book a working session',
    '#contact',
    'Download résumé',
    'assets/Aarav-Patel-Resume.pdf'
  )
`);

seedHero.run();

export default db;
