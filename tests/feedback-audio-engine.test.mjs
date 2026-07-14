import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const engineUrl = new URL('../src/feedback-audio-engine.browser.js', import.meta.url);

function loadFeedbackAudioEngine() {
  assert.ok(existsSync(engineUrl), 'feedback-audio-engine.browser.js should exist');
  const context = vm.createContext({ window: {} });
  vm.runInContext(readFileSync(engineUrl, 'utf8'), context);
  return context.window.PixelTypeFeedbackAudioEngine;
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
        starts: [],
        connections: [],
        onended: null,
        connect(target) { this.connections.push(target); },
        disconnect() { this.connections = []; },
        start(when = 0) { this.starts.push(when); },
        finish() { this.onended?.(); },
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

test('first and later mission feedback use the same cached audible buffer and schedule', async () => {
  const { FakeAudioContext, instances } = createAudioHarness();
  const { createFeedbackAudioEngine } = loadFeedbackAudioEngine();
  const engine = createFeedbackAudioEngine({ AudioContextClass: FakeAudioContext });

  assert.equal(await engine.start(), true);
  assert.equal(engine.play('mission-correct'), true);
  assert.equal(engine.play('mission-correct'), true);

  assert.equal(instances.length, 1);
  const [context] = instances;
  assert.equal(context.resumeCalls, 1);
  assert.equal(context.gains[0].gain.value, 1);
  assert.equal(context.sources.length, 2);
  assert.strictEqual(context.sources[0].buffer, context.sources[1].buffer);
  assert.deepEqual(context.sources[0].starts, [2.005]);
  assert.deepEqual(context.sources[1].starts, [2.005]);
  assert.equal(context.gains[1].gain.value, 0.10);
  assert.equal(context.gains[2].gain.value, 0.10);

  const samples = context.sources[0].buffer.getChannelData(0);
  assert.ok(samples.slice(0, Math.floor(22050 * 0.02)).every((sample) => sample === 0));
  assert.ok(findAbsolutePeak(samples) > 0.5);
});

test('audible prime must finish a real cached sound before mission input opens', async () => {
  const { FakeAudioContext, instances } = createAudioHarness();
  const { createFeedbackAudioEngine } = loadFeedbackAudioEngine();
  const engine = createFeedbackAudioEngine({ AudioContextClass: FakeAudioContext });
  let primeFinished = false;
  let primeResult = null;

  const priming = engine.prime('mission-correct', 0.04).then((result) => {
    primeFinished = true;
    primeResult = result;
  });
  await new Promise((resolve) => setImmediate(resolve));

  const [context] = instances;
  assert.equal(primeFinished, false);
  assert.equal(context.sources.length, 1);
  assert.equal(context.gains[1].gain.value, 0.04);
  assert.deepEqual(context.sources[0].starts, [2.005]);
  assert.ok(findAbsolutePeak(context.sources[0].buffer.getChannelData(0)) > 0.5);

  context.sources[0].finish();
  await priming;
  assert.equal(primeFinished, true);
  assert.equal(primeResult, true);

  assert.equal(engine.play('mission-correct'), true);
  assert.strictEqual(context.sources[0].buffer, context.sources[1].buffer);
  assert.equal(context.gains[2].gain.value, 0.10);
});

test('stopping audio releases an audible prime that is still pending', async () => {
  const { FakeAudioContext } = createAudioHarness();
  const { createFeedbackAudioEngine } = loadFeedbackAudioEngine();
  const engine = createFeedbackAudioEngine({ AudioContextClass: FakeAudioContext });

  const priming = engine.prime('mission-correct', 0.04);
  await new Promise((resolve) => setImmediate(resolve));
  engine.stop();

  assert.equal(await priming, false);
});

test('audible prime fails open when Web Audio is unavailable', async () => {
  const { createFeedbackAudioEngine } = loadFeedbackAudioEngine();
  const engine = createFeedbackAudioEngine({ AudioContextClass: null });

  assert.equal(await engine.prime('mission-correct', 0.04), false);
});

test('start is idempotent and stop closes the shared context', async () => {
  const { FakeAudioContext, instances } = createAudioHarness();
  const { createFeedbackAudioEngine } = loadFeedbackAudioEngine();
  const engine = createFeedbackAudioEngine({ AudioContextClass: FakeAudioContext });

  await engine.start();
  await engine.start();
  assert.equal(instances.length, 1);

  engine.stop();
  engine.stop();
  assert.equal(instances[0].closeCalls, 1);
  assert.equal(engine.play('mission-correct'), false);
});
