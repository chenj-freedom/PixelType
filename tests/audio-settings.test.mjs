import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createMemoryStorage,
  loadAudioEnabled,
  saveAudioEnabled,
} from '../src/storage.js';

test('uses one saved audio preference for voice and key sounds', () => {
  const storage = createMemoryStorage();

  assert.equal(loadAudioEnabled(storage), true);

  saveAudioEnabled(storage, false);
  assert.equal(loadAudioEnabled(storage), false);

  saveAudioEnabled(storage, true);
  assert.equal(loadAudioEnabled(storage), true);
});
