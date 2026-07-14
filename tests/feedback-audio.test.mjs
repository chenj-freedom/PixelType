import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const appSource = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const indexSource = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('loads and creates one shared feedback audio engine before the application', () => {
  assert.match(
    indexSource,
    /<script src="src\/feedback-audio-engine\.browser\.js\?v=audible-prime-1" defer><\/script>/,
  );
  assert.ok(indexSource.indexOf('feedback-audio-engine.browser.js') < indexSource.indexOf('app.js'));
  assert.match(
    appSource,
    /const \{ createFeedbackAudioEngine \} = window\.PixelTypeFeedbackAudioEngine;/,
  );
  assert.equal((appSource.match(/createFeedbackAudioEngine\(\)/g) || []).length, 1);
});

test('finishes a real audible prime before mission typing is accepted', () => {
  assert.match(
    appSource,
    /async function beginPractice\(\) \{[\s\S]*state\.introStatus = 'starting';[\s\S]*await feedbackAudioEngine\.prime\('mission-correct', 0\.04\);[\s\S]*state\.introStatus = 'playing'/,
  );
});

test('all feedback kinds play through the shared engine without transient oscillators', () => {
  assert.match(
    appSource,
    /async function playFeedbackSound\(kind\) \{[\s\S]*if \(feedbackAudioEngine\.play\(kind\)\) return;[\s\S]*await feedbackAudioEngine\.start\(\);[\s\S]*feedbackAudioEngine\.play\(kind\);[\s\S]*\n  \}/,
  );
  assert.doesNotMatch(appSource, /primeFeedbackAudio|createOscillator\(\)/);
});
