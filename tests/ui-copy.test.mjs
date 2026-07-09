import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { t } from '../src/i18n.js';

const appSource = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const indexSource = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('home and mission templates use language keys for localized UI copy', () => {
  assert.match(appSource, /tr\('homeIntro'\)/);
  assert.doesNotMatch(appSource, /tr\('typingTarget'\)/);
  assert.doesNotMatch(appSource, /tr\('typedInput'\)/);
  assert.doesNotMatch(appSource, /tr\('nextKey'\)/);
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

test('home sprite tooltips describe audio and language button states', () => {
  assert.equal(t('zh-CN', 'audioOnTooltip'), '音量开');
  assert.equal(t('zh-CN', 'audioOffTooltip'), '音量关');
  assert.equal(t('zh-CN', 'switchToChineseTooltip'), '切换到中文');
  assert.equal(t('zh-CN', 'switchToEnglishTooltip'), '切换到英文');
  assert.equal(t('en-US', 'audioOnTooltip'), 'Sound On');
  assert.equal(t('en-US', 'audioOffTooltip'), 'Sound Off');
  assert.equal(t('en-US', 'switchToChineseTooltip'), 'Switch to 中文');
  assert.equal(t('en-US', 'switchToEnglishTooltip'), 'Switch to English');
});

test('completed mission results are frozen after the first settlement', () => {
  assert.match(appSource, /function handleMissionKey\(key\)[\s\S]*if \(state\.result \|\| state\.session\.isComplete\) return;/);
  assert.match(appSource, /if \(state\.session\.isComplete && !state\.result\)[\s\S]*state\.result = getSessionStats\(state\.session\);/);
});

test('free practice starts a standalone mission instead of level one', () => {
  assert.match(indexSource, /<script src="src\/free-practice\.browser\.js\?v=keyboard-caps-state" defer><\/script>/);
  assert.match(indexSource, /<script src="src\/app\.js\?v=keyboard-caps-state" defer><\/script>/);
  assert.match(appSource, /if \(action === 'start-free'\) showFreePractice\(\);/);
  assert.match(appSource, /if \(action === 'start-free-mode'\) startFreePractice\(button\.dataset\.mode\);/);
  assert.doesNotMatch(appSource, /if \(action === 'start-free'\) startLevel\('level-1'\);/);
  assert.match(appSource, /function renderFreePractice\(\)/);
  assert.match(appSource, /FREE_PRACTICE_MODES\.map/);
  assert.match(appSource, /function startFreePractice\(modeId = 'mixed'\)/);
  assert.match(appSource, /buildFreePracticeMission\(modeId\)/);
});

test('free practice retry and finish do not write map progress', () => {
  assert.match(appSource, /if \(action === 'retry-level'\) \{\s*if \(state\.currentLevel\?\.isFreePractice\) startFreePractice\(state\.currentLevel\.freePracticeMode\);[\s\S]*else startLevel\(state\.currentLevel\.id\);[\s\S]*\}/);
  assert.match(appSource, /const continueLabel = state\.currentLevel\?\.isFreePractice \? tr\('backFreePractice'\) : tr\('resultContinue'\);/);
  assert.match(appSource, /if \(state\.currentLevel\?\.isFreePractice\) \{\s*showFreePractice\(\);[\s\S]*return;[\s\S]*\}/);
});
