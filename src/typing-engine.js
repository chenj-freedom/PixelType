export function createTypingSession({
  targets,
  targetAccuracy = 85,
  startedAt = Date.now(),
  now = Date.now(),
}) {
  return {
    targets,
    targetAccuracy,
    startedAt,
    updatedAt: now,
    currentTargetIndex: 0,
    currentInput: '',
    completedTargets: 0,
    correctKeys: 0,
    totalKeys: 0,
    errors: 0,
    maxCombo: 0,
    combo: 0,
    feedback: 'ready',
    isComplete: targets.length === 0,
  };
}

export function getCurrentTarget(session) {
  return session.targets[session.currentTargetIndex] || '';
}

export function handleTypingKey(session, rawKey, now = Date.now()) {
  if (session.isComplete || rawKey.length !== 1) {
    return { ...session, updatedAt: now };
  }

  const key = rawKey.toLowerCase();
  const target = getCurrentTarget(session).toLowerCase();
  const expected = target[session.currentInput.length];
  const next = {
    ...session,
    totalKeys: session.totalKeys + 1,
    updatedAt: now,
  };

  if (key !== expected) {
    return {
      ...next,
      errors: next.errors + 1,
      combo: 0,
      feedback: 'error',
    };
  }

  const currentInput = session.currentInput + key;
  const combo = session.combo + 1;
  const completedThisTarget = currentInput.length === target.length;
  const completedTargets = completedThisTarget
    ? session.completedTargets + 1
    : session.completedTargets;
  const currentTargetIndex = completedThisTarget
    ? session.currentTargetIndex + 1
    : session.currentTargetIndex;
  const isComplete = completedTargets >= session.targets.length;

  return {
    ...next,
    currentInput: completedThisTarget ? '' : currentInput,
    completedTargets,
    currentTargetIndex,
    correctKeys: next.correctKeys + 1,
    combo,
    maxCombo: Math.max(session.maxCombo, combo),
    feedback: completedThisTarget ? 'target-complete' : 'correct',
    isComplete,
  };
}

export function getSessionStats(session, now = Date.now()) {
  const elapsedMinutes = Math.max((now - session.startedAt) / 60000, 1 / 60);
  const accuracy = session.totalKeys === 0
    ? 100
    : Math.round((session.correctKeys / session.totalKeys) * 100);
  const typedWords = session.correctKeys / 5;
  const wpm = Math.round(typedWords / elapsedMinutes);
  const passed = session.isComplete && accuracy >= session.targetAccuracy;
  const stars = passed ? getStarsForAccuracy(accuracy) : 0;

  return {
    accuracy,
    wpm,
    stars,
    passed,
    elapsedSeconds: Math.round((now - session.startedAt) / 1000),
  };
}

function getStarsForAccuracy(accuracy) {
  if (accuracy >= 97) return 3;
  if (accuracy >= 90) return 2;
  return 1;
}
