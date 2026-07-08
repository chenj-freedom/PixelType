export function getTypingDisplay(target, input, labels = {}) {
  const targetText = String(target || '');
  const typedInput = String(input || '');
  const nextKey = targetText[typedInput.length] || '';

  return {
    target: targetText,
    typedInput,
    nextKey,
    nextKeyLabel: getNextKeyLabel(nextKey, labels),
  };
}

export function getNextKeyLabel(key, labels = {}) {
  if (key === ' ') return labels.space || '空格';
  return key;
}
