import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { t } from '../src/i18n.js';

const appSource = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const indexSource = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('home and mission templates use language keys instead of hardcoded Chinese UI copy', () => {
  assert.match(appSource, /tr\('homeIntro'\)/);
  assert.match(appSource, /tr\('guideLabel'\)/);
  assert.match(appSource, /tr\('editorDefaultTitle'\)/);
  assert.doesNotMatch(appSource, /\$\{tr\('appSubtitle'\)\}。先从 F 和 J 开始/);
  assert.doesNotMatch(appSource, />向导</);
  assert.doesNotMatch(appSource, /value="动物单词"/);
});

test('product name stays PixelType in Chinese and English UI copy', () => {
  assert.equal(t('zh-CN', 'appTitle'), 'PixelType');
  assert.equal(t('en-US', 'appTitle'), 'PixelType');
  assert.match(indexSource, /<title>PixelType<\/title>/);
  assert.doesNotMatch(appSource, /PixelType Island|像素打字岛/);
  assert.doesNotMatch(indexSource, /PixelType Island|像素打字岛/);
});
