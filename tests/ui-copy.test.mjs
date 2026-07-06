import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { t } from '../src/i18n.js';

const appSource = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const indexSource = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('home and mission templates use language keys for localized UI copy', () => {
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
test('language switch labels use native target language names', () => {
  assert.equal(t('zh-CN', 'switchToEnglish'), 'English');
  assert.equal(t('en-US', 'switchToChinese'), '中文');
  assert.equal(t('en-US', 'languageChinese'), '中文');
  assert.equal((appSource.match(/switchToChinese:\s*'中文'/g) || []).length, 2);
  assert.equal((appSource.match(/languageChinese:\s*'中文'/g) || []).length, 2);
});

test('switching language refreshes the cached mission intro text', () => {
  assert.match(appSource, /function refreshIntroTextForLanguage\(\)/);
  assert.match(appSource, /function toggleLanguage\(\)[\s\S]*refreshIntroTextForLanguage\(\);[\s\S]*render\(\);/);
  assert.match(appSource, /if \(levelData\.npcLineKey\) return tr\(levelData\.npcLineKey\);/);
});

test('completed mission results are frozen after the first settlement', () => {
  assert.match(appSource, /function handleMissionKey\(key\)[\s\S]*if \(state\.result \|\| state\.session\.isComplete\) return;/);
  assert.match(appSource, /if \(state\.session\.isComplete && !state\.result\)[\s\S]*state\.result = getSessionStats\(state\.session\);/);
});
