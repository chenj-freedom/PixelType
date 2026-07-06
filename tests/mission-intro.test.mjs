import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canAcceptMissionInput,
  cancelActiveSpeechOnAudioOff,
  getIntroFallbackMinimumMs,
  getInitialIntroStatus,
  shouldCompleteIntroFallback,
} from '../src/mission-intro.js';

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
