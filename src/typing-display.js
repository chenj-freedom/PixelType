export function getTypingDisplay(target, input) {
  const targetText = String(target || '');
  const typedInput = String(input || '');
  const nextKey = targetText[typedInput.length] || '';

  return {
    target: targetText,
    typedInput,
    nextKey,
  };
}
