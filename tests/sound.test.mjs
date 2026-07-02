import test from 'node:test';
import assert from 'node:assert/strict';
import { getFeedbackSound } from '../src/sound.js';

test('uses a bright short tone for correct key feedback', () => {
  const sound = getFeedbackSound('correct');

  assert.equal(sound.type, 'sine');
  assert.equal(sound.frequency, 660);
  assert.equal(sound.duration, 0.055);
  assert.equal(sound.gain > 0, true);
});

test('uses a lower square tone for error key feedback', () => {
  const sound = getFeedbackSound('error');

  assert.equal(sound.type, 'square');
  assert.equal(sound.frequency, 180);
  assert.equal(sound.duration, 0.09);
  assert.equal(sound.gain > 0, true);
});
