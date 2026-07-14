import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const engineUrl = new URL('../src/game-modes.browser.js', import.meta.url);

function loadEngine() {
  assert.ok(existsSync(engineUrl), 'game-modes.browser.js should exist');
  const context = vm.createContext({ window: {} });
  vm.runInContext(readFileSync(engineUrl, 'utf8'), context);
  return context.window.PixelTypeGameModes;
}

function sequenceRandom(values) {
  let index = 0;
  return () => values[index++ % values.length];
}

test('letter rain exposes visibly different low and high speed ranges', () => {
  const { RAIN_DIFFICULTIES } = loadEngine();

  assert.equal(RAIN_DIFFICULTIES.low.minSpeed, 45);
  assert.equal(RAIN_DIFFICULTIES.low.maxSpeed, 75);
  assert.equal(RAIN_DIFFICULTIES.low.minSpawnMs, 900);
  assert.equal(RAIN_DIFFICULTIES.low.maxSpawnMs, 1500);
  assert.equal(RAIN_DIFFICULTIES.high.minSpeed, 90);
  assert.equal(RAIN_DIFFICULTIES.high.maxSpeed, 140);
  assert.equal(RAIN_DIFFICULTIES.high.minSpawnMs, 650);
  assert.equal(RAIN_DIFFICULTIES.high.maxSpawnMs, 1050);
  assert.ok(RAIN_DIFFICULTIES.low.maxSpeed < RAIN_DIFFICULTIES.high.minSpeed);
});

test('letter rain spawns a random uppercase drop inside the play field', () => {
  const { createRainSession, advanceRainSession } = loadEngine();
  const initial = createRainSession({ difficulty: 'low', now: 1000 });
  const random = sequenceRandom([0, 0.5, 1]);
  const next = advanceRainSession(initial, { now: 1000, fieldHeight: 500, random });
  const drop = next.drops[0];

  assert.equal(drop.letter, 'A');
  assert.equal(drop.xPercent, 50);
  assert.equal(drop.speed, 75);
  assert.equal(drop.y, 0);
  assert.ok(next.nextSpawnAt >= 1900 && next.nextSpawnAt <= 2500);
});

test('letter rain removes the lowest matching drop without caring about letter case', () => {
  const { createRainSession, hitRainLetter } = loadEngine();
  const session = {
    ...createRainSession({ difficulty: 'low', now: 0 }),
    drops: [
      { id: 1, letter: 'F', y: 40 },
      { id: 2, letter: 'F', y: 180 },
      { id: 3, letter: 'J', y: 160 },
    ],
  };
  const next = hitRainLetter(session, 'f');

  assert.equal(next.cleared, 1);
  assert.equal(next.feedback, 'hit');
  assert.deepEqual(Array.from(next.drops, (drop) => drop.id), [1, 3]);
});

test('letter rain ends exactly when the fifth drop reaches the animal floor', () => {
  const { createRainSession, advanceRainSession, RAIN_MISS_LIMIT } = loadEngine();
  const initial = {
    ...createRainSession({ difficulty: 'low', now: 0 }),
    misses: 4,
    nextSpawnAt: Number.POSITIVE_INFINITY,
    drops: [{ id: 1, letter: 'A', xPercent: 50, speed: 100, y: 95 }],
  };
  const next = advanceRainSession(initial, { now: 100, fieldHeight: 100, random: () => 0 });

  assert.equal(RAIN_MISS_LIMIT, 5);
  assert.equal(next.misses, 5);
  assert.equal(next.status, 'ended');
  assert.equal(next.drops.length, 0);
});

test('letter rain lands when the drop bottom reaches the blue-green boundary', () => {
  const { calculateRainLandingY } = loadEngine();

  assert.equal(calculateRainLandingY(500, 84), 306);
});

test('letter rain reports the horizontal position of each landed drop', () => {
  const { createRainSession, advanceRainSession } = loadEngine();
  const initial = {
    ...createRainSession({ difficulty: 'low', now: 0 }),
    nextSpawnAt: Number.POSITIVE_INFINITY,
    drops: [{ id: 1, letter: 'A', xPercent: 27, speed: 100, y: 95 }],
  };
  const next = advanceRainSession(initial, { now: 100, landingY: 100, random: () => 0 });

  assert.equal(next.misses, 1);
  assert.deepEqual(Array.from(next.landedDrops, (drop) => drop.xPercent), [27]);
});

test('bomb duration follows sentence length, round scaling, and tighter clamps', () => {
  const { calculateBombDurationMs } = loadEngine();

  assert.equal(calculateBombDurationMs('short', 1), 7000);
  assert.equal(calculateBombDurationMs('The black cat sleeps.', 1), 12580);
  assert.equal(calculateBombDurationMs('x'.repeat(100), 1), 16000);
  assert.equal(calculateBombDurationMs('x'.repeat(100), 2), 15040);
  assert.equal(calculateBombDurationMs('short', 20), 5500);
});

test('countdown defuse requires exact sentence characters', () => {
  const { createBombSession, typeBombKey } = loadEngine();
  const session = createBombSession({ sentences: ['A cat.'], random: () => 0, now: 1000 });
  const wrong = typeBombKey(session, 'a', { now: 1100, random: () => 0 });
  const correct = typeBombKey(wrong, 'A', { now: 1200, random: () => 0 });

  assert.equal(wrong.input, '');
  assert.equal(wrong.errors, 1);
  assert.equal(wrong.feedback, 'error');
  assert.equal(correct.input, 'A');
  assert.equal(correct.feedback, 'correct');
});

test('defusing a sentence starts a shorter second round', () => {
  const { createBombSession, typeBombKey } = loadEngine();
  const sentences = ['A.'];
  let session = createBombSession({ sentences, random: () => 0, now: 0 });
  const firstDuration = session.deadlineAt;
  session = typeBombKey(session, 'A', { now: 100, random: () => 0 });
  session = typeBombKey(session, '.', { now: 200, random: () => 0 });

  assert.equal(session.round, 2);
  assert.equal(session.defused, 1);
  assert.equal(session.input, '');
  assert.equal(session.feedback, 'defused');
  assert.ok(session.deadlineAt - 200 < firstDuration);
});

test('countdown defuse ends when the deadline is reached', () => {
  const { createBombSession, advanceBombSession, getElapsedSeconds } = loadEngine();
  const session = createBombSession({ sentences: ['Type.'], random: () => 0, now: 2000 });
  const next = advanceBombSession(session, session.deadlineAt);

  assert.equal(next.status, 'ended');
  assert.equal(next.feedback, 'exploded');
  assert.equal(getElapsedSeconds(next, 5000), 7);
});
