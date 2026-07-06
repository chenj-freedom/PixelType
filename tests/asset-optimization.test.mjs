import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const optimizerUrl = new URL('../scripts/optimize-png-assets.mjs', import.meta.url);

test('asset optimizer is available for sprite and reference PNG resources', () => {
  assert.equal(packageJson.scripts['optimize:assets'], 'node scripts/optimize-png-assets.mjs');
  assert.equal(existsSync(optimizerUrl), true);

  const optimizerSource = readFileSync(optimizerUrl, 'utf8');
  assert.match(optimizerSource, /assets['"],\s*['"]sprites/);
  assert.match(optimizerSource, /assets['"],\s*['"]reference/);
});
