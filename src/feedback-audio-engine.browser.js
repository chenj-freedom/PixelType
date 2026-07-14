(function (root) {
  const SAMPLE_RATE = 22050;
  const LEAD_IN_SECONDS = 0.02;
  const SCHEDULE_OFFSET_SECONDS = 0.005;
  const ATTACK_SECONDS = 0.01;
  const MIN_ENVELOPE = 0.001;

  const SOUNDS = {
    correct: {
      type: 'sine',
      frequency: 660,
      duration: 0.055,
      gain: 0.06,
    },
    'mission-correct': {
      type: 'sine',
      frequency: 660,
      duration: 0.055,
      gain: 0.10,
    },
    error: {
      type: 'square',
      frequency: 180,
      duration: 0.09,
      gain: 0.045,
    },
    'mission-error': {
      type: 'square',
      frequency: 180,
      duration: 0.09,
      gain: 0.08,
    },
    'rain-hit': {
      type: 'triangle',
      frequency: 880,
      duration: 0.08,
      gain: 0.045,
    },
  };

  function createFeedbackAudioEngine({
    AudioContextClass = root.AudioContext || root.webkitAudioContext,
  } = {}) {
    let context = null;
    let masterGain = null;
    let buffers = null;
    const pendingPrimeCompletions = new Set();

    async function start() {
      if (!AudioContextClass) return false;

      if (!context) {
        context = new AudioContextClass();
        masterGain = context.createGain();
        masterGain.gain.value = 1;
        masterGain.connect(context.destination);
        buffers = new Map(
          Object.entries(SOUNDS).map(([kind, config]) => [
            kind,
            createFeedbackBuffer(context, config),
          ]),
        );
      }

      if (context.state === 'suspended') {
        try {
          await context.resume();
        } catch {
          return false;
        }
      }
      return context.state === 'running';
    }

    function play(kind) {
      const resolvedKind = SOUNDS[kind] ? kind : 'correct';
      return startPlayback(resolvedKind, SOUNDS[resolvedKind].gain);
    }

    async function prime(kind = 'mission-correct', gainValue = 0.04) {
      if (!await start()) return false;
      const resolvedKind = SOUNDS[kind] ? kind : 'correct';

      return new Promise((resolve) => {
        let settled = false;
        const complete = (result) => {
          if (settled) return;
          settled = true;
          pendingPrimeCompletions.delete(complete);
          resolve(result);
        };
        pendingPrimeCompletions.add(complete);
        if (!startPlayback(resolvedKind, gainValue, () => complete(true))) {
          complete(false);
        }
      });
    }

    function startPlayback(kind, gainValue, onended) {
      if (!context || context.state !== 'running' || !masterGain || !buffers) return false;
      const source = context.createBufferSource();
      const gain = context.createGain();
      source.buffer = buffers.get(kind);
      gain.gain.value = gainValue;
      source.connect(gain);
      gain.connect(masterGain);
      source.onended = () => {
        source.disconnect();
        gain.disconnect();
        if (onended) onended();
      };
      try {
        source.start(context.currentTime + SCHEDULE_OFFSET_SECONDS);
      } catch {
        source.disconnect();
        gain.disconnect();
        return false;
      }
      return true;
    }

    function stop() {
      if (!context) return;

      const activeContext = context;
      for (const complete of pendingPrimeCompletions) complete(false);
      pendingPrimeCompletions.clear();
      context = null;
      masterGain = null;
      buffers = null;
      const closeResult = activeContext.close();
      if (closeResult && typeof closeResult.catch === 'function') {
        closeResult.catch(() => undefined);
      }
    }

    return { start, prime, play, stop };
  }

  function createFeedbackBuffer(context, config) {
    const totalSeconds = LEAD_IN_SECONDS + config.duration;
    const length = Math.ceil(SAMPLE_RATE * totalSeconds);
    const buffer = context.createBuffer(1, length, SAMPLE_RATE);
    const samples = buffer.getChannelData(0);

    for (let index = 0; index < samples.length; index += 1) {
      const soundTime = index / SAMPLE_RATE - LEAD_IN_SECONDS;
      if (soundTime < 0 || soundTime >= config.duration) continue;

      const attack = Math.min(1, soundTime / ATTACK_SECONDS);
      const decayProgress = Math.max(0, (soundTime - ATTACK_SECONDS)
        / Math.max(config.duration - ATTACK_SECONDS, Number.EPSILON));
      const decay = MIN_ENVELOPE ** decayProgress;
      const envelope = Math.max(MIN_ENVELOPE, attack * decay);
      samples[index] = getWaveSample(config.type, config.frequency, soundTime) * envelope;
    }
    return buffer;
  }

  function getWaveSample(type, frequency, time) {
    const cycle = frequency * time;
    if (type === 'square') return Math.sin(2 * Math.PI * cycle) >= 0 ? 1 : -1;
    if (type === 'triangle') return 2 * Math.asin(Math.sin(2 * Math.PI * cycle)) / Math.PI;
    return Math.sin(2 * Math.PI * cycle);
  }

  root.PixelTypeFeedbackAudioEngine = { createFeedbackAudioEngine };
})(typeof window === 'undefined' ? globalThis : window);
