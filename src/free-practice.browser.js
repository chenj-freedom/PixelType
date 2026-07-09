(function () {
  const FREE_PRACTICE_POOLS = {
    letters: [
      'f', 'j', 'a', 's', 'd', 'k', 'l', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'z', 'x', 'c', 'v', 'b', 'n', 'm',
      'ff', 'jj', 'fj', 'jf', 'as', 'df', 'jk', 'kl', 'qw', 'er', 'ui', 'op', 'zx', 'cv', 'bn', 'nm',
      'asdf', 'jkl', 'qwer', 'uiop', 'zxcv', 'bnm',
    ],
    words: [
      'cat', 'dog', 'fish', 'bird', 'duck', 'horse', 'panda', 'tiger', 'lion', 'bear', 'frog', 'rabbit',
      'apple', 'banana', 'grape', 'orange', 'lemon', 'milk', 'water', 'bread', 'rice', 'cake',
      'school', 'book', 'pencil', 'paper', 'desk', 'chair', 'clock', 'house', 'room', 'door', 'window',
      'sun', 'moon', 'star', 'rain', 'snow', 'tree', 'flower', 'grass',
      'red', 'blue', 'green', 'yellow', 'black', 'white',
      'happy', 'funny', 'small', 'big', 'fast', 'slow', 'good', 'kind',
      'jump', 'run', 'walk', 'play', 'read', 'write', 'look', 'see', 'like', 'make', 'take', 'come', 'go', 'help', 'open', 'close',
      'left', 'right', 'home', 'type', 'key', 'hand', 'finger', 'space', 'letter', 'word', 'sentence',
      'family', 'friend', 'teacher', 'student', 'mother', 'father', 'sister', 'brother',
      'morning', 'garden', 'market', 'music', 'story', 'picture', 'rocket', 'planet',
    ],
    sentences: [
      'I can type.',
      'A cat can run.',
      'The dog is happy.',
      'I like typing.',
      'We read a book.',
      'The sun is bright.',
      'My pencil is blue.',
      'A fish can swim.',
      'The bird can fly.',
      'I see a red apple.',
      'The duck is yellow.',
      'My desk is clean.',
      'We play at school.',
      'The clock is on the wall.',
      'I open the door.',
      'The rabbit can jump.',
      'A panda eats leaves.',
      'My friend is kind.',
      'The moon is white.',
      'I write one word.',
      'A small frog jumps.',
      'The tiger is fast.',
      'We drink cold water.',
      'I close the window.',
      'The flower is pretty.',
      'My teacher can help.',
      'The green tree is tall.',
      'I type with care.',
      'A lion has a mane.',
      'The horse can walk.',
      'We make a short sentence.',
      'I press the space key.',
      'The black cat sleeps.',
      'A happy dog runs.',
      'Read, then type.',
      'Look, type, and check.',
    ],
  };

  const FREE_PRACTICE_MODES = [
    {
      id: 'letters',
      titleKey: 'freePracticeLetters',
      subtitleKey: 'freePracticeLettersSubtitle',
      npcLineKey: 'npc.freePracticeLetters',
      targetCount: 12,
      pool: 'letters',
    },
    {
      id: 'words',
      titleKey: 'freePracticeWords',
      subtitleKey: 'freePracticeWordsSubtitle',
      npcLineKey: 'npc.freePracticeWords',
      targetCount: 10,
      pool: 'words',
    },
    {
      id: 'sentences',
      titleKey: 'freePracticeSentences',
      subtitleKey: 'freePracticeSentencesSubtitle',
      npcLineKey: 'npc.freePracticeSentences',
      targetCount: 6,
      pool: 'sentences',
    },
    {
      id: 'mixed',
      titleKey: 'freePracticeMixed',
      subtitleKey: 'freePracticeMixedSubtitle',
      npcLineKey: 'npc.freePracticeMixed',
      targetCount: 10,
      pool: 'mixed',
    },
  ];

  const KEY_ORDER = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Z', 'X', 'C', 'V', 'B', 'N', 'M'];

  function buildFreePracticeMission(modeId = 'mixed', random = Math.random) {
    const mode = getFreePracticeMode(modeId);
    const targets = mode.id === 'mixed'
      ? buildMixedTargets(random)
      : pickRandomTargets(FREE_PRACTICE_POOLS[mode.pool], mode.targetCount, random);

    return {
      id: `free-practice-${mode.id}`,
      freePracticeMode: mode.id,
      titleKey: mode.titleKey,
      subtitleKey: mode.subtitleKey,
      focusKeys: getFocusKeysForTargets(targets),
      targets,
      targetAccuracy: 85,
      npcLineKey: mode.npcLineKey,
      isFreePractice: true,
    };
  }

  function getFreePracticeMode(modeId) {
    return FREE_PRACTICE_MODES.find((mode) => mode.id === modeId)
      || FREE_PRACTICE_MODES.find((mode) => mode.id === 'mixed');
  }

  function pickRandomTargets(pool, count, random = Math.random) {
    const source = [...pool];
    const result = [];
    while (result.length < count) {
      if (source.length === 0) source.push(...pool);
      const index = Math.floor(random() * source.length);
      result.push(source.splice(index, 1)[0]);
    }
    return result;
  }

  function buildMixedTargets(random) {
    const targets = [
      ...pickRandomTargets(FREE_PRACTICE_POOLS.letters, 3, random),
      ...pickRandomTargets(FREE_PRACTICE_POOLS.words, 4, random),
      ...pickRandomTargets(FREE_PRACTICE_POOLS.sentences, 3, random),
    ];
    return shuffle(targets, random);
  }

  function shuffle(items, random) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
  }

  function getFocusKeysForTargets(targets) {
    const text = targets.join('');
    const foundLetters = new Set(text.toUpperCase().replace(/[^A-Z]/g, '').split('').filter(Boolean));
    const keys = KEY_ORDER.filter((key) => foundLetters.has(key));
    if (text.includes(' ')) keys.push('Space');
    if (text.includes('.')) keys.push('.');
    if (text.includes(',')) keys.push(',');
    return keys;
  }

  window.PixelTypeFreePractice = {
    FREE_PRACTICE_MODES,
    FREE_PRACTICE_POOLS,
    buildFreePracticeMission,
  };
})();
