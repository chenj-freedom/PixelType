(function () {
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const RAIN_MISS_LIMIT = 5;
  const RAIN_DIFFICULTIES = {
    low: {
      minSpeed: 45,
      maxSpeed: 75,
      minSpawnMs: 900,
      maxSpawnMs: 1500,
    },
    high: {
      minSpeed: 90,
      maxSpeed: 140,
      minSpawnMs: 650,
      maxSpawnMs: 1050,
    },
  };

  function createRainSession({ difficulty = 'low', now = 0 } = {}) {
    const selectedDifficulty = RAIN_DIFFICULTIES[difficulty] ? difficulty : 'low';
    return {
      status: 'playing',
      difficulty: selectedDifficulty,
      drops: [],
      landedDrops: [],
      misses: 0,
      cleared: 0,
      feedback: 'ready',
      startedAt: now,
      lastFrameAt: now,
      nextSpawnAt: now,
      nextDropId: 1,
    };
  }

  function advanceRainSession(session, { now, fieldHeight = 500, landingY = fieldHeight, random = Math.random } = {}) {
    if (session.status !== 'playing') return session;
    const elapsedMs = Math.max(0, now - session.lastFrameAt);
    const advancedDrops = session.drops.map((drop) => ({
      ...drop,
      y: drop.y + drop.speed * (elapsedMs / 1000),
    }));
    const missedDrops = advancedDrops.filter((drop) => drop.y >= landingY);
    const misses = session.misses + missedDrops.length;
    let next = {
      ...session,
      drops: advancedDrops.filter((drop) => drop.y < landingY),
      landedDrops: missedDrops,
      misses,
      lastFrameAt: now,
      feedback: missedDrops.length > 0 ? 'missed' : session.feedback,
      status: misses >= RAIN_MISS_LIMIT ? 'ended' : 'playing',
    };

    if (next.status === 'playing' && now >= next.nextSpawnAt) {
      next = spawnRainDrop(next, now, random);
    }
    return next;
  }

  function calculateRainLandingY(fieldHeight, dropHeight = 84, groundRatio = 0.78) {
    return Math.max(0, Math.round(fieldHeight * groundRatio - dropHeight));
  }

  function spawnRainDrop(session, now, random) {
    const config = RAIN_DIFFICULTIES[session.difficulty];
    const letter = LETTERS[randomIndex(LETTERS.length, random)];
    const xPercent = roundTo(5 + clampRandom(random()) * 90, 2);
    const speed = roundTo(randomRange(config.minSpeed, config.maxSpeed, random), 2);
    const spawnDelay = randomRange(config.minSpawnMs, config.maxSpawnMs, random);
    return {
      ...session,
      drops: [
        ...session.drops,
        {
          id: session.nextDropId,
          letter,
          xPercent,
          speed,
          y: 0,
        },
      ],
      nextDropId: session.nextDropId + 1,
      nextSpawnAt: now + spawnDelay,
    };
  }

  function hitRainLetter(session, rawKey) {
    if (session.status !== 'playing' || !/^[a-z]$/i.test(rawKey || '')) return session;
    const key = rawKey.toUpperCase();
    const matchingDrops = session.drops.filter((drop) => drop.letter === key);
    if (matchingDrops.length === 0) return { ...session, feedback: 'wrong-key' };
    const target = matchingDrops.reduce((lowest, drop) => drop.y > lowest.y ? drop : lowest);
    return {
      ...session,
      drops: session.drops.filter((drop) => drop.id !== target.id),
      cleared: session.cleared + 1,
      feedback: 'hit',
    };
  }

  function calculateBombDurationMs(sentence, round = 1) {
    const baseDuration = clamp(String(sentence || '').length * 480 + 2500, 7000, 16000);
    const scaledDuration = Math.round(baseDuration * (0.94 ** Math.max(0, round - 1)));
    return Math.max(5500, scaledDuration);
  }

  function createBombSession({ sentences = [], random = Math.random, now = 0 } = {}) {
    const sentencePool = sentences.map(String).filter(Boolean);
    const sentence = pickSentence(sentencePool, random);
    return {
      status: 'playing',
      sentences: sentencePool,
      sentence,
      input: '',
      round: 1,
      defused: 0,
      errors: 0,
      feedback: 'ready',
      startedAt: now,
      deadlineAt: now + calculateBombDurationMs(sentence, 1),
    };
  }

  function advanceBombSession(session, now) {
    if (session.status !== 'playing' || now < session.deadlineAt) return session;
    return {
      ...session,
      status: 'ended',
      feedback: 'exploded',
      endedAt: session.deadlineAt,
    };
  }

  function typeBombKey(session, rawKey, { now, random = Math.random } = {}) {
    if (session.status !== 'playing' || typeof rawKey !== 'string' || rawKey.length !== 1) return session;
    const expected = session.sentence[session.input.length];
    if (rawKey !== expected) {
      return {
        ...session,
        errors: session.errors + 1,
        feedback: 'error',
      };
    }

    const input = session.input + rawKey;
    if (input.length < session.sentence.length) {
      return { ...session, input, feedback: 'correct' };
    }

    const round = session.round + 1;
    const sentence = pickSentence(session.sentences, random);
    return {
      ...session,
      sentence,
      input: '',
      round,
      defused: session.defused + 1,
      feedback: 'defused',
      deadlineAt: now + calculateBombDurationMs(sentence, round),
    };
  }

  function getElapsedSeconds(session, now) {
    const end = session.status === 'ended' && Number.isFinite(session.endedAt) ? session.endedAt : now;
    return Math.max(0, Math.floor((end - session.startedAt) / 1000));
  }

  function pickSentence(sentences, random) {
    if (sentences.length === 0) return 'Type.';
    return sentences[randomIndex(sentences.length, random)];
  }

  function randomIndex(length, random) {
    return Math.min(length - 1, Math.floor(clampRandom(random()) * length));
  }

  function randomRange(min, max, random) {
    return min + clampRandom(random()) * (max - min);
  }

  function clampRandom(value) {
    return clamp(Number(value) || 0, 0, 1);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function roundTo(value, digits) {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
  }

  window.PixelTypeGameModes = {
    RAIN_DIFFICULTIES,
    RAIN_MISS_LIMIT,
    calculateRainLandingY,
    createRainSession,
    advanceRainSession,
    hitRainLetter,
    createBombSession,
    advanceBombSession,
    typeBombKey,
    calculateBombDurationMs,
    getElapsedSeconds,
  };
})();
