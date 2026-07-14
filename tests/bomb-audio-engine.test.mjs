import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const engineUrl = new URL('../src/bomb-audio-engine.browser.js', import.meta.url);

function loadBombAudioEngine() {
  assert.ok(existsSync(engineUrl), 'bomb-audio-engine.browser.js should exist');
  const context = vm.createContext({ window: {} });
  vm.runInContext(readFileSync(engineUrl, 'utf8'), context);
  return context.window.PixelTypeBombAudioEngine;
}

function createAudioHarness() {
  const instances = [];

  class FakeAudioBuffer {
    constructor(channels, length, sampleRate) {
      this.numberOfChannels = channels;
      this.length = length;
      this.sampleRate = sampleRate;
      this.channels = Array.from({ length: channels }, () => new Float32Array(length));
    }

    getChannelData(channel) {
      return this.channels[channel];
    }
  }

  class FakeAudioContext {
    constructor() {
      this.state = 'suspended';
      this.currentTime = 3;
      this.destination = { type: 'destination' };
      this.buffers = [];
      this.sources = [];
      this.gains = [];
      this.resumeCalls = 0;
      this.closeCalls = 0;
      instances.push(this);
    }

    createBuffer(channels, length, sampleRate) {
      const buffer = new FakeAudioBuffer(channels, length, sampleRate);
      this.buffers.push(buffer);
      return buffer;
    }

    createBufferSource() {
      const source = {
        buffer: null,
        loop: false,
        starts: [],
        stops: 0,
        connections: [],
        connect(target) { this.connections.push(target); },
        disconnect() { this.connections = []; },
        start(when = 0) { this.starts.push(when); },
        stop() { this.stops += 1; },
      };
      this.sources.push(source);
      return source;
    }

    createGain() {
      const gain = {
        gain: { value: 0 },
        connections: [],
        connect(target) { this.connections.push(target); },
        disconnect() { this.connections = []; },
      };
      this.gains.push(gain);
      return gain;
    }

    resume() {
      this.resumeCalls += 1;
      this.state = 'running';
      return Promise.resolve();
    }

    close() {
      this.closeCalls += 1;
      this.state = 'closed';
      return Promise.resolve();
    }
  }

  return { FakeAudioContext, instances };
}

function findAbsolutePeak(samples) {
  let peak = 0;
  for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
  return peak;
}

test('starts one looped non-silent tense music bed', () => {
  const { FakeAudioContext, instances } = createAudioHarness();
  const { createBombAudioEngine } = loadBombAudioEngine();
  const engine = createBombAudioEngine({ AudioContextClass: FakeAudioContext });

  engine.start();

  assert.equal(instances.length, 1);
  const [context] = instances;
  assert.equal(context.resumeCalls, 1);
  assert.equal(context.state, 'running');
  assert.equal(context.buffers.length, 2);
  assert.equal(context.sources.length, 1);
  assert.equal(context.sources[0].loop, true);
  assert.equal(context.sources[0].starts.length, 1);
  assert.ok(context.sources[0].buffer.getChannelData(0)
    .some((sample) => Math.abs(sample) > 0.01));
  assert.equal(context.gains[1].gain.value, 0.18);
});

test('stops music and plays one cached loud explosion', () => {
  const { FakeAudioContext, instances } = createAudioHarness();
  const { createBombAudioEngine } = loadBombAudioEngine();
  const engine = createBombAudioEngine({ AudioContextClass: FakeAudioContext });
  engine.start();

  engine.playExplosion();
  engine.playExplosion();

  const [context] = instances;
  assert.equal(context.sources[0].stops, 1);
  assert.equal(context.sources.length, 2);
  assert.strictEqual(context.sources[1].buffer, context.buffers[0]);
  assert.equal(context.sources[1].starts.length, 1);
  assert.equal(context.gains[2].gain.value, 0.9);
  assert.ok(findAbsolutePeak(context.buffers[0].getChannelData(0)) > 0.5);
});

test('start and stop are idempotent', () => {
  const { FakeAudioContext, instances } = createAudioHarness();
  const { createBombAudioEngine } = loadBombAudioEngine();
  const engine = createBombAudioEngine({ AudioContextClass: FakeAudioContext });

  engine.start();
  engine.start();
  engine.stop();
  engine.stop();

  assert.equal(instances.length, 1);
  assert.equal(instances[0].sources[0].stops, 1);
  assert.equal(instances[0].closeCalls, 1);
});
