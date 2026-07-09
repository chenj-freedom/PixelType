export function canAcceptMissionInput(introStatus) {
  return introStatus === 'playing';
}

export function getInitialIntroStatus({ audioEnabled, canSpeak }) {
  return audioEnabled && canSpeak ? 'speaking' : 'ready';
}

export function shouldBeginPracticeFromKey(key, introStatus) {
  return introStatus === 'ready' && (key === 'Enter' || key === ' ' || key === 'Space' || key === 'Spacebar');
}

export function isCapsLockEvent(event) {
  return event?.key === 'CapsLock' || event?.code === 'CapsLock';
}

export function isMissionTypingEvent(event) {
  if (!event || event.ctrlKey || event.metaKey || event.altKey) return false;
  if (isCapsLockEvent(event)) return false;
  return typeof event.key === 'string' && event.key.length === 1;
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
