const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { createDatabase } = require('../server/database.cjs');

test('SQLite conserve les utilisateurs, récits et données de l’application', () => {
  const file = path.join(os.tmpdir(), `nzassa-db-${process.pid}-${Date.now()}.sqlite`);
  const first = createDatabase(file);
  first.save({
    users: { u1: { id: 'u1', name: 'Awa' } },
    stories: { s1: { id: 's1', owner: 'u1', title: 'Conte' } },
    reports: [{ story: 's1', by: 'u1', reason: 'à vérifier', at: 1 }],
    appData: { language: 'fr' }
  });
  first.close();

  const second = createDatabase(file);
  const state = second.load();
  assert.equal(state.users.u1.name, 'Awa');
  assert.equal(state.stories.s1.title, 'Conte');
  assert.equal(state.reports[0].reason, 'à vérifier');
  assert.equal(state.appData.language, 'fr');
  second.close();
  for (const suffix of ['', '-shm', '-wal']) fs.rmSync(file + suffix, { force: true });
});
