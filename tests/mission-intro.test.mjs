import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  canAcceptMissionInput,
  cancelActiveSpeechOnAudioOff,
  getIntroFallbackMinimumMs,
  getInitialIntroStatus,
  shouldBeginPracticeFromKey,
  shouldCompleteIntroFallback,
} from '../src/mission-intro.js';

const appSource = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

test('blocks typing input while the level introduction is active', () => {
  assert.equal(canAcceptMissionInput('speaking'), false);
  assert.equal(canAcceptMissionInput('ready'), false);
  assert.equal(canAcceptMissionInput('playing'), true);
});

test('starts in ready state when audio cannot be spoken', () => {
  assert.equal(getInitialIntroStatus({ audioEnabled: true, canSpeak: true }), 'speaking');
  assert.equal(getInitialIntroStatus({ audioEnabled: false, canSpeak: true }), 'ready');
  assert.equal(getInitialIntroStatus({ audioEnabled: true, canSpeak: false }), 'ready');
});

test('starts practice from keyboard only after the introduction is ready', () => {
  assert.equal(shouldBeginPracticeFromKey('Enter', 'ready'), true);
  assert.equal(shouldBeginPracticeFromKey(' ', 'ready'), true);
  assert.equal(shouldBeginPracticeFromKey('Space', 'ready'), true);
  assert.equal(shouldBeginPracticeFromKey('Spacebar', 'ready'), true);
  assert.equal(shouldBeginPracticeFromKey('Enter', 'speaking'), false);
  assert.equal(shouldBeginPracticeFromKey('f', 'ready'), false);
  assert.equal(shouldBeginPracticeFromKey('Enter', 'playing'), false);
});

test('mission keydown starts ready intro with Enter or Space before typing input is accepted', () => {
  assert.match(appSource, /document\.addEventListener\('keydown', \(event\) => {[\s\S]*shouldBeginPracticeFromKey\(event\.key, state\.introStatus\)[\s\S]*beginPractice\(\);[\s\S]*if \(!canAcceptMissionInput\(state\.introStatus\)\) return;/);
});

test('does not complete fallback while browser speech is still active', () => {
  assert.equal(shouldCompleteIntroFallback({ speaking: true, pending: false }), false);
  assert.equal(shouldCompleteIntroFallback({ speaking: false, pending: true }), false);
  assert.equal(shouldCompleteIntroFallback({ speaking: false, pending: false }), true);
});

test('does not complete fallback before the estimated intro speech duration', () => {
  const minimumMs = getIntroFallbackMinimumMs('This level is only about F and J. Feel the tiny bumps on the keys.');

  assert.ok(minimumMs > 1200);
  assert.equal(shouldCompleteIntroFallback({
    speaking: false,
    pending: false,
    elapsedMs: minimumMs - 1,
    minimumMs,
  }), false);
  assert.equal(shouldCompleteIntroFallback({
    speaking: false,
    pending: false,
    elapsedMs: minimumMs,
    minimumMs,
  }), true);
});

test('cancels active speech immediately when audio is turned off', () => {
  let cancelCount = 0;
  const speechSynthesis = {
    cancel() {
      cancelCount += 1;
    },
  };

  assert.equal(cancelActiveSpeechOnAudioOff(false, speechSynthesis), true);
  assert.equal(cancelCount, 1);

  assert.equal(cancelActiveSpeechOnAudioOff(true, speechSynthesis), false);
  assert.equal(cancelCount, 1);

  assert.equal(cancelActiveSpeechOnAudioOff(false, null), false);
  assert.equal(cancelCount, 1);
});
