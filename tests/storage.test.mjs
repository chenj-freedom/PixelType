import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createMemoryStorage,
  loadCustomLevels,
  loadProgress,
  saveCustomLevel,
  saveLevelResult,
} from '../src/storage.js';

test('saves the best stars for a level and unlocks the next level', () => {
  const storage = createMemoryStorage();
  const progress = saveLevelResult(storage, 'level-1', { stars: 2, passed: true }, [
    'level-1',
    'level-2',
  ]);

  assert.equal(progress.levelStars['level-1'], 2);
  assert.equal(progress.unlockedLevelIds.includes('level-2'), true);

  const loaded = loadProgress(storage);
  assert.equal(loaded.levelStars['level-1'], 2);
});

test('requires two stars to unlock the next level', () => {
  const storage = createMemoryStorage();
  const progress = saveLevelResult(storage, 'level-1', { stars: 1, passed: true }, [
    'level-1',
    'level-2',
  ]);

  assert.equal(progress.levelStars['level-1'], 1);
  assert.equal(progress.unlockedLevelIds.includes('level-2'), false);
});

test('does not replace a better previous star score', () => {
  const storage = createMemoryStorage();
  saveLevelResult(storage, 'level-1', { stars: 3, passed: true }, ['level-1', 'level-2']);
  const progress = saveLevelResult(storage, 'level-1', { stars: 1, passed: true }, [
    'level-1',
    'level-2',
  ]);

  assert.equal(progress.levelStars['level-1'], 3);
});

test('saves custom levels with stable ids', () => {
  const storage = createMemoryStorage();
  const saved = saveCustomLevel(storage, {
    title: '动物单词',
    targets: ['cat', 'dog'],
    difficulty: 'normal',
    npcLanguage: 'zh-CN',
  });

  const levels = loadCustomLevels(storage);

  assert.equal(levels.length, 1);
  assert.equal(levels[0].id, saved.id);
  assert.deepEqual(levels[0].targets, ['cat', 'dog']);
});
