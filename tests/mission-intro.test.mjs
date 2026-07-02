import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canAcceptMissionInput,
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
