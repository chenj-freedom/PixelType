export function canAcceptMissionInput(introStatus) {
  return introStatus === 'playing';
}

export function getInitialIntroStatus({ audioEnabled, canSpeak }) {
  return audioEnabled && canSpeak ? 'speaking' : 'ready';
}

export function shouldCompleteIntroFallback({ speaking, pending }) {
  return !speaking && !pending;
}
