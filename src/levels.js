export const BUILT_IN_LEVELS = [
  {
    id: 'level-1',
    order: 1,
    titleKey: 'level.homeRowIndex',
    subtitleKey: 'level.homeRowIndex.subtitle',
    focusKeys: ['F', 'J'],
    targets: ['f', 'j', 'fj', 'jf', 'ff', 'jj', 'fjfj', 'jfjf'],
    targetAccuracy: 85,
    npcLineKey: 'npc.level1',
  },
  {
    id: 'level-2',
    order: 2,
    titleKey: 'level.leftHome',
    subtitleKey: 'level.leftHome.subtitle',
    focusKeys: ['A', 'S', 'D', 'F'],
    targets: ['a', 's', 'd', 'f', 'as', 'sad', 'dad', 'fad'],
    targetAccuracy: 85,
    npcLineKey: 'npc.level2',
  },
  {
    id: 'level-3',
    order: 3,
    titleKey: 'level.rightHome',
    subtitleKey: 'level.rightHome.subtitle',
    focusKeys: ['J', 'K', 'L'],
    targets: ['j', 'k', 'l', 'jk', 'kl', 'ill', 'kill', 'jill'],
    targetAccuracy: 85,
    npcLineKey: 'npc.level3',
  },
  {
    id: 'level-4',
    order: 4,
    titleKey: 'level.homeWords',
    subtitleKey: 'level.homeWords.subtitle',
    focusKeys: ['A', 'S', 'D', 'F', 'J', 'K', 'L'],
    targets: ['sad', 'dad', 'fall', 'lad', 'ask', 'all', 'flask', 'salad'],
    targetAccuracy: 88,
    npcLineKey: 'npc.level4',
  },
  {
    id: 'level-5',
    order: 5,
    titleKey: 'level.topRow',
    subtitleKey: 'level.topRow.subtitle',
    focusKeys: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    targets: ['we', 'you', 'top', 'type', 'quiet', 'power', 'write', 'tour'],
    targetAccuracy: 88,
    npcLineKey: 'npc.level5',
  },
  {
    id: 'level-6',
    order: 6,
    titleKey: 'level.bottomRow',
    subtitleKey: 'level.bottomRow.subtitle',
    focusKeys: ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
    targets: ['cat', 'van', 'mix', 'box', 'zoo', 'comb', 'move', 'name'],
    targetAccuracy: 88,
    npcLineKey: 'npc.level6',
  },
  {
    id: 'level-7',
    order: 7,
    titleKey: 'level.animalWords',
    subtitleKey: 'level.animalWords.subtitle',
    focusKeys: ['C', 'A', 'T', 'D', 'O', 'G', 'F', 'I', 'S', 'H'],
    targets: ['cat', 'dog', 'fish', 'bird', 'duck', 'horse', 'tiger', 'panda'],
    targetAccuracy: 90,
    npcLineKey: 'npc.level7',
  },
  {
    id: 'level-8',
    order: 8,
    titleKey: 'level.shortSentences',
    subtitleKey: 'level.shortSentences.subtitle',
    focusKeys: ['A-Z', '.', ','],
    targets: ['I can type.', 'A cat can run.', 'The dog is happy.', 'I like typing.'],
    targetAccuracy: 90,
    npcLineKey: 'npc.level8',
  },
];

export function getAllLevels(customLevels = []) {
  return [...BUILT_IN_LEVELS, ...customLevels.map((level, index) => ({
    ...level,
    order: BUILT_IN_LEVELS.length + index + 1,
    isCustom: true,
  }))];
}

export function normalizeCustomLevel(input) {
  const title = String(input.title || '').trim() || '自定义关卡';
  const targets = normalizeTargets(input.targets);
  return {
    id: input.id || `custom-${Date.now()}`,
    title,
    subtitle: input.subtitle || '自定义练习',
    focusKeys: input.focusKeys || inferFocusKeys(targets),
    targets,
    targetAccuracy: Number(input.targetAccuracy || 85),
    difficulty: input.difficulty || 'normal',
    npcLanguage: input.npcLanguage || 'zh-CN',
    npcLine: input.npcLine || '看准目标，一个字母一个字母输入。',
    isCustom: true,
  };
}

function normalizeTargets(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(value || '')
    .split(/[\n,，]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function inferFocusKeys(targets) {
  const keys = new Set();
  for (const target of targets) {
    for (const char of target.toUpperCase()) {
      if (/[A-Z]/.test(char)) keys.add(char);
    }
  }
  return [...keys].slice(0, 12);
}
