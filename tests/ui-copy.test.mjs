import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { t } from '../src/i18n.js';

const appSource = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const indexSource = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const storageSource = readFileSync(new URL('../src/storage.js', import.meta.url), 'utf8');
const levelsSource = readFileSync(new URL('../src/levels.js', import.meta.url), 'utf8');
const i18nSource = readFileSync(new URL('../src/i18n.js', import.meta.url), 'utf8');
const styleSource = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

test('home and mission templates use language keys for localized UI copy', () => {
  assert.match(appSource, /tr\('homeIntro'\)/);
  assert.doesNotMatch(appSource, /tr\('typingTarget'\)/);
  assert.doesNotMatch(appSource, /tr\('typedInput'\)/);
  assert.doesNotMatch(appSource, /tr\('nextKey'\)/);
  assert.match(appSource, /tr\('gameModes'\)/);
  assert.doesNotMatch(appSource, /\$\{tr\('appSubtitle'\)\}。先从 F 和 J 开始/);
  assert.doesNotMatch(appSource, />向导</);
  assert.doesNotMatch(appSource, /value="动物单词"/);
});

test('game modes are the third home activity throughout the active product', () => {
  assert.match(appSource, /assets\/sprites\/button-games\.png/);
  assert.match(appSource, /data-action="show-games"/);
  assert.match(appSource, /gameModes:\s*'游戏模式'/);
  assert.match(appSource, /letterRain:\s*'字母雨滴'/);
  assert.match(appSource, /countdownDefuse:\s*'倒计时拆弹'/);

  [appSource, storageSource, levelsSource, i18nSource, styleSource]
    .forEach((source) => assert.doesNotMatch(source, /custom level/i));
});

test('letter rain is wired to the browser engine and offers low and high speed play', () => {
  assert.match(indexSource, /<script src="src\/game-modes\.browser\.js\?v=game-modes-2" defer><\/script>/);
  assert.ok(indexSource.indexOf('game-modes.browser.js') < indexSource.indexOf('app.js'));
  assert.match(appSource, /RAIN_MISS_LIMIT/);
  assert.match(appSource, /createRainSession/);
  assert.match(appSource, /advanceRainSession/);
  assert.match(appSource, /hitRainLetter/);
  assert.match(appSource, /data-action="start-letter-rain" data-difficulty="low"/);
  assert.match(appSource, /data-action="start-letter-rain" data-difficulty="high"/);
  assert.match(appSource, /function renderLetterRain\(\)/);
  assert.match(appSource, /function handleLetterRainKey\(event\)/);
  assert.match(appSource, /assets\/sprites\/game-raindrop\.png/);
  assert.match(styleSource, /\.rain-arena/);
  assert.match(styleSource, /\.rain-drop/);
  assert.match(styleSource, /\.animal-floor/);
});

test('countdown defuse is wired to exact sentence typing and countdown UI', () => {
  assert.match(appSource, /createBombSession/);
  assert.match(appSource, /advanceBombSession/);
  assert.match(appSource, /typeBombKey/);
  assert.match(appSource, /data-action="start-countdown-defuse"/);
  assert.match(appSource, /function renderCountdownDefuse\(\)/);
  assert.match(appSource, /function handleCountdownDefuseKey\(event\)/);
  assert.match(appSource, /FREE_PRACTICE_POOLS\.sentences/);
  assert.match(appSource, /assets\/sprites\/game-bomb\.png/);
  assert.match(styleSource, /\.bomb-timer/);
  assert.match(styleSource, /\.bomb-sentence-progress/);
});

test('countdown defuse owns one continuous audio engine and one explosion cue', () => {
  assert.match(indexSource, /<script src="src\/bomb-audio-engine\.browser\.js\?v=bomb-engine-1" defer><\/script>/);
  assert.ok(indexSource.indexOf('bomb-audio-engine.browser.js') < indexSource.indexOf('app.js'));
  assert.match(appSource, /createBombAudioEngine\(\)/);
  assert.match(appSource, /function startCountdownDefuse\(\)[\s\S]*bombAudioEngine\.start\(\)/);
  assert.match(appSource, /state\.bombSession\.status === 'ended'[\s\S]*bombAudioEngine\.playExplosion\(\)/);
  assert.match(appSource, /function stopGameLoop\(\)[\s\S]*bombAudioEngine\.stop\(\)/);
});

test('letter rain starts one continuous audio engine and reuses its landing buffer', () => {
  assert.match(indexSource, /<script src="src\/rain-audio-engine\.browser\.js\?v=rain-engine-4" defer><\/script>/);
  assert.ok(indexSource.indexOf('rain-audio-engine.browser.js') < indexSource.indexOf('app.js'));
  assert.match(appSource, /createRainAudioEngine\(\)/);
  assert.match(appSource, /function startLetterRain\(difficulty = 'low'\)[\s\S]*rainAudioEngine\.start\(\)/);
  assert.match(appSource, /function playRainLandingSound\(\)[\s\S]*rainAudioEngine\.playLanding\(\)/);
  assert.match(appSource, /function stopGameLoop\(\)[\s\S]*rainAudioEngine\.stop\(\)/);
  assert.match(appSource, /state\.rainSession\.status === 'ended'[\s\S]*stopGameLoop\(\)/);
});

test('letter rain no longer uses the rejected native media audio path', () => {
  assert.doesNotMatch(indexSource, /audio-cues\.browser\.js/);
  assert.doesNotMatch(appSource, /createReusableAudioCue|rainLandingCue|rain-land\.wav/);
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
  assert.match(indexSource, /<script src="src\/free-practice\.browser\.js\?v=keyboard-caps-state-2" defer><\/script>/);
  assert.match(indexSource, /<script src="src\/app\.js\?v=bomb-experience-1" defer><\/script>/);
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

test('adventure map explains and enforces the two-star unlock rule', () => {
  assert.match(appSource, /const UNLOCK_REQUIRED_STARS = 2;/);
  assert.match(appSource, /unlockHint:/);
  assert.match(appSource, /result-unlock-note/);
  assert.match(appSource, /function shouldUnlockNextLevel\(result\)/);
  assert.match(appSource, /result\.passed && \(result\.stars \|\| 0\) >= UNLOCK_REQUIRED_STARS/);
});
