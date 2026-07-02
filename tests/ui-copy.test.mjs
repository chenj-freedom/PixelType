import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const appSource = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

test('home and mission templates use language keys instead of hardcoded Chinese UI copy', () => {
  assert.match(appSource, /tr\('homeIntro'\)/);
  assert.match(appSource, /tr\('guideLabel'\)/);
  assert.match(appSource, /tr\('editorDefaultTitle'\)/);
  assert.doesNotMatch(appSource, /\$\{tr\('appSubtitle'\)\}。先从 F 和 J 开始/);
  assert.doesNotMatch(appSource, />向导</);
  assert.doesNotMatch(appSource, /value="动物单词"/);
});
