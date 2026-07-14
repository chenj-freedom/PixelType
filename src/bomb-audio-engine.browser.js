(function (root) {
  const SAMPLE_RATE = 22050;
  const MUSIC_SECONDS = 4;
  const MUSIC_GAIN = 0.18;
  const EXPLOSION_SECONDS = 1.1;
  const EXPLOSION_GAIN = 0.9;
  const EXPLOSION_OFFSET_SECONDS = 0.005;

  function createBombAudioEngine({
    AudioContextClass = root.AudioContext || root.webkitAudioContext,
  } = {}) {
    let context = null;
    let masterGain = null;
    let musicSource = null;
    let explosionSource = null;
    let explosionGain = null;
    let explosionBuffer = null;
    let explosionPlayed = false;

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

      explosionBuffer = createExplosionBuffer(context);
      const musicGain = context.createGain();
      musicGain.gain.value = MUSIC_GAIN;
      musicGain.connect(masterGain);

      musicSource = context.createBufferSource();
      musicSource.buffer = createMusicBuffer(context);
      musicSource.loop = true;
      musicSource.connect(musicGain);
      musicSource.start(context.currentTime);
    }

    function playExplosion() {
      if (!context || context.state === 'closed' || !explosionBuffer || explosionPlayed) return;
      explosionPlayed = true;

      if (musicSource) {
        musicSource.stop();
        musicSource.disconnect();
        musicSource = null;
      }

      explosionSource = context.createBufferSource();
      explosionGain = context.createGain();
      explosionSource.buffer = explosionBuffer;
      explosionGain.gain.value = EXPLOSION_GAIN;
      explosionSource.connect(explosionGain);
      explosionGain.connect(masterGain);
      explosionSource.onended = () => {
        if (explosionSource) explosionSource.disconnect();
        if (explosionGain) explosionGain.disconnect();
        explosionSource = null;
        explosionGain = null;
      };
      explosionSource.start(context.currentTime + EXPLOSION_OFFSET_SECONDS);
    }

    function stop() {
      if (!context) return;

      const activeContext = context;
      if (musicSource) {
        musicSource.stop();
        musicSource.disconnect();
      }
      if (explosionSource) {
        explosionSource.stop();
        explosionSource.disconnect();
      }
      if (explosionGain) explosionGain.disconnect();

      context = null;
      masterGain = null;
      musicSource = null;
      explosionSource = null;
      explosionGain = null;
      explosionBuffer = null;
      explosionPlayed = false;

      const closeResult = activeContext.close();
      if (closeResult && typeof closeResult.catch === 'function') {
        closeResult.catch(() => undefined);
      }
    }

    return { start, playExplosion, stop };
  }

  function createMusicBuffer(context) {
    const length = SAMPLE_RATE * MUSIC_SECONDS;
    const buffer = context.createBuffer(1, length, SAMPLE_RATE);
    const samples = buffer.getChannelData(0);
    const bassNotes = [110, 131, 147, 131];

    for (let index = 0; index < length; index += 1) {
      const time = index / SAMPLE_RATE;
      const bassStep = Math.floor(time / 0.5) % bassNotes.length;
      const bassTime = time % 0.5;
      const tickTime = time % 0.25;
      const bassEnvelope = Math.exp(-5.2 * bassTime);
      const tickEnvelope = Math.exp(-62 * tickTime);
      const bassFrequency = bassNotes[bassStep];
      const bass = Math.sin(2 * Math.PI * bassFrequency * time)
        + Math.sin(2 * Math.PI * bassFrequency * 0.5 * time) * 0.35;
      const pulse = Math.sign(Math.sin(2 * Math.PI * 2 * time)) * 0.12;
      const tickFrequency = bassStep % 2 === 0 ? 880 : 988;
      const tick = Math.sin(2 * Math.PI * tickFrequency * tickTime) * tickEnvelope;
      const loopFade = Math.min(1, time / 0.05, (MUSIC_SECONDS - time) / 0.05);
      samples[index] = clamp(loopFade * (
        bass * bassEnvelope * 0.48
        + pulse
        + tick * 0.28
      ));
    }

    return buffer;
  }

  function createExplosionBuffer(context) {
    const length = Math.floor(SAMPLE_RATE * EXPLOSION_SECONDS);
    const buffer = context.createBuffer(1, length, SAMPLE_RATE);
    const samples = buffer.getChannelData(0);
    let seed = 0x6d2b79f5;
    let lowNoise = 0;

    for (let index = 0; index < length; index += 1) {
      const time = index / SAMPLE_RATE;
      const attack = Math.min(1, time / 0.006);
      const boomEnvelope = attack * Math.exp(-3.4 * time);
      const noiseEnvelope = attack * Math.exp(-7.5 * time);
      const pitchPhase = 2 * Math.PI * (90 * time - 25 * time * time);
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const noise = (seed / 0xffffffff) * 2 - 1;
      lowNoise = lowNoise * 0.78 + noise * 0.22;
      const crack = noise * Math.exp(-30 * time);
      samples[index] = clamp(
        Math.sin(pitchPhase) * boomEnvelope * 0.82
        + lowNoise * noiseEnvelope * 0.72
        + crack * 0.9,
      );
    }

    return buffer;
  }

  function clamp(value) {
    return Math.max(-1, Math.min(1, value));
  }

  root.PixelTypeBombAudioEngine = { createBombAudioEngine };
})(typeof window === 'undefined' ? globalThis : window);
