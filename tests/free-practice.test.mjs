import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  FREE_PRACTICE_MODES,
  FREE_PRACTICE_POOLS,
  buildFreePracticeMission,
} from '../src/free-practice.js';

function seededRandom(seed = 1) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

test('free practice exposes four random practice modes', () => {
  assert.deepEqual(
    FREE_PRACTICE_MODES.map((mode) => mode.id),
    ['letters', 'words', 'sentences', 'mixed'],
  );
  assert.ok(FREE_PRACTICE_POOLS.letters.length >= 30);
  assert.ok(FREE_PRACTICE_POOLS.words.length >= 80);
  assert.ok(FREE_PRACTICE_POOLS.sentences.length >= 30);
});

test('word mode builds a standalone random mission from the word pool', () => {
  const mission = buildFreePracticeMission('words', seededRandom(2));

  assert.equal(mission.id, 'free-practice-words');
  assert.equal(mission.freePracticeMode, 'words');
  assert.equal(mission.isFreePractice, true);
  assert.equal(mission.targets.length, 10);
  assert.ok(mission.targets.every((target) => FREE_PRACTICE_POOLS.words.includes(target)));
});

test('sentence mode includes spaces and punctuation keys when needed', () => {
  const mission = buildFreePracticeMission('sentences', seededRandom(3));

  assert.equal(mission.targets.length, 6);
  assert.ok(mission.targets.some((target) => target.includes(' ')));
  assert.ok(mission.focusKeys.includes('Space'));
  assert.ok(mission.focusKeys.includes('.'));
});

test('mixed mode combines letters, words, and sentences', () => {
  const mission = buildFreePracticeMission('mixed', seededRandom(4));
  const fromLetters = mission.targets.some((target) => FREE_PRACTICE_POOLS.letters.includes(target));
  const fromWords = mission.targets.some((target) => FREE_PRACTICE_POOLS.words.includes(target));
  const fromSentences = mission.targets.some((target) => FREE_PRACTICE_POOLS.sentences.includes(target));

  assert.equal(mission.targets.length, 10);
  assert.equal(fromLetters, true);
  assert.equal(fromWords, true);
  assert.equal(fromSentences, true);
});

test('unknown free practice mode falls back to mixed practice', () => {
  const mission = buildFreePracticeMission('missing-mode', seededRandom(5));

  assert.equal(mission.id, 'free-practice-mixed');
  assert.equal(mission.freePracticeMode, 'mixed');
});
