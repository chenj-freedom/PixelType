import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const engineUrl = new URL('../src/rain-audio-engine.browser.js', import.meta.url);

function loadRainAudioEngine() {
  assert.ok(existsSync(engineUrl), 'rain-audio-engine.browser.js should exist');
  const context = vm.createContext({ window: {} });
  vm.runInContext(readFileSync(engineUrl, 'utf8'), context);
  return context.window.PixelTypeRainAudioEngine;
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
      this.currentTime = 2;
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

function calculateRmsWindows(samples, windowSize) {
  const windows = [];
  for (let start = 0; start < samples.length; start += windowSize) {
    const end = Math.min(samples.length, start + windowSize);
    let squareSum = 0;
    for (let index = start; index < end; index += 1) {
      squareSum += samples[index] ** 2;
    }
    windows.push(Math.sqrt(squareSum / (end - start)));
  }
  return windows;
}

function percentile(values, ratio) {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor((sorted.length - 1) * ratio)];
}

function countActiveRuns(values, threshold) {
  let runs = 0;
  let active = false;
  for (const value of values) {
    if (value >= threshold && !active) runs += 1;
    active = value >= threshold;
  }
  return runs;
}

function findAbsolutePeak(samples) {
  let peak = 0;
  for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
  return peak;
}

test('starts one real non-zero rain ambience inside a resumed context', () => {
  const { FakeAudioContext, instances } = createAudioHarness();
  const { createRainAudioEngine } = loadRainAudioEngine();
  const engine = createRainAudioEngine({ AudioContextClass: FakeAudioContext });

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
    .some((sample) => Math.abs(sample) > 0.001));
  assert.equal(context.gains[1].gain.value, 0.034);
});

test('plays the first and later landings from the same cached buffer and gain', () => {
  const { FakeAudioContext, instances } = createAudioHarness();
  const { createRainAudioEngine } = loadRainAudioEngine();
  const engine = createRainAudioEngine({ AudioContextClass: FakeAudioContext });
  engine.start();

  engine.playLanding();
  engine.playLanding();

  const [context] = instances;
  const firstLanding = context.sources[1];
  const secondLanding = context.sources[2];
  assert.strictEqual(firstLanding.buffer, secondLanding.buffer);
  assert.notStrictEqual(firstLanding.buffer, context.sources[0].buffer);
  assert.deepEqual(firstLanding.starts, secondLanding.starts);
  assert.equal(context.gains[2].gain.value, context.gains[3].gain.value);
});

test('starts once and stops the ambience and context idempotently', () => {
  const { FakeAudioContext, instances } = createAudioHarness();
  const { createRainAudioEngine } = loadRainAudioEngine();
  const engine = createRainAudioEngine({ AudioContextClass: FakeAudioContext });

  engine.start();
  engine.start();
  assert.equal(instances.length, 1);
  assert.equal(instances[0].sources.length, 1);

  engine.stop();
  engine.stop();
  assert.equal(instances[0].sources[0].stops, 1);
  assert.equal(instances[0].closeCalls, 1);

  const sourceCount = instances[0].sources.length;
  engine.playLanding();
  assert.equal(instances[0].sources.length, sourceCount);
});

test('synthesizes clustered drizzly ambience instead of stationary noise', () => {
  const { FakeAudioContext, instances } = createAudioHarness();
  const { createRainAudioEngine } = loadRainAudioEngine();
  const engine = createRainAudioEngine({ AudioContextClass: FakeAudioContext });
  engine.start();

  const ambienceSamples = instances[0].sources[0].buffer.getChannelData(0);
  const shortWindows = calculateRmsWindows(ambienceSamples, Math.floor(22050 * 0.1));
  const quietEnergy = percentile(shortWindows, 0.25);
  const activeEnergy = percentile(shortWindows, 0.95);
  assert.ok(
    activeEnergy >= quietEnergy * 2.5,
    `expected clustered energy, got quiet=${quietEnergy} active=${activeEnergy}`,
  );

  const halfSecondWindows = calculateRmsWindows(ambienceSamples, Math.floor(22050 * 0.5));
  assert.ok(halfSecondWindows.every((energy) => energy > 0.001));
});

test('spaces drizzly drops into sparse audible clusters', () => {
  const { FakeAudioContext, instances } = createAudioHarness();
  const { createRainAudioEngine } = loadRainAudioEngine();
  const engine = createRainAudioEngine({ AudioContextClass: FakeAudioContext });
  engine.start();

  const ambienceSamples = instances[0].sources[0].buffer.getChannelData(0);
  const shortWindows = calculateRmsWindows(ambienceSamples, Math.floor(22050 * 0.02));
  const quietEnergy = percentile(shortWindows, 0.25);
  const activeRuns = countActiveRuns(shortWindows, quietEnergy * 2.5);

  assert.ok(
    activeRuns >= 14 && activeRuns <= 22,
    `expected 14-22 sparse rain runs, got ${activeRuns}`,
  );
});

test('keeps the eight-second ambience quiet beneath landing audio and loop-safe', () => {
  const { FakeAudioContext, instances } = createAudioHarness();
  const { createRainAudioEngine } = loadRainAudioEngine();
  const engine = createRainAudioEngine({ AudioContextClass: FakeAudioContext });
  engine.start();
  engine.playLanding();

  const [context] = instances;
  const landingSamples = context.buffers[0].getChannelData(0);
  const ambienceSamples = context.sources[0].buffer.getChannelData(0);
  const ambiencePeak = findAbsolutePeak(ambienceSamples);
  const landingPeak = findAbsolutePeak(landingSamples);
  const ambienceGain = context.gains[1].gain.value;
  const landingGain = context.gains[2].gain.value;

  assert.equal(ambienceSamples.length, 22050 * 8);
  assert.ok(ambiencePeak <= 0.45);
  assert.ok(ambiencePeak * ambienceGain <= landingPeak * landingGain * 0.05);
  assert.ok(Math.abs(ambienceSamples[0] - ambienceSamples.at(-1)) <= 0.03);
});
