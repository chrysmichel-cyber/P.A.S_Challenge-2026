'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const EMPTY_STATE = () => ({ users: {}, stories: {}, reports: [], appData: {} });
let tempId = 0;

const PYTHON = String.raw`
import json
import sqlite3
import sys

filename, action = sys.argv[1:3]
db = sqlite3.connect(filename)
db.execute("PRAGMA foreign_keys = ON")
db.executescript("""
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT, username_key TEXT, created INTEGER, data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY, owner TEXT NOT NULL, data TEXT NOT NULL,
  FOREIGN KEY (owner) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  story TEXT NOT NULL, reporter TEXT NOT NULL, reason TEXT NOT NULL, created INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS app_data (
  key TEXT PRIMARY KEY, value TEXT NOT NULL, updated INTEGER NOT NULL
);
""")
# Add searchable account fields to databases created by earlier versions.
columns = {row[1] for row in db.execute("PRAGMA table_info(users)")}
for name, kind in (("username", "TEXT"), ("username_key", "TEXT"), ("created", "INTEGER")):
    if name not in columns:
        db.execute("ALTER TABLE users ADD COLUMN " + name + " " + kind)
db.execute("CREATE UNIQUE INDEX IF NOT EXISTS users_username_key_idx ON users(username_key) WHERE username_key IS NOT NULL")

if action == "load":
    state = {"users": {}, "stories": {}, "reports": [], "appData": {}}
    for data, in db.execute("SELECT data FROM users"):
        user = json.loads(data)
        state["users"][user["id"]] = user
    for data, in db.execute("SELECT data FROM stories"):
        story = json.loads(data)
        state["stories"][story["id"]] = story
    for story, reporter, reason, created in db.execute(
        "SELECT story, reporter, reason, created FROM reports ORDER BY id"
    ):
        state["reports"].append({"story": story, "by": reporter, "reason": reason, "at": created})
    for key, value in db.execute("SELECT key, value FROM app_data"):
        state["appData"][key] = json.loads(value)
    print(json.dumps(state, ensure_ascii=False))
elif action == "save":
    state = json.load(sys.stdin)
    with db:
        db.execute("DELETE FROM reports")
        db.execute("DELETE FROM stories")
        db.execute("DELETE FROM users")
        db.execute("DELETE FROM app_data")
        db.executemany(
            "INSERT INTO users (id, username, username_key, created, data) VALUES (?, ?, ?, ?, ?)",
            [(user["id"], user.get("name"), user.get("key"), user.get("created"), json.dumps(user, ensure_ascii=False))
             for user in state.get("users", {}).values()]
        )
        db.executemany(
            "INSERT INTO stories (id, owner, data) VALUES (?, ?, ?)",
            [(story["id"], story["owner"], json.dumps(story, ensure_ascii=False))
             for story in state.get("stories", {}).values()]
        )
        db.executemany(
            "INSERT INTO reports (story, reporter, reason, created) VALUES (?, ?, ?, ?)",
            [(item["story"], item["by"], item["reason"], item["at"]) for item in state.get("reports", [])]
        )
        app_data = dict(state.get("appData", {}))
        app_data["schema_version"] = 1
        db.executemany(
            "INSERT INTO app_data (key, value, updated) VALUES (?, ?, strftime('%s','now'))",
            [(key, json.dumps(value, ensure_ascii=False)) for key, value in app_data.items()]
        )
else:
    raise ValueError("Action SQLite inconnue")
db.close()
`;

function runPython(filename, action, state) {
  const input = action === 'save' ? JSON.stringify(state) : undefined;
  try {
    const output = execFileSync('python', ['-c', PYTHON, filename, action], {
      input,
      encoding: 'utf8',
      windowsHide: true
    });
    return action === 'load' ? JSON.parse(output) : undefined;
  } catch (error) {
    const detail = error.stderr ? String(error.stderr).trim() : error.message;
    throw new Error('Impossible d’utiliser SQLite via Python : ' + detail);
  }
}

function isSqliteFile(file) {
  try {
    return fs.readFileSync(file).subarray(0, 16).toString() === 'SQLite format 3\0';
  } catch (e) {
    return false;
  }
}

function createDatabase(file) {
  const temporary = !file;
  const filename = file || path.join(os.tmpdir(), `nzassa-${process.pid}-${++tempId}.sqlite`);
  let legacy = null;
  if (fs.existsSync(filename) && !isSqliteFile(filename)) {
    try {
      legacy = JSON.parse(fs.readFileSync(filename, 'utf8'));
      fs.renameSync(filename, filename + '.json.bak');
    } catch (e) {
      throw new Error('Impossible de lire l’ancienne base de données JSON : ' + e.message);
    }
  }
  fs.mkdirSync(path.dirname(filename), { recursive: true });

  const load = () => {
    const state = runPython(filename, 'load');
    if (legacy) {
      Object.assign(state.users, legacy.users || {});
      Object.assign(state.stories, legacy.stories || {});
      if (Array.isArray(legacy.reports)) state.reports.push(...legacy.reports);
    }
    return state;
  };
  const save = state => runPython(filename, 'save', state);
  if (legacy) save(load());

  return {
    file: filename,
    load,
    save,
    close: () => { if (temporary) fs.rmSync(filename, { force: true }); }
  };
}

module.exports = { createDatabase };
