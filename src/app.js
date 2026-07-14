(function () {
  const { FREE_PRACTICE_MODES, FREE_PRACTICE_POOLS, buildFreePracticeMission } = window.PixelTypeFreePractice;
  const {
    RAIN_MISS_LIMIT,
    calculateRainLandingY,
    createRainSession,
    advanceRainSession,
    hitRainLetter,
    createBombSession,
    advanceBombSession,
    typeBombKey,
    getElapsedSeconds,
  } = window.PixelTypeGameModes;
  const { createRainAudioEngine } = window.PixelTypeRainAudioEngine;
  const { createBombAudioEngine } = window.PixelTypeBombAudioEngine;
  const UNLOCK_REQUIRED_STARS = 2;

  const BUILT_IN_LEVELS = [
    level('level-1', 1, 'level.homeRowIndex', 'level.homeRowIndex.subtitle', ['F', 'J'], ['f', 'j', 'fj', 'jf', 'ff', 'jj', 'fjfj', 'jfjf'], 85, 'npc.level1'),
    level('level-2', 2, 'level.leftHome', 'level.leftHome.subtitle', ['A', 'S', 'D', 'F'], ['a', 's', 'd', 'f', 'as', 'sad', 'dad', 'fad'], 85, 'npc.level2'),
    level('level-3', 3, 'level.rightHome', 'level.rightHome.subtitle', ['J', 'K', 'L'], ['j', 'k', 'l', 'jk', 'kl', 'ill', 'kill', 'jill'], 85, 'npc.level3'),
    level('level-4', 4, 'level.homeWords', 'level.homeWords.subtitle', ['A', 'S', 'D', 'F', 'J', 'K', 'L'], ['sad', 'dad', 'fall', 'lad', 'ask', 'all', 'flask', 'salad'], 88, 'npc.level4'),
    level('level-5', 5, 'level.topRow', 'level.topRow.subtitle', ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'], ['we', 'you', 'top', 'type', 'quiet', 'power', 'write', 'tour'], 88, 'npc.level5'),
    level('level-6', 6, 'level.bottomRow', 'level.bottomRow.subtitle', ['Z', 'X', 'C', 'V', 'B', 'N', 'M'], ['cat', 'van', 'mix', 'box', 'zoo', 'comb', 'move', 'name'], 88, 'npc.level6'),
    level('level-7', 7, 'level.animalWords', 'level.animalWords.subtitle', ['C', 'A', 'T', 'D', 'O', 'G', 'F', 'I', 'S', 'H'], ['cat', 'dog', 'fish', 'bird', 'duck', 'horse', 'tiger', 'panda'], 90, 'npc.level7'),
    level('level-8', 8, 'level.shortSentences', 'level.shortSentences.subtitle', ['A-Z', '.', ','], ['I can type.', 'A cat can run.', 'The dog is happy.', 'I like typing.'], 90, 'npc.level8'),
  ];

  const PIXEL_SPRITE_FONT_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const PIXEL_GLYPH_ADVANCE = {
    i: 5,
    j: 7,
    l: 5,
    f: 8,
    r: 8,
    t: 8,
    x: 10,
    L: 11,
    P: 10,
    T: 11,
  };

  const KEYBOARD_ROWS = [
    [
      { key: 'Q', column: 3 },
      { key: 'W', column: 5 },
      { key: 'E', column: 7 },
      { key: 'R', column: 9 },
      { key: 'T', column: 11 },
      { key: 'Y', column: 13 },
      { key: 'U', column: 15 },
      { key: 'I', column: 17 },
      { key: 'O', column: 19 },
      { key: 'P', column: 21 },
    ],
    [
      { key: 'Case', column: 1, span: 3 },
      { key: 'A', column: 4 },
      { key: 'S', column: 6 },
      { key: 'D', column: 8 },
      { key: 'F', column: 10 },
      { key: 'G', column: 12 },
      { key: 'H', column: 14 },
      { key: 'J', column: 16 },
      { key: 'K', column: 18 },
      { key: 'L', column: 20 },
      { key: ';', column: 22 },
    ],
    [
      { key: 'Z', column: 5 },
      { key: 'X', column: 7 },
      { key: 'C', column: 9 },
      { key: 'V', column: 11 },
      { key: 'B', column: 13 },
      { key: 'N', column: 15 },
      { key: 'M', column: 17 },
      { key: '.', column: 19 },
      { key: ',', column: 21 },
      { key: '?', column: 23 },
    ],
  ];
  const SPACE_KEY_ROW = [{ key: 'Space', column: 8, span: 10 }];

  const STRINGS = {
    'zh-CN': {
      appTitle: 'PixelType',
      appSubtitle: '跟着小向导，学会英文键盘打字',
      homeIntro: '先从 F 和 J 开始，按学习顺序逐步解锁地图关卡。',
      guideLabel: '向导',
      switchToChinese: '中文',
      switchToEnglish: 'English',
      startAdventure: '开始闯关',
      freePractice: '自由练习',
      freePracticeSubtitle: '混合复习',
      freePracticeChoose: '选择一种练习方式，每次都会重新生成内容。',
      freePracticeLetters: '随机字母',
      freePracticeLettersSubtitle: '练习字母和常见组合',
      freePracticeWords: '随机单词',
      freePracticeWordsSubtitle: '从单词池随机抽取',
      freePracticeSentences: '随机句子',
      freePracticeSentencesSubtitle: '练习空格和标点',
      freePracticeMixed: '混合练习',
      freePracticeMixedSubtitle: '字母、单词、句子一起复习',
      gameModes: '游戏模式',
      gameModesChoose: '选择一个小游戏，开始趣味打字挑战。',
      letterRain: '字母雨滴',
      letterRainSubtitle: '敲掉雨滴中的字母，保护小动物',
      countdownDefuse: '倒计时拆弹',
      countdownDefuseSubtitle: '在爆炸前输入完整句子',
      backGameModes: '返回游戏模式',
      lowSpeed: '低速',
      highSpeed: '高速',
      startGame: '开始游戏',
      survivalTime: '坚持时长',
      clearedDrops: '消除雨滴',
      missedDrops: '漏接雨滴',
      seconds: '秒',
      rainGameOver: '小动物被淋湿了',
      playAgain: '再玩一次',
      defusedBombs: '成功拆弹',
      countdown: '倒计时',
      bombGameOver: '炸弹爆炸了',
      typingErrors: '错误次数',
      backHome: '返回首页',
      backMap: '返回地图',
      mapTitle: '闯关地图',
      unlockHint: '达到 2 星解锁下一关',
      unlockReady: '已达到 2 星，可以解锁下一关。',
      unlockNeedsMoreStars: '达到 2 星才能解锁下一关。',
      locked: '未解锁',
      startLevel: '开始',
    introListening: '正在听小向导介绍...',
    introReady: '介绍听完了，可以开始练习。',
    beginPractice: '开始练习',
    typingTarget: '目标',
    currentTarget: '当前目标',
    typedInput: '已输入',
    noneInput: '还没有',
    nextKey: '下一键',
    spaceKey: '空格',
    accuracy: '准确率',
      lives: '生命',
      progress: '进度',
      stars: '星星',
      wpm: '速度',
      resultTitle: '关卡完成',
      resultRetry: '再练一次',
      resultContinue: '回到地图',
      backFreePractice: '返回自由练习',
      languageChinese: '中文',
      languageEnglish: 'English',
      audioOn: '声音开',
      audioOff: '声音关',
      audioOnTooltip: '音量开',
      audioOffTooltip: '音量关',
      switchToChineseTooltip: '切换到中文',
      switchToEnglishTooltip: '切换到英文',
      correctHint: '很好，继续！',
      errorHint: '再试一次，看准下一个字母。',
      completeHint: '完成啦，看看获得几颗星。',
      'level.homeRowIndex': '食指定位',
      'level.homeRowIndex.subtitle': '找到 F 和 J',
      'level.leftHome': '左手中排',
      'level.leftHome.subtitle': '练习 A S D F',
      'level.rightHome': '右手中排',
      'level.rightHome.subtitle': '练习 J K L',
      'level.homeWords': '中排单词',
      'level.homeWords.subtitle': '组合成短单词',
      'level.topRow': '上排字母',
      'level.topRow.subtitle': '向上伸手指',
      'level.bottomRow': '下排字母',
      'level.bottomRow.subtitle': '向下收手指',
      'level.animalWords': '动物单词',
      'level.animalWords.subtitle': '输入常见动物',
      'level.shortSentences': '短句挑战',
      'level.shortSentences.subtitle': '输入完整短句',
      'npc.home': '准备好了吗？把左右食指放在 F 和 J 上，我们出发吧！',
      'npc.freePractice': '这里是自由练习。不会影响闯关进度，按自己的节奏复习吧。',
      'npc.freePracticeLetters': '先热热手。看准字母和组合，稳定地输入。',
      'npc.freePracticeWords': '现在练随机单词。先看完整单词，再开始输入。',
      'npc.freePracticeSentences': '句子练习会遇到空格和标点。一个字符一个字符来。',
      'npc.freePracticeMixed': '混合练习开始。字母、单词和句子都会出现。',
      'npc.level1': '这一关只找 F 和 J。两个键上通常有小凸点，可以摸一摸。',
      'npc.level2': '左手小队登场。慢慢来，先保证准确。',
      'npc.level3': '现在换右手小队。眼睛看目标，手指轻轻移动。',
      'npc.level4': '中排字母可以组成单词啦。一个字母一个字母输入。',
      'npc.level5': '上排需要手指向上伸，输入后回到原位。',
      'npc.level6': '下排需要手指向下收，输入后也要回到原位。',
      'npc.level7': '动物单词挑战开始。看清整个单词再输入。',
      'npc.level8': '最后试试短句。空格和句号也算目标哦。',
    },
    'en-US': {
      appTitle: 'PixelType',
      appSubtitle: 'Learn English keyboard typing with your guide',
      homeIntro: 'Start with F and J, then unlock map levels in learning order.',
      guideLabel: 'Guide',
      switchToChinese: '中文',
      switchToEnglish: 'English',
      startAdventure: 'Start Adventure',
      freePractice: 'Free Practice',
      freePracticeSubtitle: 'Mixed Review',
      freePracticeChoose: 'Choose a practice mode. New targets are generated every time.',
      freePracticeLetters: 'Random Letters',
      freePracticeLettersSubtitle: 'Practice letters and common combos',
      freePracticeWords: 'Random Words',
      freePracticeWordsSubtitle: 'Draw from the word pool',
      freePracticeSentences: 'Random Sentences',
      freePracticeSentencesSubtitle: 'Practice spaces and punctuation',
      freePracticeMixed: 'Mixed Practice',
      freePracticeMixedSubtitle: 'Review letters, words, and sentences',
      gameModes: 'Game Modes',
      gameModesChoose: 'Choose a mini game and start a typing challenge.',
      letterRain: 'Letter Rain',
      letterRainSubtitle: 'Clear letter drops and keep the animals dry',
      countdownDefuse: 'Countdown Defuse',
      countdownDefuseSubtitle: 'Type the full sentence before the blast',
      backGameModes: 'Back to Game Modes',
      lowSpeed: 'Low Speed',
      highSpeed: 'High Speed',
      startGame: 'Start Game',
      survivalTime: 'Survival Time',
      clearedDrops: 'Drops Cleared',
      missedDrops: 'Drops Missed',
      seconds: 's',
      rainGameOver: 'The animals got wet',
      playAgain: 'Play Again',
      defusedBombs: 'Bombs Defused',
      countdown: 'Countdown',
      bombGameOver: 'The bomb exploded',
      typingErrors: 'Errors',
      backHome: 'Home',
      backMap: 'Map',
      mapTitle: 'Level Map',
      unlockHint: 'Earn 2 stars to unlock the next level',
      unlockReady: 'You earned 2 stars. The next level can unlock.',
      unlockNeedsMoreStars: 'Earn 2 stars to unlock the next level.',
      locked: 'Locked',
      startLevel: 'Start',
    introListening: 'Listening to the guide...',
    introReady: 'The introduction is finished. Ready to practice.',
    beginPractice: 'Start Practice',
    typingTarget: 'Target',
    currentTarget: 'Target',
    typedInput: 'Typed',
    noneInput: 'None',
    nextKey: 'Next Key',
    spaceKey: 'Space',
    accuracy: 'Accuracy',
      lives: 'Lives',
      progress: 'Progress',
      stars: 'Stars',
      wpm: 'Speed',
      resultTitle: 'Level Complete',
      resultRetry: 'Try Again',
      resultContinue: 'Back to Map',
      backFreePractice: 'Back to Free Practice',
      languageChinese: '中文',
      languageEnglish: 'English',
      audioOn: 'Sound On',
      audioOff: 'Sound Off',
      audioOnTooltip: 'Sound On',
      audioOffTooltip: 'Sound Off',
      switchToChineseTooltip: 'Switch to 中文',
      switchToEnglishTooltip: 'Switch to English',
      correctHint: 'Great, keep going!',
      errorHint: 'Try again. Look at the next letter.',
      completeHint: 'Finished! Let us count your stars.',
      'level.homeRowIndex': 'Index Fingers',
      'level.homeRowIndex.subtitle': 'Find F and J',
      'level.leftHome': 'Left Home Row',
      'level.leftHome.subtitle': 'Practice A S D F',
      'level.rightHome': 'Right Home Row',
      'level.rightHome.subtitle': 'Practice J K L',
      'level.homeWords': 'Home Row Words',
      'level.homeWords.subtitle': 'Build short words',
      'level.topRow': 'Top Row',
      'level.topRow.subtitle': 'Reach upward',
      'level.bottomRow': 'Bottom Row',
      'level.bottomRow.subtitle': 'Reach downward',
      'level.animalWords': 'Animal Words',
      'level.animalWords.subtitle': 'Type animal words',
      'level.shortSentences': 'Short Sentences',
      'level.shortSentences.subtitle': 'Type complete sentences',
      'npc.home': 'Ready? Put your index fingers on F and J. Let us go!',
      'npc.freePractice': 'This is free practice. It will not change map progress, so review at your own pace.',
      'npc.freePracticeLetters': 'Warm up first. Watch each letter or combo and type steadily.',
      'npc.freePracticeWords': 'Random words now. Read the whole word, then type.',
      'npc.freePracticeSentences': 'Sentence practice includes spaces and punctuation. Type one character at a time.',
      'npc.freePracticeMixed': 'Mixed practice starts now. Letters, words, and sentences may appear.',
      'npc.level1': 'This level is only about F and J. Feel the tiny bumps on the keys.',
      'npc.level2': 'Left-hand team, your turn. Accuracy first.',
      'npc.level3': 'Right-hand team now. Watch the target and move gently.',
      'npc.level4': 'Home row letters can become words. Type one letter at a time.',
      'npc.level5': 'Reach up for the top row, then come back home.',
      'npc.level6': 'Reach down for the bottom row, then come back home.',
      'npc.level7': 'Animal word challenge. Read the whole word, then type.',
      'npc.level8': 'Try short sentences. Spaces and periods count too.',
    },
  };

  const STORAGE_KEYS = {
    progress: 'pixeltype.progress.v1',
    language: 'pixeltype.language.v1',
    audio: 'pixeltype.audio.v1',
  };

  const rainAudioEngine = createRainAudioEngine();
  const bombAudioEngine = createBombAudioEngine();

  const state = {
    view: 'home',
    language: loadValue(STORAGE_KEYS.language, 'zh-CN'),
    audioEnabled: loadAudioEnabled(),
    progress: loadJson(STORAGE_KEYS.progress, { unlockedLevelIds: ['level-1'], levelStars: {} }),
    currentLevel: null,
    session: null,
    introStatus: 'idle',
    introText: '',
    introToken: 0,
    keyboardCase: 'lower',
    result: null,
    rainSession: null,
    bombSession: null,
    gameAnimationFrame: null,
  };

  const app = document.getElementById('app');

  document.addEventListener('keydown', (event) => {
    if (state.view === 'letter-rain') {
      handleLetterRainKey(event);
      return;
    }
    if (state.view === 'countdown-defuse') {
      handleCountdownDefuseKey(event);
      return;
    }
    if (state.view !== 'mission' || !state.session) return;
    if (isCapsLockEvent(event)) {
      event.preventDefault();
      const keyboardCaseChanged = syncKeyboardCaseFromEvent(event, { fallbackToggle: true });
      if (keyboardCaseChanged) render();
      return;
    }
    const keyboardCaseChanged = syncKeyboardCaseFromEvent(event);
    if (!event.ctrlKey && !event.metaKey && !event.altKey && shouldBeginPracticeFromKey(event.key, state.introStatus)) {
      event.preventDefault();
      beginPractice();
      return;
    }
    if (!canAcceptMissionInput(state.introStatus)) {
      if (keyboardCaseChanged) render();
      return;
    }
    if (!isMissionTypingEvent(event)) {
      if (keyboardCaseChanged) render();
      return;
    }
    event.preventDefault();
    handleMissionKey(event.key);
  });

  render();

  function level(id, order, titleKey, subtitleKey, focusKeys, targets, targetAccuracy, npcLineKey) {
    return { id, order, titleKey, subtitleKey, focusKeys, targets, targetAccuracy, npcLineKey };
  }

  function tr(key) {
    return STRINGS[state.language]?.[key] || STRINGS['zh-CN'][key] || key;
  }

  function getLevels() {
    return [...BUILT_IN_LEVELS];
  }

  function render() {
    document.body.classList.toggle('home-art-active', state.view === 'home');
    if (state.view === 'map') renderMap();
    else if (state.view === 'mission') renderMission();
    else if (state.view === 'free-practice') renderFreePractice();
    else if (state.view === 'games') renderGameModes();
    else if (state.view === 'letter-rain') renderLetterRain();
    else if (state.view === 'countdown-defuse') renderCountdownDefuse();
    else renderHome();
  }

  function renderShell(content) {
    app.innerHTML = `
      <section class="screen">
        <header class="top-bar">
          <div class="brand">
            <div class="logo-pixel" aria-hidden="true"></div>
            <div>
              <h1 class="brand-title">${renderPixelWord(tr('appTitle'), 'small')}</h1>
              <p class="brand-subtitle">${tr('appSubtitle')}</p>
            </div>
          </div>
          <div class="toolbar icon-toolbar">
            ${renderControlButtons()}
          </div>
        </header>
        ${content}
      </section>
    `;
    bindGlobalActions();
  }

  function renderHome() {
    app.innerHTML = `
      <section class="screen home-screen sprite-home-screen">
        <div class="pixel-home-stage" role="img" aria-label="${tr('appTitle')}">
          <img class="home-sprite bg-sprite bg-cloud-left-top" src="assets/sprites/bg-cloud-a.png" alt="">
          <img class="home-sprite bg-sprite bg-cloud-left-mid" src="assets/sprites/bg-cloud-b.png" alt="">
          <img class="home-sprite bg-sprite bg-cloud-right-top" src="assets/sprites/bg-cloud-b.png" alt="">
          <img class="home-sprite bg-sprite bg-cloud-right-mid" src="assets/sprites/bg-cloud-a.png" alt="">
          <img class="home-sprite bg-sprite bg-tree-left" src="assets/sprites/bg-tree-left.png" alt="">
          <img class="home-sprite bg-sprite bg-tree-right" src="assets/sprites/bg-tree-right.png" alt="">
          <img class="home-sprite bg-sprite bg-bush-left" src="assets/sprites/bg-bush.png" alt="">
          <img class="home-sprite bg-sprite bg-bush-right" src="assets/sprites/bg-bush.png" alt="">
          <img class="home-sprite bg-sprite bg-grass-left" src="assets/sprites/bg-grass.png" alt="">
          <img class="home-sprite bg-sprite bg-grass-right" src="assets/sprites/bg-grass.png" alt="">

          <div class="home-panel-shell">
            <span class="panel-corner top-left" aria-hidden="true"></span>
            <span class="panel-corner top-right" aria-hidden="true"></span>
            <span class="panel-corner bottom-left" aria-hidden="true"></span>
            <span class="panel-corner bottom-right" aria-hidden="true"></span>

            <header class="sprite-home-header">
              <div class="sprite-home-brand">
                <img class="home-sprite home-brand-icon" src="assets/sprites/home-brand-icon.png" alt="">
                <div class="home-title-stack">
                  <h1>${renderPixelWord(tr('appTitle'), 'home')}</h1>
                  <p class="home-subtitle-line"></p>
                  <p class="home-subtitle-dashes"></p>
                  <p class="sr-only">${tr('appSubtitle')}. ${tr('homeIntro')}. ${tr('npc.home')}</p>
                </div>
              </div>
              <div class="sprite-home-controls">
                ${renderControlButtons()}
              </div>
            </header>

            <nav class="sprite-home-menu" aria-label="${tr('appTitle')}">
              <button class="sprite-card adventure-card" data-action="show-map" aria-label="${tr('startAdventure')}">
                <img class="home-sprite button-sprite" src="assets/sprites/button-adventure.png" alt="">
                <span class="sr-only">${tr('startAdventure')}</span>
                <span class="sprite-tooltip">${tr('startAdventure')}</span>
              </button>
              <button class="sprite-card practice-card" data-action="start-free" aria-label="${tr('freePractice')}">
                <img class="home-sprite button-sprite" src="assets/sprites/button-practice.png" alt="">
                <span class="sr-only">${tr('freePractice')}</span>
                <span class="sprite-tooltip">${tr('freePractice')}</span>
              </button>
              <button class="sprite-card games-card" data-action="show-games" aria-label="${tr('gameModes')}">
                <img class="home-sprite button-sprite" src="assets/sprites/button-games.png" alt="">
                <span class="sr-only">${tr('gameModes')}</span>
                <span class="sprite-tooltip">${tr('gameModes')}</span>
              </button>
            </nav>

            <section class="sprite-map" aria-hidden="true">
              <img class="home-sprite sprite-map-art" src="assets/sprites/home-map.png" alt="">
            </section>

            <aside class="sprite-guide" aria-hidden="true">
              <img class="home-sprite sprite-speech" src="assets/sprites/speech-bubble.png" alt="">
              <img class="home-sprite sprite-robot" src="assets/sprites/robot-guide.png" alt="">
            </aside>
          </div>
        </div>
      </section>
    `;
    bindGlobalActions();
  }

  function renderControlButtons() {
    const audioTooltip = state.audioEnabled ? tr('audioOffTooltip') : tr('audioOnTooltip');
    const languageTooltip = state.language === 'zh-CN' ? tr('switchToEnglishTooltip') : tr('switchToChineseTooltip');
    return `
      <button class="sprite-icon-btn" data-action="toggle-audio" aria-label="${audioTooltip}">
        <img class="home-sprite" src="${getHomeSoundIcon()}" alt="">
        <span class="sprite-tooltip">${audioTooltip}</span>
      </button>
      <button class="sprite-icon-btn" data-action="toggle-language" aria-label="${languageTooltip}">
        <img class="home-sprite" src="${getHomeLanguageIcon()}" alt="">
        <span class="sprite-tooltip">${languageTooltip}</span>
      </button>
    `;
  }

  function renderMap() {
    const levels = getLevels();
    renderShell(`
      <div class="map-screen">
        <div class="toolbar">
          <button class="pixel-btn" data-action="home">${tr('backHome')}</button>
        </div>
        <h2>${tr('mapTitle')}</h2>
        <p class="unlock-hint">${tr('unlockHint')}</p>
        <section class="map-board" aria-label="${tr('mapTitle')}">
          <div class="map-grid adventure-path">
            ${levels.map((item) => renderLevelNode(item)).join('')}
          </div>
        </section>
      </div>
    `);
    document.querySelectorAll('[data-level-id]').forEach((button) => {
      button.addEventListener('click', () => startLevel(button.dataset.levelId));
    });
  }

  function renderFreePractice() {
    renderShell(`
      <div class="free-practice-screen">
        <div class="toolbar">
          <button class="pixel-btn" data-action="home">${tr('backHome')}</button>
        </div>
        <section class="free-practice-board">
          <div class="free-practice-heading">
            <h2>${tr('freePractice')}</h2>
            <p>${tr('freePracticeChoose')}</p>
          </div>
          <div class="free-practice-grid">
            ${FREE_PRACTICE_MODES.map((mode) => renderFreePracticeMode(mode)).join('')}
          </div>
        </section>
      </div>
    `);
  }

  function renderFreePracticeMode(mode) {
    return `
      <button class="free-practice-mode" data-action="start-free-mode" data-mode="${mode.id}">
        <span class="free-mode-badge">${mode.id === 'letters' ? 'A-Z' : mode.id === 'words' ? 'ABC' : mode.id === 'sentences' ? 'Aa.' : 'Mix'}</span>
        <span class="free-mode-copy">
          <strong>${tr(mode.titleKey)}</strong>
          <span>${tr(mode.subtitleKey)}</span>
        </span>
      </button>
    `;
  }

  function renderGameModes() {
    renderShell(`
      <div class="game-modes-screen">
        <div class="toolbar">
          <button class="pixel-btn" data-action="home">${tr('backHome')}</button>
        </div>
        <section class="game-modes-board">
          <div class="game-modes-heading">
            <h2>${tr('gameModes')}</h2>
            <p>${tr('gameModesChoose')}</p>
          </div>
          <div class="game-modes-grid">
            <article class="game-mode-card rain-mode-card">
              <span class="game-mode-badge">A-Z</span>
              <div class="game-mode-copy">
                <h3>${tr('letterRain')}</h3>
                <p>${tr('letterRainSubtitle')}</p>
                <div class="game-mode-actions">
                  <button class="pixel-btn primary" data-action="start-letter-rain" data-difficulty="low">${tr('lowSpeed')}</button>
                  <button class="pixel-btn secondary" data-action="start-letter-rain" data-difficulty="high">${tr('highSpeed')}</button>
                </div>
              </div>
            </article>
            <article class="game-mode-card bomb-mode-card">
              <span class="game-mode-badge">00:10</span>
              <div class="game-mode-copy">
                <h3>${tr('countdownDefuse')}</h3>
                <p>${tr('countdownDefuseSubtitle')}</p>
                <div class="game-mode-actions">
                  <button class="pixel-btn primary" data-action="start-countdown-defuse">${tr('startGame')}</button>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    `);
  }

  function renderLetterRain() {
    const session = state.rainSession;
    if (!session) {
      showGameModes();
      return;
    }
    const elapsed = getElapsedSeconds(session, performance.now());
    renderShell(`
      <div class="mini-game-screen letter-rain-screen">
        <div class="toolbar mini-game-toolbar">
          <button class="pixel-btn" data-action="show-games">${tr('backGameModes')}</button>
        </div>
        <div class="mini-game-stats">
          <div class="stat-box"><span>${tr('survivalTime')}</span><strong id="rain-time">${elapsed}${tr('seconds')}</strong></div>
          <div class="stat-box"><span>${tr('clearedDrops')}</span><strong id="rain-cleared">${session.cleared}</strong></div>
          <div class="stat-box"><span>${tr('missedDrops')}</span><strong id="rain-misses">${session.misses}/${RAIN_MISS_LIMIT}</strong></div>
          <div class="stat-box"><span>${tr('wpm')}</span><strong>${tr(session.difficulty === 'high' ? 'highSpeed' : 'lowSpeed')}</strong></div>
        </div>
        <section class="rain-arena" aria-label="${tr('letterRain')}">
          <div id="rain-layer" class="rain-layer">${renderRainDrops(session.drops)}</div>
          <div id="rain-splash-layer" class="rain-splash-layer" aria-hidden="true"></div>
          <div class="animal-floor" aria-hidden="true">
            <img class="animal-floor-ground" src="assets/sprites/game-animal-floor.png" alt="">
            <img class="animal-floor-character animal-floor-cat" src="assets/sprites/game-animal-cat.png" alt="">
            <img class="animal-floor-character animal-floor-frog" src="assets/sprites/game-animal-frog.png" alt="">
            <img class="animal-floor-character animal-floor-dog" src="assets/sprites/game-animal-dog.png" alt="">
          </div>
          ${session.status === 'ended' ? renderMiniGameResult({
            title: tr('rainGameOver'),
            stats: [
              `${tr('survivalTime')}：${elapsed}${tr('seconds')}`,
              `${tr('clearedDrops')}：${session.cleared}`,
            ],
            retryAction: 'retry-letter-rain',
          }) : ''}
        </section>
      </div>
    `);
  }

  function renderRainDrops(drops) {
    return drops.map((drop) => `
      <div class="rain-drop" data-drop-id="${drop.id}" style="--drop-x:${drop.xPercent}%;--drop-y:${drop.y}px">
        <img class="rain-drop-sprite" src="assets/sprites/game-raindrop.png" alt="">
        <span>${drop.letter}</span>
      </div>
    `).join('');
  }

  function renderCountdownDefuse({ animateExplosion = false } = {}) {
    const session = state.bombSession;
    if (!session) {
      showGameModes();
      return;
    }
    const now = performance.now();
    const remainingMs = Math.max(0, session.deadlineAt - now);
    renderShell(`
      <div class="mini-game-screen countdown-defuse-screen">
        <div class="toolbar mini-game-toolbar">
          <button class="pixel-btn" data-action="show-games">${tr('backGameModes')}</button>
        </div>
        <div class="mini-game-stats bomb-stats">
          <div class="stat-box"><span>${tr('countdown')}</span><strong id="bomb-time">${formatCountdown(remainingMs)}</strong></div>
          <div class="stat-box"><span>${tr('defusedBombs')}</span><strong id="bomb-defused">${session.defused}</strong></div>
          <div class="stat-box"><span>${tr('typingErrors')}</span><strong id="bomb-errors">${session.errors}</strong></div>
          <div class="stat-box"><span>${tr('progress')}</span><strong id="bomb-round">${session.round}</strong></div>
        </div>
        <section class="bomb-arena ${session.feedback === 'error' ? 'has-error' : ''} ${session.status === 'ended' ? 'is-ended' : ''} ${animateExplosion ? 'is-exploding' : ''}" aria-label="${tr('countdownDefuse')}">
          <div class="bomb-timer" aria-hidden="true">
            <img src="assets/sprites/game-bomb.png" alt="">
            <span id="bomb-clock">${formatCountdownValue(remainingMs)}</span>
          </div>
          <div id="bomb-sentence" class="bomb-sentence-progress">${renderBombSentence(session.sentence, session.input)}</div>
          ${animateExplosion ? `
            <div class="bomb-explosion" aria-hidden="true">
              <span class="bomb-explosion-core"></span>
              <span class="bomb-explosion-ring"></span>
              <span class="bomb-explosion-debris"></span>
            </div>
          ` : ''}
          ${session.status === 'ended' ? renderMiniGameResult({
            title: tr('bombGameOver'),
            stats: [
              `${tr('survivalTime')}：${getElapsedSeconds(session, now)}${tr('seconds')}`,
              `${tr('defusedBombs')}：${session.defused}`,
            ],
            retryAction: 'retry-countdown-defuse',
          }) : ''}
        </section>
      </div>
    `);
  }

  function renderBombSentence(sentence, input) {
    const typed = escapeHtml(sentence.slice(0, input.length));
    const next = escapeHtml(sentence[input.length] || '');
    const pending = escapeHtml(sentence.slice(input.length + (next ? 1 : 0)));
    return `<span class="bomb-typed">${typed}</span><span class="bomb-next">${next}</span><span class="bomb-pending">${pending}</span>`;
  }

  function formatCountdown(remainingMs) {
    return `${Math.max(0, remainingMs / 1000).toFixed(1)}${tr('seconds')}`;
  }

  function formatCountdownValue(remainingMs) {
    return Math.max(0, remainingMs / 1000).toFixed(1);
  }

  function renderMiniGameResult({ title, stats, retryAction }) {
    return `
      <div class="mini-game-result">
        <div class="mini-game-result-card">
          <h2>${title}</h2>
          ${stats.map((item) => `<p>${item}</p>`).join('')}
          <div class="hero-actions">
            <button class="pixel-btn secondary" data-action="${retryAction}">${tr('playAgain')}</button>
            <button class="pixel-btn primary" data-action="show-games">${tr('backGameModes')}</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderLevelNode(item) {
    const unlocked = state.progress.unlockedLevelIds.includes(item.id);
    const stars = state.progress.levelStars[item.id] || 0;
    const title = item.title || tr(item.titleKey);
    const subtitle = item.subtitle || tr(item.subtitleKey);
    return `
      <article class="level-node ${unlocked ? 'unlocked' : 'locked'}">
        <div class="level-number">${item.order}</div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(subtitle)}</p>
        <div class="focus-keys">${item.focusKeys.map((key) => `<span class="keycap">${escapeHtml(key)}</span>`).join('')}</div>
        <div class="star-row">${renderStars(stars)}</div>
        <button class="pixel-btn primary" data-level-id="${item.id}" ${unlocked ? '' : 'disabled'}>${unlocked ? tr('startLevel') : tr('locked')}</button>
      </article>
    `;
  }

  function renderMission() {
    const session = state.session;
    const levelData = state.currentLevel;
    const target = getCurrentTarget(session);
    const stats = getSessionStats(session);
    const backAction = levelData.isFreePractice ? 'start-free' : 'show-map';
    const backLabel = levelData.isFreePractice ? tr('freePractice') : tr('backMap');
    renderShell(`
      <div class="mission-screen">
        <div class="toolbar">
          <button class="pixel-btn" data-action="${backAction}">${backLabel}</button>
        </div>
        <div class="stats-row">
          <div class="stat-box"><span>${tr('progress')}</span>${session.completedTargets}/${session.targets.length}</div>
          <div class="stat-box"><span>${tr('accuracy')}</span>${stats.accuracy}%</div>
          <div class="stat-box"><span>${tr('wpm')}</span>${stats.wpm}</div>
          <div class="stat-box"><span>${tr('stars')}</span>${renderStars(stats.stars)}</div>
        </div>
        <section class="mission-stage">
          <div class="mission-target-zone">
            <div class="target-card ${session.feedback === 'error' ? 'error' : ''}">${escapeHtml(target)}</div>
          </div>
          <div class="input-dock">
            <div class="keyboard">${renderKeyboard(target, session.currentInput)}</div>
          </div>
          ${state.introStatus !== 'playing' ? renderIntroOverlay() : ''}
        </section>
      </div>
      ${state.result ? renderResultModal() : ''}
    `);
  }

  function renderResultModal() {
    const result = state.result;
    const continueLabel = state.currentLevel?.isFreePractice ? tr('backFreePractice') : tr('resultContinue');
    const unlockNote = state.currentLevel?.isFreePractice
      ? ''
      : `<p class="result-unlock-note">${shouldUnlockNextLevel(result) ? tr('unlockReady') : tr('unlockNeedsMoreStars')}</p>`;
    return `
      <div class="result-modal">
        <div class="result-card">
          <h2>${tr('resultTitle')}</h2>
          <div class="result-stars">${renderStars(result.stars)}</div>
          <p>${tr('accuracy')}：${result.accuracy}%</p>
          <p>${tr('wpm')}：${result.wpm}</p>
          ${unlockNote}
          <div class="hero-actions" style="justify-content:center">
            <button class="pixel-btn secondary" data-action="retry-level">${tr('resultRetry')}</button>
            <button class="pixel-btn primary" data-action="finish-level">${continueLabel}</button>
          </div>
        </div>
      </div>
    `;
  }

  function bindGlobalActions() {
    document.querySelectorAll('[data-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.action;
        if (action === 'toggle-language') toggleLanguage();
        if (action === 'toggle-audio') toggleAudio();
        if (action === 'show-map') showMap();
        if (action === 'home') showHome();
        if (action === 'show-games') showGameModes();
        if (action === 'start-letter-rain') startLetterRain(button.dataset.difficulty);
        if (action === 'retry-letter-rain') startLetterRain(state.rainSession?.difficulty || 'low');
        if (action === 'start-countdown-defuse') startCountdownDefuse();
        if (action === 'retry-countdown-defuse') startCountdownDefuse();
        if (action === 'start-free') showFreePractice();
        if (action === 'start-free-mode') startFreePractice(button.dataset.mode);
        if (action === 'begin-practice') beginPractice();
        if (action === 'toggle-keyboard-case') toggleKeyboardCase();
        if (action === 'retry-level') {
          if (state.currentLevel?.isFreePractice) startFreePractice(state.currentLevel.freePracticeMode);
          else startLevel(state.currentLevel.id);
        }
        if (action === 'finish-level') finishLevel();
      });
    });
  }

  function showHome() {
    stopGameLoop();
    state.view = 'home';
    state.currentLevel = null;
    state.session = null;
    state.introStatus = 'idle';
    state.introToken += 1;
    state.result = null;
    render();
  }

  function showMap() {
    stopGameLoop();
    state.view = 'map';
    state.introStatus = 'idle';
    state.introToken += 1;
    state.result = null;
    render();
  }

  function showFreePractice() {
    stopGameLoop();
    state.view = 'free-practice';
    state.currentLevel = null;
    state.session = null;
    state.introStatus = 'idle';
    state.introToken += 1;
    state.result = null;
    render();
  }

  function showGameModes() {
    stopGameLoop();
    state.view = 'games';
    state.rainSession = null;
    state.bombSession = null;
    state.result = null;
    render();
  }

  function startLetterRain(difficulty = 'low') {
    stopGameLoop();
    if (state.audioEnabled) rainAudioEngine.start();
    const now = performance.now();
    state.rainSession = createRainSession({ difficulty, now });
    state.bombSession = null;
    state.view = 'letter-rain';
    render();
    startGameLoop();
  }

  function handleLetterRainKey(event) {
    if (!state.rainSession || state.rainSession.status !== 'playing') return;
    if (!/^[a-z]$/i.test(event.key || '')) return;
    event.preventDefault();
    const clearedBefore = state.rainSession.cleared;
    state.rainSession = hitRainLetter(state.rainSession, event.key);
    playFeedbackSound(state.rainSession.cleared > clearedBefore ? 'rain-hit' : 'error');
    updateLetterRainScene(performance.now());
  }

  function startCountdownDefuse() {
    stopGameLoop();
    if (state.audioEnabled) bombAudioEngine.start();
    const now = performance.now();
    state.bombSession = createBombSession({
      sentences: FREE_PRACTICE_POOLS.sentences,
      now,
    });
    state.rainSession = null;
    state.view = 'countdown-defuse';
    render();
    startGameLoop();
  }

  function handleCountdownDefuseKey(event) {
    if (!state.bombSession || state.bombSession.status !== 'playing') return;
    if (event.ctrlKey || event.metaKey || event.altKey || typeof event.key !== 'string' || event.key.length !== 1) return;
    event.preventDefault();
    const previousInput = state.bombSession.input;
    const previousDefused = state.bombSession.defused;
    state.bombSession = typeBombKey(state.bombSession, event.key, { now: performance.now() });
    if (state.bombSession.feedback === 'error') {
      playFeedbackSound('error');
      showBombError();
      return;
    }
    playFeedbackSound('correct');
    if (state.bombSession.defused > previousDefused) {
      renderCountdownDefuse();
      startGameLoop();
      return;
    }
    if (state.bombSession.input !== previousInput) updateCountdownDefuseScene(performance.now());
  }

  function startGameLoop() {
    if (state.gameAnimationFrame !== null) return;
    state.gameAnimationFrame = window.requestAnimationFrame(runGameFrame);
  }

  function stopGameLoop() {
    rainAudioEngine.stop();
    bombAudioEngine.stop();
    if (state.gameAnimationFrame !== null) {
      window.cancelAnimationFrame(state.gameAnimationFrame);
      state.gameAnimationFrame = null;
    }
  }

  function runGameFrame(now) {
    state.gameAnimationFrame = null;
    if (state.view === 'letter-rain' && state.rainSession?.status === 'playing') {
      const missesBefore = state.rainSession.misses;
      const arena = document.querySelector('.rain-arena');
      const landingY = calculateRainLandingY(arena?.clientHeight || 500);
      state.rainSession = advanceRainSession(state.rainSession, { now, landingY });
      if (state.rainSession.misses > missesBefore) {
        playRainLandingSound();
        showRainSplashes(state.rainSession.landedDrops);
      }
      if (state.rainSession.status === 'ended') {
        stopGameLoop();
        renderLetterRain();
        return;
      }
      updateLetterRainScene(now);
      startGameLoop();
      return;
    }
    if (state.view === 'countdown-defuse' && state.bombSession?.status === 'playing') {
      state.bombSession = advanceBombSession(state.bombSession, now);
      if (state.bombSession.status === 'ended') {
        if (state.audioEnabled) bombAudioEngine.playExplosion();
        renderCountdownDefuse({ animateExplosion: true });
        return;
      }
      updateCountdownDefuseScene(now);
      startGameLoop();
    }
  }

  function updateLetterRainScene(now) {
    const session = state.rainSession;
    if (!session) return;
    const layer = document.getElementById('rain-layer');
    const time = document.getElementById('rain-time');
    const cleared = document.getElementById('rain-cleared');
    const misses = document.getElementById('rain-misses');
    if (layer) layer.innerHTML = renderRainDrops(session.drops);
    if (time) time.textContent = `${getElapsedSeconds(session, now)}${tr('seconds')}`;
    if (cleared) cleared.textContent = String(session.cleared);
    if (misses) misses.textContent = `${session.misses}/${RAIN_MISS_LIMIT}`;
  }

  function showRainSplashes(landedDrops) {
    const layer = document.getElementById('rain-splash-layer');
    if (!layer) return;
    landedDrops.forEach((drop) => {
      const splash = document.createElement('span');
      splash.className = 'rain-splash visible';
      splash.style.left = `${drop.xPercent}%`;
      layer.appendChild(splash);
      window.setTimeout(() => splash.remove(), 420);
    });
  }

  function updateCountdownDefuseScene(now) {
    const session = state.bombSession;
    if (!session) return;
    const remainingMs = Math.max(0, session.deadlineAt - now);
    const remaining = formatCountdown(remainingMs);
    const remainingValue = formatCountdownValue(remainingMs);
    const time = document.getElementById('bomb-time');
    const clock = document.getElementById('bomb-clock');
    const sentence = document.getElementById('bomb-sentence');
    const defused = document.getElementById('bomb-defused');
    const errors = document.getElementById('bomb-errors');
    const round = document.getElementById('bomb-round');
    if (time) time.textContent = remaining;
    if (clock) clock.textContent = remainingValue;
    if (sentence) sentence.innerHTML = renderBombSentence(session.sentence, session.input);
    if (defused) defused.textContent = String(session.defused);
    if (errors) errors.textContent = String(session.errors);
    if (round) round.textContent = String(session.round);
  }

  function showBombError() {
    const arena = document.querySelector('.bomb-arena');
    if (!arena) return;
    arena.classList.remove('has-error');
    void arena.offsetWidth;
    arena.classList.add('has-error');
    const errors = document.getElementById('bomb-errors');
    if (errors) errors.textContent = String(state.bombSession.errors);
  }

  function toggleLanguage() {
    state.language = state.language === 'zh-CN' ? 'en-US' : 'zh-CN';
    localStorage.setItem(STORAGE_KEYS.language, state.language);
    refreshIntroTextForLanguage();
    render();
  }

  function toggleAudio() {
    state.audioEnabled = !state.audioEnabled;
    localStorage.setItem(STORAGE_KEYS.audio, String(state.audioEnabled));
    if (state.audioEnabled) {
      if (state.view === 'letter-rain' && state.rainSession?.status === 'playing') rainAudioEngine.start();
      if (state.view === 'countdown-defuse' && state.bombSession?.status === 'playing') bombAudioEngine.start();
    } else {
      rainAudioEngine.stop();
      bombAudioEngine.stop();
    }
    const canceledSpeech = cancelActiveSpeechOnAudioOff(state.audioEnabled, window.speechSynthesis);
    if (canceledSpeech && state.view === 'mission' && state.introStatus === 'speaking') {
      completeIntro(state.introToken);
      return;
    }
    render();
  }

  function getHomeSoundIcon() {
    return state.audioEnabled
      ? 'assets/sprites/icon-sound-on.png'
      : 'assets/sprites/icon-sound-off.png';
  }

  function getHomeLanguageIcon() {
    return state.language === 'zh-CN'
      ? 'assets/sprites/icon-language-zh.png'
      : 'assets/sprites/icon-language-en.png';
  }

  function startLevel(levelId) {
    const item = getLevels().find((candidate) => candidate.id === levelId);
    if (!item) return;
    startMission(item);
  }

  function startFreePractice(modeId = 'mixed') {
    const mission = buildFreePracticeMission(modeId);
    startMission({
      ...mission,
      title: tr(mission.titleKey),
      subtitle: tr(mission.subtitleKey),
    });
  }

  function startMission(item) {
    state.currentLevel = item;
    state.session = createTypingSession({
      targets: item.targets,
      targetAccuracy: item.targetAccuracy || 85,
    });
    state.introText = getNpcText(item, 'ready');
    state.introToken += 1;
    const introToken = state.introToken;
    state.introStatus = getInitialIntroStatus({
      audioEnabled: state.audioEnabled,
      canSpeak: 'speechSynthesis' in window,
    });
    state.result = null;
    state.view = 'mission';
    state.keyboardCase = 'lower';
    if (state.introStatus === 'speaking') {
      speakIntro(state.introText, item.npcLanguage || state.language, introToken);
    }
    render();
  }

  function toggleKeyboardCase() {
    state.keyboardCase = state.keyboardCase === 'upper' ? 'lower' : 'upper';
    render();
  }

  function syncKeyboardCaseFromEvent(event, options = {}) {
    if (!event || typeof event.getModifierState !== 'function') return false;
    const nextCase = event.getModifierState('CapsLock') ? 'upper' : 'lower';
    if (state.keyboardCase === nextCase && options.fallbackToggle) {
      state.keyboardCase = state.keyboardCase === 'upper' ? 'lower' : 'upper';
      return true;
    }
    if (state.keyboardCase === nextCase) return false;
    state.keyboardCase = nextCase;
    return true;
  }

  function isCapsLockEvent(event) {
    return event?.key === 'CapsLock' || event?.code === 'CapsLock';
  }

  function isMissionTypingEvent(event) {
    if (!event || event.ctrlKey || event.metaKey || event.altKey) return false;
    if (isCapsLockEvent(event)) return false;
    return typeof event.key === 'string' && event.key.length === 1;
  }

  function beginPractice() {
    if (state.view !== 'mission' || state.introStatus !== 'ready') return;
    state.introStatus = 'playing';
    state.session = {
      ...state.session,
      startedAt: Date.now(),
      updatedAt: Date.now(),
    };
    render();
  }

  function triggerTargetShake() {
    const targetCard = document.querySelector('.target-card.error');
    if (!targetCard) return;
    targetCard.classList.remove('shake');
    void targetCard.offsetWidth;
    targetCard.addEventListener('animationend', () => {
      targetCard.classList.remove('shake');
    }, { once: true });
    targetCard.classList.add('shake');
  }

  function handleMissionKey(key) {
    if (!canAcceptMissionInput(state.introStatus)) return;
    if (state.result || state.session.isComplete) return;
    const previousFeedback = state.session.feedback;
    const previousTotalKeys = state.session.totalKeys;
    state.session = handleTypingKey(state.session, key);
    const inputWasScored = state.session.totalKeys > previousTotalKeys;
    const shouldShakeTarget = inputWasScored && state.session.feedback === 'error';
    if (!inputWasScored) {
      return;
    }
    if (state.session.feedback === 'error') {
      playFeedbackSound('error');
    } else if (state.session.feedback === 'correct' || state.session.feedback === 'target-complete') {
      playFeedbackSound('correct');
    }
    if (state.session.feedback === 'error' && previousFeedback !== 'error') {
      speak(tr('errorHint'), state.language);
    }
    if (state.session.isComplete && !state.result) {
      state.result = getSessionStats(state.session);
      speak(tr('completeHint'), state.language);
    }
    render();
    if (shouldShakeTarget) triggerTargetShake();
  }

  function finishLevel() {
    if (state.currentLevel?.isFreePractice) {
      showFreePractice();
      return;
    }
    const orderedLevelIds = getLevels().map((item) => item.id);
    state.progress = saveLevelResult(state.currentLevel.id, state.result, orderedLevelIds);
    state.result = null;
    state.view = 'map';
    render();
  }

  function createTypingSession(options) {
    return {
      targets: options.targets,
      targetAccuracy: options.targetAccuracy,
      startedAt: Date.now(),
      updatedAt: Date.now(),
      currentTargetIndex: 0,
      currentInput: '',
      completedTargets: 0,
      correctKeys: 0,
      totalKeys: 0,
      errors: 0,
      maxCombo: 0,
      combo: 0,
      feedback: 'ready',
      isComplete: options.targets.length === 0,
    };
  }

  function getCurrentTarget(session) {
    return session.targets[session.currentTargetIndex] || '';
  }

  function handleTypingKey(session, rawKey) {
    if (session.isComplete || rawKey.length !== 1) return session;
    const key = rawKey;
    const target = getCurrentTarget(session);
    const expected = target[session.currentInput.length];
    const next = { ...session, totalKeys: session.totalKeys + 1, updatedAt: Date.now() };

    if (key !== expected) {
      return { ...next, errors: next.errors + 1, combo: 0, feedback: 'error' };
    }

    const currentInput = session.currentInput + key;
    const combo = session.combo + 1;
    const completedThisTarget = currentInput.length === target.length;
    const completedTargets = completedThisTarget ? session.completedTargets + 1 : session.completedTargets;
    const currentTargetIndex = completedThisTarget ? session.currentTargetIndex + 1 : session.currentTargetIndex;

    return {
      ...next,
      currentInput: completedThisTarget ? '' : currentInput,
      completedTargets,
      currentTargetIndex,
      correctKeys: next.correctKeys + 1,
      combo,
      maxCombo: Math.max(session.maxCombo, combo),
      feedback: completedThisTarget ? 'target-complete' : 'correct',
      isComplete: completedTargets >= session.targets.length,
    };
  }

  function getSessionStats(session) {
    const elapsedMinutes = Math.max((Date.now() - session.startedAt) / 60000, 1 / 60);
    const accuracy = session.totalKeys === 0 ? 100 : Math.round((session.correctKeys / session.totalKeys) * 100);
    const wpm = Math.round((session.correctKeys / 5) / elapsedMinutes);
    const passed = session.isComplete && accuracy >= session.targetAccuracy;
    const stars = passed ? (accuracy >= 97 ? 3 : accuracy >= 90 ? 2 : 1) : 0;
    return { accuracy, wpm, passed, stars };
  }

  function saveLevelResult(levelId, result, orderedLevelIds) {
    const previousStars = state.progress.levelStars[levelId] || 0;
    state.progress.levelStars[levelId] = Math.max(previousStars, result.stars || 0);
    if (shouldUnlockNextLevel(result)) {
      const index = orderedLevelIds.indexOf(levelId);
      const nextLevel = orderedLevelIds[index + 1];
      if (nextLevel && !state.progress.unlockedLevelIds.includes(nextLevel)) {
        state.progress.unlockedLevelIds.push(nextLevel);
      }
    }
    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(state.progress));
    return state.progress;
  }

  function shouldUnlockNextLevel(result) {
    return result.passed && (result.stars || 0) >= UNLOCK_REQUIRED_STARS;
  }

  function getNpcText(levelData, feedback) {
    if (feedback === 'error') return tr('errorHint');
    if (feedback === 'correct' || feedback === 'target-complete') return tr('correctHint');
    if (levelData.npcLineKey) return tr(levelData.npcLineKey);
    return levelData.npcLine || tr(levelData.npcLineKey);
  }

  function refreshIntroTextForLanguage() {
    if (state.view !== 'mission' || !state.currentLevel || state.introStatus === 'idle') return;
    state.introText = getNpcText(state.currentLevel, 'ready');
  }

  function renderIntroOverlay() {
    const isSpeaking = state.introStatus === 'speaking';
    return `
      <div class="intro-overlay">
        <div class="intro-card">
          <img class="intro-guide-icon" src="assets/sprites/home-brand-icon.png" alt="">
          <h3>${isSpeaking ? tr('introListening') : tr('introReady')}</h3>
          <p>${escapeHtml(state.introText)}</p>
          <button class="pixel-btn primary" data-action="begin-practice" ${isSpeaking ? 'disabled' : ''}>${tr('beginPractice')}</button>
        </div>
      </div>
    `;
  }

  function speak(text, language) {
    if (!state.audioEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language || state.language;
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
  }

  function speakIntro(text, language, introToken) {
    if (!state.audioEnabled || !('speechSynthesis' in window)) {
      completeIntro(introToken);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    let completed = false;
    let fallbackTimer = null;
    const introStartedAt = Date.now();
    const fallbackMinimumMs = getIntroFallbackMinimumMs(text);

    function done() {
      if (completed) return;
      completed = true;
      window.clearTimeout(fallbackTimer);
      completeIntro(introToken);
    }

    function checkFallback() {
      if (completed) return;
      if (shouldCompleteIntroFallback({
        speaking: window.speechSynthesis.speaking,
        pending: window.speechSynthesis.pending,
        elapsedMs: Date.now() - introStartedAt,
        minimumMs: fallbackMinimumMs,
      })) {
        done();
        return;
      }
      fallbackTimer = window.setTimeout(checkFallback, 400);
    }

    utterance.lang = language || state.language;
    utterance.rate = 0.92;
    utterance.onend = done;
    utterance.onerror = done;
    window.speechSynthesis.speak(utterance);
    fallbackTimer = window.setTimeout(checkFallback, 1200);
  }

  function completeIntro(introToken) {
    if (state.view !== 'mission' || introToken !== state.introToken) return;
    state.introStatus = 'ready';
    render();
  }

  function playRainLandingSound() {
    if (!state.audioEnabled) return;
    rainAudioEngine.playLanding();
  }

  function playFeedbackSound(kind) {
    if (!state.audioEnabled) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const config = getFeedbackSound(kind);
    const audioContext = getAudioContext(AudioContextClass);
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;

    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(config.frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(config.gain, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + config.duration);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + config.duration + 0.01);
  }

  function getAudioContext(AudioContextClass) {
    if (!state.audioContext) {
      state.audioContext = new AudioContextClass();
    }
    if (state.audioContext.state === 'suspended') {
      state.audioContext.resume();
    }
    return state.audioContext;
  }

  function getFeedbackSound(kind) {
    const sounds = {
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
      'rain-hit': {
        type: 'triangle',
        frequency: 880,
        duration: 0.08,
        gain: 0.045,
      },
    };
    return sounds[kind] || sounds.correct;
  }

  function canAcceptMissionInput(introStatus) {
    return introStatus === 'playing';
  }

  function getInitialIntroStatus({ audioEnabled, canSpeak }) {
    return audioEnabled && canSpeak ? 'speaking' : 'ready';
  }

  function shouldBeginPracticeFromKey(key, introStatus) {
    return introStatus === 'ready' && (key === 'Enter' || key === ' ' || key === 'Space' || key === 'Spacebar');
  }

  function cancelActiveSpeechOnAudioOff(audioEnabled, speechSynthesis) {
    if (audioEnabled || !speechSynthesis || typeof speechSynthesis.cancel !== 'function') return false;
    speechSynthesis.cancel();
    return true;
  }

  function shouldCompleteIntroFallback({ speaking, pending, elapsedMs = 0, minimumMs = 0 }) {
    return elapsedMs >= minimumMs && !speaking && !pending;
  }

  function getIntroFallbackMinimumMs(text) {
    const compactText = String(text || '').replace(/\s+/g, '');
    const estimatedMs = compactText.length * 90;
    return Math.min(Math.max(estimatedMs, 2200), 12000);
  }

  function renderStars(count) {
    return '★★★'.split('').map((star, index) => index < count ? star : '☆').join('');
  }

  function renderPixelWord(text, sizeClass) {
    const letters = String(text).split('').map((char) => {
      return renderSpriteGlyph(char, sizeClass);
    }).join('');

    return `
      <span class="pixel-logo-wrap">
        <span class="pixel-word ${sizeClass}" aria-hidden="true">${letters}</span>
        <span class="sr-only">${escapeHtml(text)}</span>
      </span>
    `;
  }

  function renderSpriteGlyph(char, sizeClass) {
    if (!PIXEL_SPRITE_FONT_CHARS.includes(char)) return '';
    const isUpper = /[A-Z]/.test(char);
    const src = isUpper
      ? `assets/sprites/font/upper-${char}.png`
      : `assets/sprites/font/lower-${char}.png`;
    const caseClass = isUpper ? 'upper' : 'lower';
    const advance = PIXEL_GLYPH_ADVANCE[char] || PIXEL_GLYPH_ADVANCE[char.toLowerCase()] || 10;
    return `<span class="pixel-glyph-slot ${caseClass} ${sizeClass}" style="--glyph-advance:${advance}"><img class="pixel-glyph ${caseClass} ${sizeClass}" src="${src}" alt=""></span>`;
  }

  function renderKeyboard(target, input) {
    const rawNext = target[input.length];
    const next = getKeyboardKeyName(rawNext);
    const needsCaseSwitch = shouldPromptCapsSwitch(rawNext);
    const letterRows = KEYBOARD_ROWS.map((row, index) => {
      const rowClass = ['top-row', 'home-row', 'bottom-row'][index];
      return `<div class="keyboard-row ${rowClass}">${row.map((keyConfig) => renderKeycap(keyConfig, next, needsCaseSwitch)).join('')}</div>`;
    }).join('');
    const spaceRow = `<div class="keyboard-row space-row">${SPACE_KEY_ROW.map((keyConfig) => renderKeycap(keyConfig, next, needsCaseSwitch)).join('')}</div>`;
    return `${letterRows}${spaceRow}`;
  }

  function renderKeycap(keyConfig, next, needsCaseSwitch = false) {
    const key = typeof keyConfig === 'string' ? keyConfig : keyConfig.key;
    const column = typeof keyConfig === 'string' ? '' : `--key-column:${keyConfig.column};`;
    const span = typeof keyConfig === 'string' || !keyConfig.span ? '' : `--key-span:${keyConfig.span};`;
    const style = column || span ? ` style="${column}${span}"` : '';
    if (key === 'Case') {
      const active = needsCaseSwitch ? 'active' : '';
      const classes = ['keycap', 'case-key', active].filter(Boolean).join(' ');
      return `<button class="${classes}" data-action="toggle-keyboard-case" type="button"${style}>Caps</button>`;
    }
    const active = !needsCaseSwitch && key === next ? 'active' : '';
    const isLetter = /^[A-Z]$/.test(key);
    const label = isLetter ? (state.keyboardCase === 'upper' ? key : key.toLowerCase()) : key;
    const classes = [
      'keycap',
      active,
      key === 'Space' ? 'space-key' : '',
      !isLetter && key !== 'Space' ? 'symbol-key' : '',
    ].filter(Boolean).join(' ');
    return `<span class="${classes}"${style}>${escapeHtml(label)}</span>`;
  }

  function getKeyboardKeyName(key) {
    if (key === ' ') return 'Space';
    return key?.toUpperCase();
  }

  function shouldPromptCapsSwitch(key) {
    if (!isLetterKey(key)) return false;
    const targetCase = isUppercaseLetter(key) ? 'upper' : 'lower';
    return targetCase !== state.keyboardCase;
  }

  function isLetterKey(key) {
    return /^[a-zA-Z]$/.test(key || '');
  }

  function isUppercaseLetter(key) {
    return /^[A-Z]$/.test(key || '');
  }

  function loadValue(key, fallback) {
    try {
      return localStorage.getItem(key) || fallback;
    } catch {
      return fallback;
    }
  }

  function loadJson(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function loadAudioEnabled() {
    const combined = localStorage.getItem(STORAGE_KEYS.audio);
    if (combined !== null) return combined !== 'false';

    const storedSpeechPreference = localStorage.getItem('pixeltype.speech.v1');
    const storedSoundPreference = localStorage.getItem('pixeltype.sound.v1');
    return storedSpeechPreference !== 'false' && storedSoundPreference !== 'false';
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
})();
