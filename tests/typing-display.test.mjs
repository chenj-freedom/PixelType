import test from 'node:test';
import assert from 'node:assert/strict';
import { getTypingDisplay } from '../src/typing-display.js';

test('builds a clear typing status without placeholder characters', () => {
  const display = getTypingDisplay('jfjf', 'jfj');

  assert.deepEqual(display, {
    target: 'jfjf',
    typedInput: 'jfj',
    nextKey: 'f',
    nextKeyLabel: 'f',
  });
});

test('keeps typed input empty before the child starts typing', () => {
  const display = getTypingDisplay('fj', '');

  assert.deepEqual(display, {
    target: 'fj',
    typedInput: '',
    nextKey: 'f',
    nextKeyLabel: 'f',
  });
});

test('shows a visible label when the next key is space', () => {
  const display = getTypingDisplay('The dog is happy.', 'The');

  assert.deepEqual(display, {
    target: 'The dog is happy.',
    typedInput: 'The',
    nextKey: ' ',
    nextKeyLabel: '空格',
  });
});
