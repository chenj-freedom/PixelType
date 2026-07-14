const PROGRESS_KEY = 'pixeltype.progress.v1';
const LANGUAGE_KEY = 'pixeltype.language.v1';
const AUDIO_KEY = 'pixeltype.audio.v1';
const UNLOCK_REQUIRED_STARS = 2;

export function createMemoryStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

export function getBrowserStorage() {
  return globalThis.localStorage;
}

export function loadProgress(storage = getBrowserStorage()) {
  const fallback = {
    unlockedLevelIds: ['level-1'],
    levelStars: {},
  };
  return readJson(storage, PROGRESS_KEY, fallback);
}

export function saveProgress(storage, progress) {
  storage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  return progress;
}

export function saveLevelResult(storage, levelId, result, orderedLevelIds) {
  const progress = loadProgress(storage);
  const previousStars = progress.levelStars[levelId] || 0;
  const levelStars = {
    ...progress.levelStars,
    [levelId]: Math.max(previousStars, result.stars || 0),
  };
  const unlockedLevelIds = new Set(progress.unlockedLevelIds);

  if (shouldUnlockNextLevel(result)) {
    const currentIndex = orderedLevelIds.indexOf(levelId);
    const nextLevelId = orderedLevelIds[currentIndex + 1];
    if (nextLevelId) unlockedLevelIds.add(nextLevelId);
  }

  return saveProgress(storage, {
    levelStars,
    unlockedLevelIds: [...unlockedLevelIds],
  });
}

function shouldUnlockNextLevel(result) {
  return result.passed && (result.stars || 0) >= UNLOCK_REQUIRED_STARS;
}

export function loadLanguage(storage = getBrowserStorage()) {
  return storage.getItem(LANGUAGE_KEY) || 'zh-CN';
}

export function saveLanguage(storage, language) {
  storage.setItem(LANGUAGE_KEY, language);
  return language;
}

export function loadAudioEnabled(storage = getBrowserStorage()) {
  return storage.getItem(AUDIO_KEY) !== 'false';
}

export function saveAudioEnabled(storage, enabled) {
  storage.setItem(AUDIO_KEY, String(enabled));
  return enabled;
}

function readJson(storage, key, fallback) {
  try {
    const value = storage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}
