(function () {
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
      editLevels: '编辑关卡',
      backHome: '返回首页',
      backMap: '返回地图',
      mapTitle: '闯关地图',
      customArea: '自定义关卡',
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
    accuracy: '准确率',
      lives: '生命',
      progress: '进度',
      stars: '星星',
      wpm: '速度',
      resultTitle: '关卡完成',
      resultRetry: '再练一次',
      resultContinue: '回到地图',
      editorTitle: '关卡编辑器',
      editorName: '关卡名称',
      editorDefaultTitle: '动物单词',
      editorTargets: '练习内容',
      editorTargetsHint: '用逗号或换行分隔，例如 cat, dog, fish',
      editorDifficulty: '难度',
      editorNpcLanguage: 'NPC 语音',
      editorPreviewSpeech: '小向导：请输入这个动物单词！',
      customLevelDefaultTitle: '自定义关卡',
      customLevelDefaultSubtitle: '自定义练习',
      customLevelDefaultNpcLine: '看准目标，一个字母一个字母输入。',
      languageChinese: '中文',
      languageEnglish: 'English',
      saveLevel: '保存关卡',
      preview: '预览',
      noCustomLevels: '还没有自定义关卡。',
      audioOn: '声音开',
      audioOff: '声音关',
      difficultySlow: '慢速',
      difficultyNormal: '普通',
      difficultyChallenge: '挑战',
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
      editLevels: 'Level Editor',
      backHome: 'Home',
      backMap: 'Map',
      mapTitle: 'Level Map',
      customArea: 'Custom Levels',
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
    accuracy: 'Accuracy',
      lives: 'Lives',
      progress: 'Progress',
      stars: 'Stars',
      wpm: 'Speed',
      resultTitle: 'Level Complete',
      resultRetry: 'Try Again',
      resultContinue: 'Back to Map',
      editorTitle: 'Level Editor',
      editorName: 'Level Name',
      editorDefaultTitle: 'Animal Words',
      editorTargets: 'Targets',
      editorTargetsHint: 'Separate with commas or lines, such as cat, dog, fish',
      editorDifficulty: 'Difficulty',
      editorNpcLanguage: 'NPC Voice',
      editorPreviewSpeech: 'Guide: Type this animal word!',
      customLevelDefaultTitle: 'Custom Level',
      customLevelDefaultSubtitle: 'Custom Practice',
      customLevelDefaultNpcLine: 'Look at the target and type one letter at a time.',
      languageChinese: '中文',
      languageEnglish: 'English',
      saveLevel: 'Save Level',
      preview: 'Preview',
      noCustomLevels: 'No custom levels yet.',
      audioOn: 'Sound On',
      audioOff: 'Sound Off',
      difficultySlow: 'Slow',
      difficultyNormal: 'Normal',
      difficultyChallenge: 'Challenge',
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
    customLevels: 'pixeltype.customLevels.v1',
    language: 'pixeltype.language.v1',
    audio: 'pixeltype.audio.v1',
  };

  const state = {
    view: 'home',
    language: loadValue(STORAGE_KEYS.language, 'zh-CN'),
    audioEnabled: loadAudioEnabled(),
    progress: loadJson(STORAGE_KEYS.progress, { unlockedLevelIds: ['level-1'], levelStars: {} }),
    customLevels: loadJson(STORAGE_KEYS.customLevels, []),
    currentLevel: null,
    session: null,
    introStatus: 'idle',
    introText: '',
    introToken: 0,
    result: null,
  };

  const app = document.getElementById('app');

  document.addEventListener('keydown', (event) => {
    if (state.view !== 'mission' || !state.session) return;
    if (!event.ctrlKey && !event.metaKey && !event.altKey && shouldBeginPracticeFromKey(event.key, state.introStatus)) {
      event.preventDefault();
      beginPractice();
      return;
    }
    if (!canAcceptMissionInput(state.introStatus)) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key.length !== 1) return;
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
    return [...BUILT_IN_LEVELS, ...state.customLevels.map((custom, index) => ({
      ...custom,
      order: BUILT_IN_LEVELS.length + index + 1,
      isCustom: true,
    }))];
  }

  function render() {
    document.body.classList.toggle('home-art-active', state.view === 'home');
    if (state.view === 'map') renderMap();
    else if (state.view === 'mission') renderMission();
    else if (state.view === 'editor') renderEditor();
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
              </button>
              <button class="sprite-card practice-card" data-action="start-free" aria-label="${tr('freePractice')}">
                <img class="home-sprite button-sprite" src="assets/sprites/button-practice.png" alt="">
                <span class="sr-only">${tr('freePractice')}</span>
              </button>
              <button class="sprite-card editor-card" data-action="show-editor" aria-label="${tr('editLevels')}">
                <img class="home-sprite button-sprite" src="assets/sprites/button-editor.png" alt="">
                <span class="sr-only">${tr('editLevels')}</span>
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
    return `
      <button class="sprite-icon-btn" data-action="toggle-audio" aria-label="${state.audioEnabled ? tr('audioOn') : tr('audioOff')}">
        <img class="home-sprite" src="${getHomeSoundIcon()}" alt="">
      </button>
      <button class="sprite-icon-btn" data-action="toggle-language" aria-label="${state.language === 'zh-CN' ? tr('switchToEnglish') : tr('switchToChinese')}">
        <img class="home-sprite" src="${getHomeLanguageIcon()}" alt="">
      </button>
    `;
  }

  function renderMap() {
    const levels = getLevels();
    renderShell(`
      <div class="map-screen">
        <div class="toolbar">
          <button class="pixel-btn" data-action="home">${tr('backHome')}</button>
          <button class="pixel-btn secondary" data-action="show-editor">${tr('editLevels')}</button>
        </div>
        <h2>${tr('mapTitle')}</h2>
        <section class="map-board" aria-label="${tr('mapTitle')}">
          <div class="map-grid adventure-path">
            ${levels.map((item) => renderLevelNode(item)).join('')}
          </div>
        </section>
        ${state.customLevels.length === 0 ? `<div class="empty-note">${tr('noCustomLevels')}</div>` : ''}
      </div>
    `);
    document.querySelectorAll('[data-level-id]').forEach((button) => {
      button.addEventListener('click', () => startLevel(button.dataset.levelId));
    });
  }

  function renderLevelNode(item) {
    const unlocked = item.isCustom || state.progress.unlockedLevelIds.includes(item.id);
    const stars = state.progress.levelStars[item.id] || 0;
    const title = item.title || tr(item.titleKey);
    const subtitle = item.subtitle || tr(item.subtitleKey);
    return `
      <article class="level-node ${unlocked ? 'unlocked' : 'locked'} ${item.isCustom ? 'custom' : ''}">
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
    const typingDisplay = getTypingDisplay(target, session.currentInput);
    const stats = getSessionStats(session);
    const npcText = getNpcText(levelData, session.feedback);
    renderShell(`
      <div class="mission-screen">
        <div class="toolbar">
          <button class="pixel-btn" data-action="show-map">${tr('backMap')}</button>
        </div>
        <div class="stats-row">
          <div class="stat-box"><span>${tr('progress')}</span>${session.completedTargets}/${session.targets.length}</div>
          <div class="stat-box"><span>${tr('accuracy')}</span>${stats.accuracy}%</div>
          <div class="stat-box"><span>${tr('wpm')}</span>${stats.wpm}</div>
          <div class="stat-box"><span>${tr('stars')}</span>${renderStars(stats.stars)}</div>
        </div>
        <section class="mission-stage">
          <div class="mission-npc" aria-label="${tr('guideLabel')}">
            <img class="mission-guide-icon" src="assets/sprites/home-brand-icon.png" alt="">
          </div>
          <div class="mission-speech">${escapeHtml(npcText)}</div>
          <div class="target-card ${session.feedback === 'error' ? 'error' : ''}">${escapeHtml(target)}</div>
          <div class="input-dock">
            ${renderTypingStatus(typingDisplay)}
            <div class="keyboard">${renderKeyboard(levelData.focusKeys, target, session.currentInput)}</div>
          </div>
          ${state.introStatus !== 'playing' ? renderIntroOverlay() : ''}
        </section>
      </div>
      ${state.result ? renderResultModal() : ''}
    `);
  }

  function renderEditor() {
    renderShell(`
      <div class="editor-screen">
        <div class="toolbar">
          <button class="pixel-btn" data-action="show-map">${tr('backMap')}</button>
          <button class="pixel-btn" data-action="home">${tr('backHome')}</button>
        </div>
        <h2>${tr('editorTitle')}</h2>
        <div class="editor-layout">
          <form class="form-card" id="level-form">
            <label class="field">
              ${tr('editorName')}
              <input name="title" value="${tr('editorDefaultTitle')}">
            </label>
            <label class="field">
              ${tr('editorTargets')}
              <textarea name="targets" placeholder="${tr('editorTargetsHint')}">cat, dog, bird, fish</textarea>
            </label>
            <label class="field">
              ${tr('editorDifficulty')}
              <select name="difficulty">
                <option value="slow">${tr('difficultySlow')}</option>
                <option value="normal" selected>${tr('difficultyNormal')}</option>
                <option value="challenge">${tr('difficultyChallenge')}</option>
              </select>
            </label>
            <label class="field">
              ${tr('editorNpcLanguage')}
              <select name="npcLanguage">
                <option value="zh-CN">${tr('languageChinese')}</option>
                <option value="en-US">${tr('languageEnglish')}</option>
              </select>
            </label>
            <button class="pixel-btn primary" type="submit">${tr('saveLevel')}</button>
          </form>
          <aside class="preview-card">
            <h3>${tr('preview')}</h3>
            <div class="target-card" style="position:static;transform:none;margin:18px auto;">cat</div>
            <div class="speech">${tr('editorPreviewSpeech')}</div>
          </aside>
        </div>
      </div>
    `);
    document.getElementById('level-form').addEventListener('submit', saveEditorLevel);
  }

  function renderResultModal() {
    const result = state.result;
    return `
      <div class="result-modal">
        <div class="result-card">
          <h2>${tr('resultTitle')}</h2>
          <div class="result-stars">${renderStars(result.stars)}</div>
          <p>${tr('accuracy')}：${result.accuracy}%</p>
          <p>${tr('wpm')}：${result.wpm}</p>
          <div class="hero-actions" style="justify-content:center">
            <button class="pixel-btn secondary" data-action="retry-level">${tr('resultRetry')}</button>
            <button class="pixel-btn primary" data-action="finish-level">${tr('resultContinue')}</button>
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
        if (action === 'show-editor') showEditor();
        if (action === 'start-free') startLevel('level-1');
        if (action === 'begin-practice') beginPractice();
        if (action === 'retry-level') startLevel(state.currentLevel.id);
        if (action === 'finish-level') finishLevel();
      });
    });
  }

  function showHome() {
    state.view = 'home';
    state.currentLevel = null;
    state.session = null;
    state.introStatus = 'idle';
    state.introToken += 1;
    state.result = null;
    render();
  }

  function showMap() {
    state.view = 'map';
    state.introStatus = 'idle';
    state.introToken += 1;
    state.result = null;
    render();
  }

  function showEditor() {
    state.view = 'editor';
    state.result = null;
    render();
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
      ? 'assets/sprites/icon-language-en.png'
      : 'assets/sprites/icon-language-zh.png';
  }

  function startLevel(levelId) {
    const item = getLevels().find((candidate) => candidate.id === levelId);
    if (!item) return;
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
    if (state.introStatus === 'speaking') {
      speakIntro(state.introText, item.npcLanguage || state.language, introToken);
    }
    render();
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

  function handleMissionKey(key) {
    if (!canAcceptMissionInput(state.introStatus)) return;
    if (state.result || state.session.isComplete) return;
    const previousFeedback = state.session.feedback;
    state.session = handleTypingKey(state.session, key);
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
  }

  function finishLevel() {
    const orderedLevelIds = getLevels().map((item) => item.id);
    state.progress = saveLevelResult(state.currentLevel.id, state.result, orderedLevelIds);
    state.result = null;
    state.view = 'map';
    render();
  }

  function saveEditorLevel(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const custom = normalizeCustomLevel({
      title: form.get('title'),
      targets: form.get('targets'),
      difficulty: form.get('difficulty'),
      npcLanguage: form.get('npcLanguage'),
    });
    state.customLevels.push(custom);
    localStorage.setItem(STORAGE_KEYS.customLevels, JSON.stringify(state.customLevels));
    state.progress.unlockedLevelIds.push(custom.id);
    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(state.progress));
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
    if (result.passed) {
      const index = orderedLevelIds.indexOf(levelId);
      const nextLevel = orderedLevelIds[index + 1];
      if (nextLevel && !state.progress.unlockedLevelIds.includes(nextLevel)) {
        state.progress.unlockedLevelIds.push(nextLevel);
      }
    }
    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(state.progress));
    return state.progress;
  }

  function normalizeCustomLevel(input) {
    const targets = String(input.targets || '')
      .split(/[\n,，]+/)
      .map((item) => item.trim())
      .filter(Boolean);
    const focusKeys = [...new Set(targets.join('').toUpperCase().replace(/[^A-Z]/g, '').split(''))].slice(0, 12);
    return {
      id: `custom-${Date.now()}`,
      order: BUILT_IN_LEVELS.length + state.customLevels.length + 1,
      title: String(input.title || '').trim() || tr('customLevelDefaultTitle'),
      subtitle: tr('customLevelDefaultSubtitle'),
      focusKeys,
      targets: targets.length ? targets : ['cat', 'dog'],
      targetAccuracy: input.difficulty === 'challenge' ? 92 : 85,
      difficulty: input.difficulty,
      npcLanguage: input.npcLanguage,
      npcLine: input.npcLanguage === 'en-US'
        ? STRINGS['en-US'].customLevelDefaultNpcLine
        : STRINGS['zh-CN'].customLevelDefaultNpcLine,
      isCustom: true,
    };
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

  function getTypingDisplay(target, input) {
    const targetText = String(target || '');
    const typedInput = String(input || '');
    const nextKey = targetText[typedInput.length] || '';

    return {
      target: targetText,
      typedInput,
      nextKey,
    };
  }

  function renderTypingStatus(display) {
    return `
      <div class="typing-status">
        <div class="typing-row">
          <span>${tr('typingTarget')}</span>
          <strong>${escapeHtml(display.target)}</strong>
        </div>
        <div class="typing-row">
          <span>${tr('typedInput')}</span>
          <strong>${escapeHtml(display.typedInput || tr('noneInput'))}</strong>
        </div>
        <div class="typing-row">
          <span>${tr('nextKey')}</span>
          <strong>${escapeHtml(display.nextKey)}</strong>
        </div>
      </div>
    `;
  }

  function renderKeyboard(focusKeys, target, input) {
    const next = target[input.length]?.toUpperCase();
    return focusKeys.map((key) => {
      const active = key === next ? 'active' : '';
      return `<span class="keycap ${active}">${escapeHtml(key)}</span>`;
    }).join('');
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
