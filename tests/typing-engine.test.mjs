import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createTypingSession,
  getSessionStats,
  handleTypingKey,
} from '../src/typing-engine.js';

test('advances to the next target after each target is typed correctly', () => {
  let session = createTypingSession({
    targets: ['fj', 'jf'],
    startedAt: 0,
    now: 0,
  });

  session = handleTypingKey(session, 'f', 1000);
  assert.equal(session.currentInput, 'f');
  assert.equal(session.currentTargetIndex, 0);

  session = handleTypingKey(session, 'j', 2000);
  assert.equal(session.currentInput, '');
  assert.equal(session.currentTargetIndex, 1);
  assert.equal(session.completedTargets, 1);

  session = handleTypingKey(session, 'j', 3000);
  session = handleTypingKey(session, 'f', 4000);

  assert.equal(session.isComplete, true);
  assert.equal(session.completedTargets, 2);
});

test('records mistakes without advancing the target', () => {
  let session = createTypingSession({
    targets: ['cat'],
    startedAt: 0,
    now: 0,
  });

  session = handleTypingKey(session, 'x', 1000);

  assert.equal(session.currentInput, '');
  assert.equal(session.errors, 1);
  assert.equal(session.totalKeys, 1);
  assert.equal(session.currentTargetIndex, 0);
  assert.equal(session.feedback, 'error');
});

test('computes accuracy, words per minute, and stars', () => {
  let session = createTypingSession({
    targets: ['cat'],
    targetAccuracy: 90,
    startedAt: 0,
    now: 0,
  });

  session = handleTypingKey(session, 'c', 1000);
  session = handleTypingKey(session, 'a', 2000);
  session = handleTypingKey(session, 't', 10000);

  const stats = getSessionStats(session, 10000);

  assert.equal(stats.accuracy, 100);
  assert.equal(stats.stars, 3);
  assert.equal(stats.passed, true);
  assert.equal(stats.wpm > 0, true);
});
