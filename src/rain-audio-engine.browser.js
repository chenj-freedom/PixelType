(function (root) {
  const SAMPLE_RATE = 22050;
  const AMBIENCE_SECONDS = 8;
  const AMBIENCE_GAIN = 0.034;
  const AMBIENCE_BASE_BOX_RADIUS = 8;
  const AMBIENCE_BASE_LEVEL = 0.08;
  const AMBIENCE_PEAK_LIMIT = 0.44;
  const AMBIENCE_CLEAR_DROP_CHANCE = 0.15;
  const LANDING_LEAD_IN_SECONDS = 0.02;
  const LANDING_ATTACK_SECONDS = 0.005;
  const LANDING_IMPACT_SECONDS = 0.18;
  const LANDING_GAIN = 0.9;
  const LANDING_SCHEDULE_OFFSET = 0.005;

  function createRainAudioEngine({
    AudioContextClass = root.AudioContext || root.webkitAudioContext,
  } = {}) {
    let context = null;
    let masterGain = null;
    let ambienceGain = null;
    let ambienceSource = null;
    let landingBuffer = null;

    function start() {
      if (!AudioContextClass || context) return;

      context = new AudioContextClass();
      const resumeResult = context.state === 'suspended' ? context.resume() : null;
      if (resumeResult && typeof resumeResult.catch === 'function') {
        resumeResult.catch(() => undefined);
      }

      masterGain = context.createGain();
      masterGain.gain.value = 1;
      masterGain.connect(context.destination);

      landingBuffer = createLandingBuffer(context);
      const ambienceBuffer = createAmbienceBuffer(context);
      ambienceGain = context.createGain();
      ambienceGain.gain.value = AMBIENCE_GAIN;
      ambienceGain.connect(masterGain);

      ambienceSource = context.createBufferSource();
      ambienceSource.buffer = ambienceBuffer;
      ambienceSource.loop = true;
      ambienceSource.connect(ambienceGain);
      ambienceSource.start(context.currentTime);
    }

    function playLanding() {
      if (!context || context.state === 'closed' || !landingBuffer || !masterGain) return;

      const source = context.createBufferSource();
      const gain = context.createGain();
      source.buffer = landingBuffer;
      gain.gain.value = LANDING_GAIN;
      source.connect(gain);
      gain.connect(masterGain);
      source.onended = () => {
        source.disconnect();
        gain.disconnect();
      };
      source.start(context.currentTime + LANDING_SCHEDULE_OFFSET);
    }

    function stop() {
      if (!context) return;

      const activeContext = context;
      const activeAmbience = ambienceSource;
      context = null;
      masterGain = null;
      ambienceGain = null;
      ambienceSource = null;
      landingBuffer = null;

      if (activeAmbience) {
        activeAmbience.stop();
        activeAmbience.disconnect();
      }
      const closeResult = activeContext.close();
      if (closeResult && typeof closeResult.catch === 'function') {
        closeResult.catch(() => undefined);
      }
    }

    return { start, playLanding, stop };
  }

  function createLandingBuffer(context) {
    const duration = LANDING_LEAD_IN_SECONDS + LANDING_IMPACT_SECONDS;
    const buffer = context.createBuffer(1, Math.floor(SAMPLE_RATE * duration), SAMPLE_RATE);
    const samples = buffer.getChannelData(0);
    let seed = 0x51f15e;

    for (let index = 0; index < samples.length; index += 1) {
      const time = index / SAMPLE_RATE;
      const impactTime = time - LANDING_LEAD_IN_SECONDS;
      if (impactTime < 0) continue;
      const attack = Math.min(1, impactTime / LANDING_ATTACK_SECONDS);
      const envelope = attack * Math.exp(-22 * impactTime);
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const noise = (seed / 0xffffffff) * 2 - 1;
      const tone = Math.sin(2 * Math.PI * 160 * impactTime);
      samples[index] = clamp(envelope * (noise * 0.58 + tone * 0.42)) * 0.75;
    }
    return buffer;
  }

  function createAmbienceBuffer(context) {
    const length = SAMPLE_RATE * AMBIENCE_SECONDS;
    const buffer = context.createBuffer(1, length, SAMPLE_RATE);
    const samples = buffer.getChannelData(0);
    const rawNoise = new Float32Array(length);
    const smoothNoise = new Float32Array(length);
    let seed = 0x7261696e;

    function random() {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 0xffffffff;
    }

    for (let index = 0; index < length; index += 1) {
      rawNoise[index] = random() * 2 - 1;
    }

    applyCircularBoxFilter(rawNoise, smoothNoise, AMBIENCE_BASE_BOX_RADIUS);
    applyCircularBoxFilter(smoothNoise, samples, AMBIENCE_BASE_BOX_RADIUS);
    for (let index = 0; index < length; index += 1) {
      samples[index] *= AMBIENCE_BASE_LEVEL;
    }

    let cursorSeconds = 0.12 + random() * 0.08;
    let dropsInCluster = 0;
    let clusterSize = 4 + Math.floor(random() * 4);

    while (cursorSeconds < AMBIENCE_SECONDS) {
      addAmbienceDrop(samples, Math.floor(cursorSeconds * SAMPLE_RATE), random);
      dropsInCluster += 1;
      cursorSeconds += 0.16 + random() * 0.26;

      if (dropsInCluster >= clusterSize) {
        cursorSeconds += 0.5 + random() * 0.45;
        dropsInCluster = 0;
        clusterSize = 4 + Math.floor(random() * 4);
      }
    }

    closeLoopSeam(samples);
    for (let index = 0; index < length; index += 1) {
      samples[index] = Math.max(
        -AMBIENCE_PEAK_LIMIT,
        Math.min(AMBIENCE_PEAK_LIMIT, samples[index]),
      );
    }
    return buffer;
  }

  function addAmbienceDrop(samples, startIndex, random) {
    const isClearDrop = random() < AMBIENCE_CLEAR_DROP_CHANCE;
    const duration = 0.012 + random() * 0.043;
    const amplitude = isClearDrop
      ? 0.26 + random() * 0.1
      : 0.11 + random() * 0.13;
    const frequency = isClearDrop
      ? 3000 + random() * 1200
      : 1700 + random() * 1600;
    const attackSeconds = 0.0012 + random() * 0.0008;
    const phase = random() * Math.PI * 2;
    const sampleCount = Math.floor(duration * SAMPLE_RATE);
    let previousNoise = 0;

    for (let offset = 0; offset < sampleCount; offset += 1) {
      const time = offset / SAMPLE_RATE;
      const attack = Math.min(1, time / attackSeconds);
      const envelope = attack * Math.exp((-5.5 * time) / duration);
      const noise = random() * 2 - 1;
      const brightNoise = noise - previousNoise * 0.65;
      const pitchPhase = 2 * Math.PI * frequency
        * (time - (0.18 * time * time) / duration);
      const tone = Math.sin(pitchPhase + phase);
      const index = wrapIndex(startIndex + offset, samples.length);
      samples[index] += amplitude * envelope * (tone * 0.82 + brightNoise * 0.11);
      previousNoise = noise;
    }
  }

  function wrapIndex(index, length) {
    return ((index % length) + length) % length;
  }

  function applyCircularBoxFilter(input, output, radius) {
    const width = radius * 2 + 1;
    let sum = 0;
    for (let offset = -radius; offset <= radius; offset += 1) {
      sum += input[wrapIndex(offset, input.length)];
    }

    for (let index = 0; index < input.length; index += 1) {
      output[index] = sum / width;
      sum += input[wrapIndex(index + radius + 1, input.length)];
      sum -= input[wrapIndex(index - radius, input.length)];
    }
  }

  function closeLoopSeam(samples) {
    const lastIndex = samples.length - 1;
    const correction = samples[lastIndex] - samples[0];
    for (let index = 1; index <= lastIndex; index += 1) {
      samples[index] -= correction * (index / lastIndex);
    }
  }

  function clamp(value) {
    return Math.max(-1, Math.min(1, value));
  }

  root.PixelTypeRainAudioEngine = { createRainAudioEngine };
})(typeof window === 'undefined' ? globalThis : window);
