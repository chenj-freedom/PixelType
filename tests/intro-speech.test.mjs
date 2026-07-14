import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const appSource = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

function loadIntroSpeechHarness() {
  const start = appSource.indexOf('  function speakIntro(text, language, introToken) {');
  const end = appSource.indexOf('  function completeIntro', start);
  assert.notEqual(start, -1, 'speakIntro should exist');
  assert.notEqual(end, -1, 'speakIntro function block should be extractable');

  const spoken = [];
  const timers = [];
  let cancelCalls = 0;
  const state = {
    audioEnabled: true,
    language: 'zh-CN',
    view: 'mission',
    introStatus: 'speaking',
    introToken: 1,
  };

  class FakeUtterance {
    constructor(text) {
      this.text = text;
      this.lang = '';
      this.rate = 1;
      this.volume = 1;
      this.onend = null;
      this.onerror = null;
    }
  }

  const speechSynthesis = {
    speaking: false,
    pending: false,
    cancel() {
      cancelCalls += 1;
    },
    speak(utterance) {
      spoken.push(utterance);
    },
  };

  const context = vm.createContext({
    SpeechSynthesisUtterance: FakeUtterance,
    state,
    window: {
      speechSynthesis,
      setTimeout(callback, delay) {
        const timer = { id: timers.length + 1, callback, delay };
        timers.push(timer);
        return timer.id;
      },
      clearTimeout() {},
    },
    completeIntro() {},
    getIntroFallbackMinimumMs() {
      return 2200;
    },
    shouldCompleteIntroFallback() {
      return false;
    },
  });

  const fragment = appSource.slice(start, end);
  vm.runInContext(`${fragment}\nglobalThis.speakIntro = speakIntro;`, context);

  return {
    speakIntro: context.speakIntro,
    spoken,
    timers,
    state,
    getCancelCalls: () => cancelCalls,
  };
}

test('mission intro waits briefly and plays only the real sentence', () => {
  const { speakIntro, spoken, timers, getCancelCalls } = loadIntroSpeechHarness();

  speakIntro('准备好了吗？', 'zh-CN', 1);

  assert.equal(getCancelCalls(), 1);
  assert.equal(spoken.length, 0);
  assert.equal(timers.length, 1);
  assert.equal(timers[0].delay, 120);

  timers[0].callback();

  assert.equal(spoken.length, 1);
  assert.equal(spoken[0].text, '准备好了吗？');
  assert.equal(spoken[0].volume, 1);
  assert.equal(spoken[0].rate, 0.92);
  assert.equal(spoken[0].lang, 'zh-CN');
  assert.equal(typeof spoken[0].onend, 'function');
  assert.equal(typeof spoken[0].onerror, 'function');
  assert.equal(timers.length, 2);
  assert.equal(timers[1].delay, 1200);
});

test('mission intro does not start after audio is turned off during the delay', () => {
  const { speakIntro, spoken, timers, state } = loadIntroSpeechHarness();

  speakIntro('准备好了吗？', 'zh-CN', 1);
  state.audioEnabled = false;
  timers[0].callback();

  assert.equal(spoken.length, 0);
});
