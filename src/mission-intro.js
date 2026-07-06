export function canAcceptMissionInput(introStatus) {
  return introStatus === 'playing';
}

export function getInitialIntroStatus({ audioEnabled, canSpeak }) {
  return audioEnabled && canSpeak ? 'speaking' : 'ready';
}

export function cancelActiveSpeechOnAudioOff(audioEnabled, speechSynthesis) {
  if (audioEnabled || !speechSynthesis || typeof speechSynthesis.cancel !== 'function') return false;
  speechSynthesis.cancel();
  return true;
}

export function shouldCompleteIntroFallback({ speaking, pending, elapsedMs = 0, minimumMs = 0 }) {
  return elapsedMs >= minimumMs && !speaking && !pending;
}

export function getIntroFallbackMinimumMs(text) {
  const compactText = String(text || '').replace(/\s+/g, '');
  const estimatedMs = compactText.length * 90;
  return Math.min(Math.max(estimatedMs, 2200), 12000);
}
