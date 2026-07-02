const FEEDBACK_SOUNDS = {
  correct: {
    type: 'sine',
    frequency: 660,
    duration: 0.055,
    gain: 0.05,
  },
  error: {
    type: 'square',
    frequency: 180,
    duration: 0.09,
    gain: 0.045,
  },
};

export function getFeedbackSound(kind) {
  return FEEDBACK_SOUNDS[kind] || FEEDBACK_SOUNDS.correct;
}
