import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

const appSource = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const styleSource = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const fontSpriteScript = readFileSync(new URL('../scripts/generate-font-sprites.mjs', import.meta.url), 'utf8');
const homeSpriteScriptUrl = new URL('../scripts/generate-home-sprites.mjs', import.meta.url);
const homeSpriteScript = existsSync(homeSpriteScriptUrl) ? readFileSync(homeSpriteScriptUrl, 'utf8') : '';
const homeReferenceUrl = new URL('../assets/reference/home-reference-b.png', import.meta.url);

test('home screen is assembled from sprite assets and a pixel font atlas', () => {
  assert.match(appSource, /home-screen/);
  assert.match(appSource, /pixel-home-stage/);
  assert.match(appSource, /PIXEL_SPRITE_FONT_CHARS/);
  assert.match(appSource, /renderPixelWord\(tr\('appTitle'\), 'home'\)/);
  assert.match(appSource, /assets\/sprites\/button-adventure\.png/);
  assert.match(appSource, /assets\/sprites\/button-practice\.png/);
  assert.match(appSource, /assets\/sprites\/button-editor\.png/);
  assert.match(appSource, /assets\/sprites\/home-brand-icon\.png/);
  assert.match(appSource, /assets\/sprites\/robot-guide\.png/);
  assert.match(appSource, /assets\/sprites\/home-map\.png/);
  assert.match(appSource, /assets\/sprites\/bg-cloud-a\.png/);
  assert.match(appSource, /assets\/sprites\/bg-cloud-b\.png/);
  assert.match(appSource, /assets\/sprites\/bg-tree-left\.png/);
  assert.match(appSource, /assets\/sprites\/bg-tree-right\.png/);
  assert.doesNotMatch(appSource, /assets\/sprites\/bg-tree\.png/);
  assert.match(appSource, /assets\/sprites\/bg-bush\.png/);
  assert.match(appSource, /assets\/sprites\/bg-grass\.png/);
  assert.doesNotMatch(appSource, /home-scenery-left\.png/);
  assert.doesNotMatch(appSource, /home-scenery-right\.png/);
  assert.match(appSource, /getHomeSoundIcon\(\)/);
  assert.match(appSource, /getHomeLanguageIcon\(\)/);
  assert.match(appSource, /assets\/sprites\/icon-sound-on\.png/);
  assert.match(appSource, /assets\/sprites\/icon-sound-off\.png/);
  assert.match(appSource, /assets\/sprites\/icon-language-en\.png/);
  assert.match(appSource, /assets\/sprites\/icon-language-zh\.png/);
  assert.doesNotMatch(appSource, /assets\/sprites\/icon-sound\.png/);
  assert.doesNotMatch(appSource, /assets\/sprites\/icon-language\.png/);
  assert.doesNotMatch(appSource, /home-reference-b\.png/);
  assert.match(styleSource, /\.home-screen/);
  assert.match(styleSource, /\.pixel-home-stage/);
  assert.match(styleSource, /\.home-sprite/);
  assert.match(styleSource, /\.pixel-word\.home/);
  [
    '../assets/sprites/button-adventure.png',
    '../assets/sprites/button-practice.png',
    '../assets/sprites/button-editor.png',
    '../assets/sprites/home-brand-icon.png',
    '../assets/sprites/robot-guide.png',
    '../assets/sprites/home-map.png',
    '../assets/sprites/bg-cloud-a.png',
    '../assets/sprites/bg-cloud-b.png',
    '../assets/sprites/bg-tree-left.png',
    '../assets/sprites/bg-tree-right.png',
    '../assets/sprites/bg-bush.png',
    '../assets/sprites/bg-grass.png',
    '../assets/sprites/icon-sound-on.png',
    '../assets/sprites/icon-sound-off.png',
    '../assets/sprites/icon-language-en.png',
    '../assets/sprites/icon-language-zh.png',
  ].forEach((assetPath) => {
    assert.ok(existsSync(new URL(assetPath, import.meta.url)), `${assetPath} should exist`);
  });
});

test('home sprite assets are extracted from the B reference into reusable parts', () => {
  assert.ok(existsSync(homeSpriteScriptUrl), 'generate-home-sprites.mjs should exist');
  assert.ok(existsSync(homeReferenceUrl), 'home-reference-b.png should exist as a build-time visual source');
  assert.match(homeSpriteScript, /home-reference-b\.png/);
  assert.match(homeSpriteScript, /const CROP_SPECS = \[/);
  assert.match(homeSpriteScript, /transparentEdgeBackground/);
  assert.match(homeSpriteScript, /eraseHomeMapButtonArea/);
  assert.match(homeSpriteScript, /name:\s*'button-adventure\.png'/);
  assert.match(homeSpriteScript, /name:\s*'home-brand-icon\.png'/);
  assert.match(homeSpriteScript, /name:\s*'home-map\.png'/);
  assert.match(homeSpriteScript, /const DRAWN_SPRITES = \[/);
  assert.match(homeSpriteScript, /name:\s*'bg-cloud-a\.png'/);
  assert.match(homeSpriteScript, /name:\s*'bg-cloud-b\.png'/);
  assert.match(homeSpriteScript, /name:\s*'bg-tree-left\.png'/);
  assert.match(homeSpriteScript, /name:\s*'bg-tree-right\.png'/);
  assert.doesNotMatch(homeSpriteScript, /name:\s*'bg-tree\.png'/);
  assert.match(homeSpriteScript, /name:\s*'bg-bush\.png'/);
  assert.match(homeSpriteScript, /name:\s*'bg-grass\.png'/);
  assert.match(homeSpriteScript, /drawPixelSprite/);
  assert.doesNotMatch(homeSpriteScript, /name:\s*'home-scenery-left\.png'/);
  assert.doesNotMatch(homeSpriteScript, /name:\s*'home-scenery-right\.png'/);
  assert.match(homeSpriteScript, /name:\s*'robot-guide\.png'/);
  assert.match(homeSpriteScript, /DEPRECATED_SPRITES/);

  assert.deepEqual(readPngSize('../assets/sprites/button-adventure.png'), { width: 202, height: 188 });
  assert.deepEqual(readPngSize('../assets/sprites/button-practice.png'), { width: 198, height: 188 });
  assert.deepEqual(readPngSize('../assets/sprites/button-editor.png'), { width: 198, height: 188 });
  assert.deepEqual(readPngSize('../assets/sprites/home-brand-icon.png'), { width: 118, height: 128 });
  assert.deepEqual(readPngSize('../assets/sprites/robot-guide.png'), { width: 340, height: 357 });
  assert.deepEqual(readPngSize('../assets/sprites/speech-bubble.png'), { width: 246, height: 144 });
  assert.deepEqual(readPngSize('../assets/sprites/icon-sound-on.png'), { width: 88, height: 82 });
  assert.deepEqual(readPngSize('../assets/sprites/icon-sound-off.png'), { width: 88, height: 82 });
  assert.deepEqual(readPngSize('../assets/sprites/icon-language-en.png'), { width: 90, height: 82 });
  assert.deepEqual(readPngSize('../assets/sprites/icon-language-zh.png'), { width: 90, height: 82 });
  assert.deepEqual(readPngSize('../assets/sprites/home-map.png'), { width: 966, height: 455 });
  assert.deepEqual(readPngSize('../assets/sprites/bg-cloud-a.png'), { width: 96, height: 56 });
  assert.deepEqual(readPngSize('../assets/sprites/bg-cloud-b.png'), { width: 120, height: 64 });
  assert.deepEqual(readPngSize('../assets/sprites/bg-tree-left.png'), { width: 108, height: 382 });
  assert.deepEqual(readPngSize('../assets/sprites/bg-tree-right.png'), { width: 108, height: 300 });
  assert.deepEqual(readPngSize('../assets/sprites/bg-bush.png'), { width: 96, height: 52 });
  assert.deepEqual(readPngSize('../assets/sprites/bg-grass.png'), { width: 48, height: 28 });
  assert.equal(existsSync(new URL('../assets/sprites/home-scenery-left.png', import.meta.url)), false);
  assert.equal(existsSync(new URL('../assets/sprites/home-scenery-right.png', import.meta.url)), false);
});

test('home layout uses the compact B-reference proportions', () => {
  assert.match(styleSource, /\.home-panel-shell\s*{[\s\S]*inset:\s*5\.8% 6\.8% 7\.2%/);
  assert.match(styleSource, /\.home-panel-shell\s*{[\s\S]*clip-path:\s*polygon\(\s*14px 0/);
  assert.match(styleSource, /\.home-panel-shell\s*{[\s\S]*calc\(100% - 6px\) 14px/);
  assert.match(styleSource, /\.panel-corner::before/);
  assert.match(styleSource, /\.panel-corner::after/);
  assert.doesNotMatch(styleSource, /\.panel-corner\s*{[\s\S]*background:\s*#ffd565;[\s\S]*box-shadow:\s*8px 8px 0 #0b1b2d/);
  assert.match(styleSource, /\.bg-sprite\s*{[\s\S]*position:\s*absolute/);
  assert.match(styleSource, /\.bg-cloud-left-top\s*{[\s\S]*left:\s*0\.9%;[\s\S]*top:\s*10\.5%/);
  assert.match(styleSource, /\.bg-cloud-right-top\s*{[\s\S]*right:\s*1\.1%;[\s\S]*top:\s*15\.8%/);
  assert.match(styleSource, /\.bg-tree-left\s*{[\s\S]*left:\s*0;[\s\S]*bottom:\s*6\.8%/);
  assert.match(styleSource, /\.bg-tree-right\s*{[\s\S]*right:\s*0;[\s\S]*bottom:\s*13\.2%/);
  assert.doesNotMatch(styleSource, /\.home-scenery/);
  assert.match(styleSource, /\.home-sprite\.home-brand-icon\s*{[\s\S]*width:\s*clamp\(76px,\s*5\.6vw,\s*116px\)/);
  assert.doesNotMatch(styleSource, /\.home-logo-mark/);
  assert.match(styleSource, /\.sprite-home-header\s*{[\s\S]*padding:\s*clamp\(52px,\s*3\.75vw,\s*76px\) clamp\(58px,\s*4\.2vw,\s*86px\) 0/);
  assert.match(styleSource, /\.pixel-word\.home \.pixel-glyph-slot\s*{[\s\S]*--glyph-height:\s*clamp\(70px,\s*5\.3vw,\s*108px\)/);
  assert.match(styleSource, /\.sprite-home-menu\s*{[\s\S]*gap:\s*clamp\(16px,\s*1\.15vw,\s*24px\)/);
  assert.match(styleSource, /\.sprite-card\s*{[\s\S]*width:\s*clamp\(150px,\s*10\.75vw,\s*218px\);[\s\S]*height:\s*clamp\(109px,\s*7\.7vw,\s*158px\)/);
  assert.match(styleSource, /\.sprite-card\s*{[\s\S]*aspect-ratio:\s*218\s*\/\s*158/);
  assert.match(styleSource, /\.sprite-card\s*{[\s\S]*display:\s*grid;[\s\S]*place-items:\s*stretch/);
  assert.match(styleSource, /\.button-sprite\s*{[\s\S]*pointer-events:\s*none/);
  assert.match(styleSource, /\.sprite-icon-btn\s*{[\s\S]*width:\s*clamp\(54px,\s*4\.6vw,\s*94px\);[\s\S]*height:\s*clamp\(54px,\s*4\.6vw,\s*94px\);[\s\S]*display:\s*grid;[\s\S]*place-items:\s*stretch/);
  assert.match(styleSource, /\.sprite-icon-btn\s+\.home-sprite\s*{[\s\S]*pointer-events:\s*none/);
  assert.doesNotMatch(styleSource, /\.sprite-icon-btn:hover,\s*\.sprite-icon-btn:focus-visible\s*{[\s\S]*outline:\s*4px solid rgba\(255,209,102/);
  assert.match(styleSource, /\.sprite-icon-btn:hover\s+\.home-sprite,\s*\.sprite-icon-btn:focus-visible\s+\.home-sprite\s*{[\s\S]*filter:\s*brightness\(1\.06\)/);
  assert.match(styleSource, /\.sprite-map\s*{[\s\S]*pointer-events:\s*none/);
  assert.match(styleSource, /\.sprite-guide\s*{[\s\S]*pointer-events:\s*none/);
  assert.doesNotMatch(styleSource, /\.sprite-card:hover,\s*\.sprite-card:focus-visible\s*{[\s\S]*outline:\s*4px solid rgba\(255,209,102/);
  assert.match(styleSource, /\.sprite-card:hover\s+\.button-sprite,\s*\.sprite-card:focus-visible\s+\.button-sprite\s*{[\s\S]*filter:\s*brightness\(1\.06\)/);
  assert.match(styleSource, /\.sprite-guide\s*{[\s\S]*right:\s*5\.4%;[\s\S]*bottom:\s*5\.5%;[\s\S]*width:\s*clamp\(260px,\s*18\.2vw,\s*370px\)/);
  assert.match(styleSource, /\.sprite-speech\s*{[\s\S]*width:\s*clamp\(190px,\s*13\.2vw,\s*270px\)/);
  assert.match(styleSource, /\.sprite-robot\s*{[\s\S]*width:\s*100%/);
  assert.match(styleSource, /\.sprite-map\s*{[\s\S]*left:\s*4\.8%;[\s\S]*right:\s*28\.8%;[\s\S]*bottom:\s*7\.1%/);
});

test('home map sprite preserves the reference path and combines all map nodes', () => {
  const map = decodePng('../assets/sprites/home-map.png');

  assert.ok(opaquePixelsInRegion(map, 290, 260, 90, 45) > 500, 'path between nodes 1 and 2 is visible');
  assert.ok(opaquePixelsInRegion(map, 770, 70, 130, 100) > 1000, 'upper path and level 5 should be part of the combined map sprite');
  assert.equal(existsSync(new URL('../assets/sprites/home-map-lower.png', import.meta.url)), false);
  assert.equal(existsSync(new URL('../assets/sprites/home-node-5.png', import.meta.url)), false);
});

test('cropped guide sprites do not include stray black pixels on their outer edges', () => {
  const robot = decodePng('../assets/sprites/robot-guide.png');
  const speech = decodePng('../assets/sprites/speech-bubble.png');

  assert.equal(darkOpaquePixelsInRow(robot, 0), 0, 'robot top row should not include the speech bubble tail');
  assert.equal(darkOpaquePixelsInRow(speech, speech.height - 1), 0, 'speech bubble bottom row should not include the robot antenna');
});

test('home control sprites show distinct audio states and current language badges', () => {
  const soundOn = decodePng('../assets/sprites/icon-sound-on.png');
  const soundOff = decodePng('../assets/sprites/icon-sound-off.png');
  const languageEn = decodePng('../assets/sprites/icon-language-en.png');
  const languageZh = decodePng('../assets/sprites/icon-language-zh.png');

  assert.ok(pixelDifference(soundOn, soundOff) > 400, 'sound on/off icons should visibly differ');
  assert.ok(pixelDifference(languageEn, languageZh) > 180, 'language EN/中文 icons should visibly differ');
  assert.ok(opaquePixelsInRegion(languageEn, 48, 44, 32, 24) > 120, 'EN current-language badge should appear on the globe icon');
  assert.ok(opaquePixelsInRegion(languageZh, 48, 44, 32, 24) > 120, 'Chinese current-language badge should appear on the globe icon');
});

test('home and level pages share the same stateful audio and language controls', () => {
  assert.match(appSource, /function renderControlButtons\(/);
  assert.equal((appSource.match(/\$\{renderControlButtons\(\)\}/g) || []).length, 2);
  assert.doesNotMatch(appSource, /data-action="toggle-language">\$\{state\.language === 'zh-CN'/);
  assert.doesNotMatch(appSource, /data-action="toggle-audio">\$\{state\.audioEnabled/);
  assert.match(appSource, /class="toolbar icon-toolbar"/);
  assert.match(appSource, /src="\$\{getHomeSoundIcon\(\)\}"/);
  assert.match(appSource, /src="\$\{getHomeLanguageIcon\(\)\}"/);
});

test('home sprite buttons show pixel tooltips with state-aware control text', () => {
  assert.equal((appSource.match(/class="sprite-tooltip"/g) || []).length, 5);
  assert.match(appSource, /<span class="sprite-tooltip">\$\{tr\('startAdventure'\)\}<\/span>/);
  assert.match(appSource, /<span class="sprite-tooltip">\$\{tr\('freePractice'\)\}<\/span>/);
  assert.match(appSource, /<span class="sprite-tooltip">\$\{tr\('editLevels'\)\}<\/span>/);
  assert.match(appSource, /const audioTooltip = state\.audioEnabled \? tr\('audioOffTooltip'\) : tr\('audioOnTooltip'\);/);
  assert.match(appSource, /const languageTooltip = state\.language === 'zh-CN' \? tr\('switchToEnglishTooltip'\) : tr\('switchToChineseTooltip'\);/);
  assert.match(appSource, /function getHomeLanguageIcon\(\) \{\s*return state\.language === 'zh-CN'\s*\?\s*'assets\/sprites\/icon-language-zh\.png'\s*:\s*'assets\/sprites\/icon-language-en\.png';\s*\}/);
  assert.match(styleSource, /\.sprite-tooltip\s*{[\s\S]*position:\s*absolute;[\s\S]*opacity:\s*0;[\s\S]*pointer-events:\s*none/);
  assert.match(styleSource, /\.toolbar\.icon-toolbar \.sprite-tooltip\s*{[\s\S]*top:\s*calc\(100% \+ 10px\);[\s\S]*bottom:\s*auto/);
  assert.match(styleSource, /\.sprite-card:hover \.sprite-tooltip,[\s\S]*\.sprite-icon-btn:focus-visible \.sprite-tooltip\s*{[\s\S]*opacity:\s*1/);
});

test('turning audio off cancels any active browser speech immediately', () => {
  assert.match(appSource, /function cancelActiveSpeechOnAudioOff\(/);
  assert.match(appSource, /cancelActiveSpeechOnAudioOff\(state\.audioEnabled,\s*window\.speechSynthesis\)/);
  assert.match(appSource, /speechSynthesis\.cancel\(\)/);
});

test('active home sprite set contains the current generated assets only', () => {
  [
    '../assets/sprites/chest.png',
    '../assets/sprites/home-node-1.png',
    '../assets/sprites/home-node-2.png',
    '../assets/sprites/home-node-3.png',
    '../assets/sprites/home-node-4.png',
    '../assets/sprites/home-map-preview.png',
    '../assets/sprites/home-map-lower.png',
    '../assets/sprites/home-node-5.png',
    '../assets/sprites/icon-keyboard.png',
    '../assets/sprites/icon-sound.png',
    '../assets/sprites/icon-language.png',
    '../assets/sprites/icon-pencil.png',
    '../assets/sprites/icon-sword.png',
    '../assets/sprites/lock.png',
    '../assets/sprites/map-node-active.png',
    '../assets/sprites/map-node-locked.png',
    '../assets/sprites/star.png',
  ].forEach((assetPath) => {
    assert.equal(existsSync(new URL(assetPath, import.meta.url)), false, `${assetPath} is outside the active sprite set`);
  });

  ['sprite-trail', 'sprite-node', 'sprite-tree', 'sprite-chest'].forEach((excludedClass) => {
    assert.doesNotMatch(styleSource, new RegExp(`\\.${excludedClass}\\b`), `${excludedClass} is outside the current CSS class set`);
  });
});

test('PixelType logo is rendered from reusable letter sprite images', () => {
  assert.match(appSource, /renderPixelWord/);
  assert.match(appSource, /renderSpriteGlyph/);
  assert.match(appSource, /assets\/sprites\/font\/upper-\$\{char\}\.png/);
  assert.match(appSource, /assets\/sprites\/font\/lower-\$\{char\}\.png/);
  assert.match(styleSource, /\.pixel-word/);
  assert.match(styleSource, /\.pixel-glyph/);
});

test('home title pixel lettering uses the home glyph layout class', () => {
  assert.doesNotMatch(appSource, /renderPixelWord\(tr\('appTitle'\), 'hero'\)/);
});

test('home title renders with image glyph slots', () => {
  assert.match(appSource, /renderPixelWord\(tr\('appTitle'\), 'home'\)/);
  assert.match(styleSource, /\.pixel-word\.home\s+\.pixel-glyph/);
  assert.doesNotMatch(styleSource, /\.pixel-word\.home\s+\.pixel-bit\.on/);
});

test('PixelType logo uses compact mixed-case glyphs closer to the B reference', () => {
  assert.match(fontSpriteScript, /P:\s*\['011111110000'/);
  assert.match(fontSpriteScript, /T:\s*\['011111111110'/);
  assert.match(fontSpriteScript, /p:\s*\['000000000000'/);
  assert.match(fontSpriteScript, /i:\s*\['000000000000', '001100000000', '001100000000'/);
  assert.match(fontSpriteScript, /l:\s*\['001100000000'/);
  assert.match(appSource, /PIXEL_GLYPH_ADVANCE/);
  assert.match(appSource, /i:\s*5/);
  assert.match(appSource, /l:\s*5/);
  assert.match(appSource, /L:\s*11/);
  assert.match(appSource, /x:\s*10/);
  assert.match(styleSource, /\.pixel-word\.home\s*{[\s\S]*gap:\s*clamp\(2px,\s*\.3vw,\s*4px\)/);
  assert.match(styleSource, /\.pixel-word\.home\s+\.pixel-glyph-slot\s*{[\s\S]*height:\s*clamp\(70px,\s*5\.3vw,\s*108px\)/);
});

test('all uppercase and lowercase sprite font letters exist as reusable assets', () => {
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((char) => {
    assert.ok(existsSync(new URL(`../assets/sprites/font/upper-${char}.png`, import.meta.url)), `upper-${char}.png should exist`);
  });
  'abcdefghijklmnopqrstuvwxyz'.split('').forEach((char) => {
    assert.ok(existsSync(new URL(`../assets/sprites/font/lower-${char}.png`, import.meta.url)), `lower-${char}.png should exist`);
  });
});

test('font review page displays every uppercase and lowercase sprite glyph', () => {
  const pageUrl = new URL('../font-review.html', import.meta.url);
  assert.ok(existsSync(pageUrl), 'font-review.html should exist for browser review');
  const reviewPageSource = readFileSync(pageUrl, 'utf8');

  assert.match(reviewPageSource, /ABCDEFGHIJKLMNOPQRSTUVWXYZ/);
  assert.match(reviewPageSource, /abcdefghijklmnopqrstuvwxyz/);
  assert.match(reviewPageSource, /assets\/sprites\/font\/upper-\$\{char\}\.png/);
  assert.match(reviewPageSource, /assets\/sprites\/font\/lower-\$\{char\}\.png/);
  assert.match(reviewPageSource, /review-row uppercase/);
  assert.match(reviewPageSource, /review-row lowercase/);
  assert.match(reviewPageSource, /L:\s*11/);
});

test('sprite font generator uses one-cell source pixels and fixed glyph canvases', () => {
  assert.match(fontSpriteScript, /const CELL = 1/);
  assert.match(fontSpriteScript, /const GLYPH_COLUMNS = 12/);
  assert.match(fontSpriteScript, /const GLYPH_ROWS = 14/);
  assert.doesNotMatch(fontSpriteScript, /RIGHT_BEARING/);
  assert.doesNotMatch(fontSpriteScript, /TOP_BEARING_ROWS/);
  assert.doesNotMatch(fontSpriteScript, /function thicken/);
  assert.match(fontSpriteScript, /const PADDING_X = 0/);
  assert.match(fontSpriteScript, /const PADDING_Y = 1/);
  assert.match(fontSpriteScript, /const width = GLYPH_COLUMNS \* CELL \+ PADDING_X \* 2/);
  assert.match(fontSpriteScript, /const height = GLYPH_ROWS \* CELL \+ PADDING_Y \* 2/);
  assert.match(fontSpriteScript, /y \* CELL \+ PADDING_Y/);
});

test('sprite font PNGs use a finer grid for the B-reference title scale', () => {
  const upperP = readPngSize('../assets/sprites/font/upper-P.png');
  const lowerE = readPngSize('../assets/sprites/font/lower-e.png');
  const lowerX = readPngSize('../assets/sprites/font/lower-x.png');
  const lowerI = readPngSize('../assets/sprites/font/lower-i.png');

  assert.deepEqual(upperP, { width: 12, height: 16 });
  assert.deepEqual(lowerE, { width: 12, height: 16 });
  assert.deepEqual(lowerX, { width: 12, height: 16 });
  assert.deepEqual(lowerI, { width: 12, height: 16 });
});

test('all uppercase glyph sprites share one canvas size and all lowercase sprites share one canvas size', () => {
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((char) => {
    assert.deepEqual(readPngSize(`../assets/sprites/font/upper-${char}.png`), { width: 12, height: 16 }, `upper-${char}.png size`);
  });

  'abcdefghijklmnopqrstuvwxyz'.split('').forEach((char) => {
    assert.deepEqual(readPngSize(`../assets/sprites/font/lower-${char}.png`), { width: 12, height: 16 }, `lower-${char}.png size`);
  });
});

test('home PixelType logo uses sprite glyph slots for title lettering', () => {
  assert.match(appSource, /renderSpriteGlyph\(char, sizeClass\)/);
  assert.match(styleSource, /\.pixel-word\.home\s+\.pixel-glyph-slot\s*{[\s\S]*height:\s*clamp\(70px,\s*5\.3vw,\s*108px\)/);
  assert.doesNotMatch(styleSource, /\.pixel-word\.home\s+\.pixel-bit\.on\s*{\s*--bold-fill:/);
});

test('sprite title glyphs use per-letter advance widths', () => {
  assert.match(appSource, /const PIXEL_GLYPH_ADVANCE = {/);
  assert.match(appSource, /const advance = PIXEL_GLYPH_ADVANCE\[char\] \|\| PIXEL_GLYPH_ADVANCE\[char\.toLowerCase\(\)\] \|\| 10/);
  assert.match(appSource, /class="pixel-glyph-slot/);
  assert.match(appSource, /style="--glyph-advance:\$\{advance\}"/);
  assert.match(styleSource, /\.pixel-glyph-slot\s*{[\s\S]*width:\s*calc\(var\(--glyph-advance\) \* var\(--glyph-height\) \/ 16\)/);
});

test('current home art uses sprite classes and glyph assets', () => {
  assert.doesNotMatch(appSource, /PIXEL_FONT_ATLAS/);
  assert.doesNotMatch(appSource, /pixel-letter/);
  assert.doesNotMatch(appSource, /pixel-bit/);
  assert.doesNotMatch(styleSource, /\.pixel-letter/);
  assert.doesNotMatch(styleSource, /\.pixel-bit/);

  [
    'image-home-screen',
    'home-art-stage',
    'home-hotspot',
    'home-corner',
    'sky-cloud',
    'home-icon-btn',
    'speaker-icon',
    'globe-icon',
    'home-menu-card',
    'card-icon',
    'world-map',
    'map-preview',
    'hero-robot',
  ].forEach((excludedClass) => {
    assert.doesNotMatch(styleSource, new RegExp(`\\.${excludedClass}\\b`), `${excludedClass} is outside the current CSS class set`);
  });

  assert.match(appSource, /button-adventure\.png/);
  assert.match(appSource, /button-practice\.png/);
  assert.match(appSource, /button-editor\.png/);
});

test('lowercase i keeps a square top dot in the sprite source', () => {
  assert.match(fontSpriteScript, /i:\s*\['000000000000', '001100000000', '001100000000', '000000000000', '000000000000', '001100000000'/);

  const png = decodePng('../assets/sprites/font/lower-i.png');
  const topDot = firstInkComponentBounds(png);
  const stem = inkComponents(png)[1];

  assert.deepEqual(topDot, { minX: 2, maxX: 3, minY: 2, maxY: 3, width: 2, height: 2 });
  assert.deepEqual(stem, { minX: 2, maxX: 3, minY: 6, maxY: 11, width: 2, height: 6 });
});

test('lowercase e keeps the inner counter gap from the B reference', () => {
  const png = decodePng('../assets/sprites/font/lower-e.png');
  const upperCounterGap = [
    [3, 6],
    [4, 6],
    [5, 6],
    [6, 6],
    [3, 7],
    [4, 7],
    [5, 7],
    [6, 7],
  ];

  upperCounterGap.forEach(([x, y]) => {
    assert.equal(png.alpha[y * png.width + x], 0, `lower-e gap at ${x},${y} is transparent`);
  });
});

test('lowercase x keeps a complete lower diagonal', () => {
  const lowerX = inkBounds(decodePng('../assets/sprites/font/lower-x.png'));
  const lowerE = inkBounds(decodePng('../assets/sprites/font/lower-e.png'));

  assert.equal(lowerX.minY, lowerE.minY);
  assert.equal(lowerX.maxY, lowerE.maxY);
});

test('lowercase x has full top and bottom diagonal strokes', () => {
  const png = decodePng('../assets/sprites/font/lower-x.png');
  const topRow = inkColumnsAt(png, 5);
  const secondRow = inkColumnsAt(png, 6);
  const nextToBottomRow = inkColumnsAt(png, 10);
  const bottomRow = inkColumnsAt(png, 11);

  assert.deepEqual(topRow, [1, 2, 7, 8]);
  assert.deepEqual(secondRow, [2, 3, 6, 7]);
  assert.deepEqual(nextToBottomRow, [2, 3, 6, 7]);
  assert.deepEqual(bottomRow, [1, 2, 7, 8]);
});

test('uppercase T has a centered vertical stem', () => {
  const png = decodePng('../assets/sprites/font/upper-T.png');
  const bounds = inkBounds(png);

  assert.equal(bounds.height, 11);
  [2, 3, 4, 5, 6, 7, 8, 9, 10].forEach((y) => {
    assert.deepEqual(inkColumnsAt(png, y), [5, 6], `upper-T stem row ${y}`);
  });
  assert.deepEqual(inkColumnsAt(png, 11), [5, 6], 'upper-T stem reaches the shared baseline');
});

test('uppercase U keeps a rounded bowl shape', () => {
  assert.match(fontSpriteScript, /U:\s*\['110000110000', '110000110000', '110000110000', '110000110000', '110000110000', '110000110000', '110000110000', '110000110000', '110000110000', '011001100000', '001111000000'/);

  const png = decodePng('../assets/sprites/font/upper-U.png');

  assert.deepEqual(inkColumnsAt(png, 9), [0, 1, 6, 7]);
  assert.deepEqual(inkColumnsAt(png, 10), [1, 2, 5, 6]);
  assert.deepEqual(inkColumnsAt(png, 11), [2, 3, 4, 5]);
});

test('PixelType title letters share a baseline so uppercase letters do not float high', () => {
  const baselineLetters = ['P', 'i', 'x', 'e', 'l', 'T'];
  const descenders = ['y', 'p'];

  baselineLetters.forEach((char) => {
    const png = decodePng(/[A-Z]/.test(char)
      ? `../assets/sprites/font/upper-${char}.png`
      : `../assets/sprites/font/lower-${char}.png`);
    assert.equal(inkBounds(png).maxY, 11, `${char} should land on the shared baseline`);
  });

  descenders.forEach((char) => {
    const png = decodePng(`../assets/sprites/font/lower-${char}.png`);
    assert.equal(inkBounds(png).maxY, 13, `${char} should keep its descender below the baseline`);
  });
});

test('uppercase sprite letters share a consistent cap baseline', () => {
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((char) => {
    const png = decodePng(`../assets/sprites/font/upper-${char}.png`);
    const bounds = inkBounds(png);

    assert.equal(bounds.maxY, 11, `${char} should share the uppercase baseline`);
    assert.ok(bounds.height >= 10 && bounds.height <= 11, `${char} should stay within the uppercase visual height band`);
  });
});

test('lowercase m uses a balanced three-stem sprite shape', () => {
  assert.match(fontSpriteScript, /m:\s*\['000000000000', '000000000000', '000000000000', '000000000000', '111111100000', '110110110000'/);

  const png = decodePng('../assets/sprites/font/lower-m.png');
  [6, 7, 8, 9, 10, 11].forEach((y) => {
    assert.deepEqual(inkColumnsAt(png, y), [0, 1, 3, 4, 6, 7], `lower-m body row ${y}`);
  });
});

test('lowercase y uses a wider body and tail like the B reference', () => {
  assert.match(fontSpriteScript, /y:\s*\['000000000000', '000000000000', '000000000000', '000000000000', '011000011000'/);

  const png = decodePng('../assets/sprites/font/lower-y.png');
  const bounds = inkBounds(png);

  assert.equal(bounds.width, 8);
  assert.deepEqual(inkColumnsAt(png, 5), [1, 2, 7, 8]);
  assert.deepEqual(inkColumnsAt(png, 13), [2, 3, 4, 5, 6]);
});

test('lowercase p keeps a wider solid bowl like the B reference', () => {
  assert.match(fontSpriteScript, /p:\s*\['000000000000', '000000000000', '000000000000', '000000000000', '011111110000'/);

  const png = decodePng('../assets/sprites/font/lower-p.png');
  const bounds = inkBounds(png);

  assert.equal(bounds.width, 8);
  assert.equal(png.alpha[6 * png.width + 4], 0, 'lower-p counter should stay open at 4,6');
  assert.equal(png.alpha[6 * png.width + 5], 0, 'lower-p counter should stay open at 5,6');
});

test('lowercase o uses a rounder stepped oval shape', () => {
  assert.match(fontSpriteScript, /o:\s*\['000000000000', '000000000000', '000000000000', '000000000000', '000111000000'/);

  const png = decodePng('../assets/sprites/font/lower-o.png');
  const bounds = inkBounds(png);

  assert.equal(bounds.width, 8);
  assert.deepEqual(inkColumnsAt(png, 5), [3, 4, 5]);
  assert.deepEqual(inkColumnsAt(png, 6), [2, 3, 6, 7]);
  assert.deepEqual(inkColumnsAt(png, 7), [1, 2, 7, 8]);
  assert.deepEqual(inkColumnsAt(png, 11), [3, 4, 5]);
});

test('lowercase v uses a symmetric centered V shape', () => {
  assert.match(fontSpriteScript, /v:\s*\['000000000000', '000000000000', '000000000000', '000000000000', '011000011000'/);

  const png = decodePng('../assets/sprites/font/lower-v.png');
  const bounds = inkBounds(png);

  assert.equal(bounds.width, 8);
  assert.deepEqual(inkColumnsAt(png, 5), [1, 2, 7, 8]);
  assert.deepEqual(inkColumnsAt(png, 8), [2, 3, 6, 7]);
  assert.deepEqual(inkColumnsAt(png, 10), [4, 5]);
  assert.deepEqual(inkColumnsAt(png, 11), [4, 5]);
});

test('lowercase w uses a symmetric three-stem shape', () => {
  assert.match(fontSpriteScript, /w:\s*\['000000000000', '000000000000', '000000000000', '000000000000', '110000110000', '110000110000', '110000110000', '110110110000'/);

  const png = decodePng('../assets/sprites/font/lower-w.png');
  const bounds = inkBounds(png);

  assert.equal(bounds.width, 8);
  assert.deepEqual(inkColumnsAt(png, 5), [0, 1, 6, 7]);
  assert.deepEqual(inkColumnsAt(png, 8), [0, 1, 3, 4, 6, 7]);
  assert.deepEqual(inkColumnsAt(png, 9), [0, 1, 3, 4, 6, 7]);
  assert.deepEqual(inkColumnsAt(png, 10), [0, 1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(inkColumnsAt(png, 11), [1, 2, 5, 6]);
});

function readPngSize(assetPath) {
  const bytes = readFileSync(new URL(assetPath, import.meta.url));
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
}

function decodePng(assetPath) {
  const bytes = readFileSync(new URL(assetPath, import.meta.url));
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  let offset = 8;
  const idat = [];

  while (offset < bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    const dataStart = offset + 8;
    if (type === 'IDAT') idat.push(bytes.subarray(dataStart, dataStart + length));
    offset = dataStart + length + 4;
  }

  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * 4;
  const rgba = [];
  const alpha = [];
  let previousRow = Buffer.alloc(stride);

  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (stride + 1);
    const filterType = raw[rowStart];
    const row = Buffer.alloc(stride);

    for (let index = 0; index < stride; index += 1) {
      const left = index >= 4 ? row[index - 4] : 0;
      const up = previousRow[index];
      const upperLeft = index >= 4 ? previousRow[index - 4] : 0;
      row[index] = (raw[rowStart + 1 + index] + pngFilterPrediction(filterType, left, up, upperLeft)) & 0xff;
    }

    for (let x = 0; x < width; x += 1) {
      const index = x * 4;
      rgba.push(row[index], row[index + 1], row[index + 2], row[index + 3]);
      alpha.push(row[index + 3]);
    }

    previousRow = row;
  }

  return { width, height, alpha, rgba };
}

function pngFilterPrediction(type, left, up, upperLeft) {
  if (type === 0) return 0;
  if (type === 1) return left;
  if (type === 2) return up;
  if (type === 3) return Math.floor((left + up) / 2);
  if (type === 4) return paethPrediction(left, up, upperLeft);
  throw new Error(`Unsupported PNG filter type: ${type}`);
}

function paethPrediction(left, up, upperLeft) {
  const p = left + up - upperLeft;
  const pa = Math.abs(p - left);
  const pb = Math.abs(p - up);
  const pc = Math.abs(p - upperLeft);
  if (pa <= pb && pa <= pc) return left;
  if (pb <= pc) return up;
  return upperLeft;
}

function opaquePixelsInRegion(png, startX, startY, width, height) {
  let count = 0;
  for (let y = startY; y < startY + height; y += 1) {
    for (let x = startX; x < startX + width; x += 1) {
      if (png.alpha[y * png.width + x] > 0) count += 1;
    }
  }
  return count;
}

function darkOpaquePixelsInRow(png, y) {
  let count = 0;
  for (let x = 0; x < png.width; x += 1) {
    const index = (y * png.width + x) * 4;
    const r = png.rgba[index];
    const g = png.rgba[index + 1];
    const b = png.rgba[index + 2];
    const a = png.rgba[index + 3];
    if (a > 0 && r < 50 && g < 60 && b < 80) count += 1;
  }
  return count;
}

function pixelDifference(first, second) {
  assert.equal(first.width, second.width, 'sprites should have matching widths');
  assert.equal(first.height, second.height, 'sprites should have matching heights');
  let count = 0;
  for (let index = 0; index < first.rgba.length; index += 4) {
    const delta = Math.abs(first.rgba[index] - second.rgba[index])
      + Math.abs(first.rgba[index + 1] - second.rgba[index + 1])
      + Math.abs(first.rgba[index + 2] - second.rgba[index + 2])
      + Math.abs(first.rgba[index + 3] - second.rgba[index + 3]);
    if (delta > 18) count += 1;
  }
  return count;
}

function firstInkComponentBounds(png) {
  return inkComponents(png)[0];
}

function inkComponents(png) {
  const firstIndex = png.alpha.findIndex((value) => value > 0);
  assert.notEqual(firstIndex, -1, 'PNG should contain ink');
  const seen = new Set();
  const components = [];

  png.alpha.forEach((value, index) => {
    if (value === 0) return;
    const startX = index % png.width;
    const startY = Math.floor(index / png.width);
    const startKey = `${startX},${startY}`;
    if (seen.has(startKey)) return;

    const queue = [[startX, startY]];
    let minX = startX;
    let maxX = startX;
    let minY = startY;
    let maxY = startY;

    while (queue.length > 0) {
      const [x, y] = queue.shift();
      const key = `${x},${y}`;
      if (seen.has(key)) continue;
      seen.add(key);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);

      for (const [nextX, nextY] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
        if (nextX < 0 || nextX >= png.width || nextY < 0 || nextY >= png.height) continue;
        if (png.alpha[nextY * png.width + nextX] === 0) continue;
        queue.push([nextX, nextY]);
      }
    }

    components.push({
      minX,
      maxX,
      minY,
      maxY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    });
  });

  return components;
}

function inkColumnsAt(png, y) {
  const columns = [];
  for (let x = 0; x < png.width; x += 1) {
    if (png.alpha[y * png.width + x] > 0) columns.push(x);
  }
  return columns;
}

function inkBounds(png) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  png.alpha.forEach((value, index) => {
    if (value === 0) return;
    const x = index % png.width;
    const y = Math.floor(index / png.width);
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  });

  assert.notEqual(maxX, -Infinity, 'PNG should contain ink');
  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

test('home screen has a mobile layout override', () => {
  assert.match(styleSource, /@media \(max-width: 560px\)[\s\S]*\.home-title-stack/);
});

test('level map is presented as a connected adventure path', () => {
  assert.match(appSource, /map-board/);
  assert.match(appSource, /adventure-path/);
  assert.match(styleSource, /\.map-board::before/);
  assert.match(styleSource, /\.adventure-path/);
});

test('level map cards use aligned grid positions', () => {
  assert.match(styleSource, /\.map-grid\s*{[\s\S]*align-items:\s*stretch/);
  assert.doesNotMatch(styleSource, /\.level-node:nth-child\(odd\)\s*{[\s\S]*transform:\s*translateY/);
  assert.doesNotMatch(styleSource, /\.level-node:nth-child\(even\)\s*{[\s\S]*transform:\s*translateY/);
  assert.match(styleSource, /\.level-node\s*{[\s\S]*height:\s*100%/);
});

test('mission practice layout keeps target and input areas in separate flow regions', () => {
  assert.match(styleSource, /\.mission-screen\s*{[\s\S]*padding:\s*14px 20px/);
  assert.match(styleSource, /\.app-shell:has\(\.mission-screen\)\s*{[\s\S]*margin:\s*0 auto/);
  assert.match(styleSource, /\.stats-row\s*{[\s\S]*margin:\s*10px 0 12px/);
  assert.match(styleSource, /\.mission-stage\s*{[\s\S]*height:\s*clamp\(450px,\s*calc\(100vh - 288px\),\s*600px\)/);
  assert.match(styleSource, /\.mission-stage\s*{[\s\S]*display:\s*grid/);
  assert.match(styleSource, /\.mission-stage\s*{[\s\S]*grid-template-rows:\s*minmax\(190px,\s*1fr\) auto/);
  assert.match(styleSource, /\.mission-target-zone\s*{[\s\S]*align-items:\s*center/);
  assert.match(styleSource, /\.target-card\s*{[\s\S]*position:\s*relative/);
  assert.doesNotMatch(styleSource, /\.target-card\s*{[\s\S]*top:\s*24%/);
  assert.match(styleSource, /\.input-dock\s*{[\s\S]*position:\s*relative/);
  assert.doesNotMatch(appSource, /class="mission-feedback"/);
  assert.doesNotMatch(styleSource, /\.mission-feedback\s*{/);
  assert.doesNotMatch(appSource, /renderTypingStatus/);
  assert.doesNotMatch(styleSource, /\.typing-status\s*{/);
  assert.doesNotMatch(styleSource, /\.typing-row\s*{/);
  assert.match(styleSource, /\.intro-overlay\s*{[\s\S]*z-index:\s*10/);
});

test('mission practice removes the constant guide bubble while keeping the intro guide icon', () => {
  assert.doesNotMatch(appSource, /class="mission-npc"/);
  assert.doesNotMatch(appSource, /class="mission-speech"/);
  assert.match(appSource, /<img class="intro-guide-icon" src="assets\/sprites\/home-brand-icon\.png"/);
  assert.doesNotMatch(appSource, /<div class="mission-npc">\$\{tr\('guideLabel'\)\}<\/div>/);
  assert.doesNotMatch(appSource, /class="npc-sprite small"/);
  assert.match(styleSource, /\.intro-guide-icon\s*{[\s\S]*width:\s*118px/);
});

test('mission keyboard renders fixed QWERTY rows with case and symbol keys', () => {
  assert.match(appSource, /const KEYBOARD_ROWS = \[/);
  assert.match(appSource, /const SPACE_KEY_ROW = \[\{ key: 'Space', column: 8, span: 10 \}\]/);
  assert.match(appSource, /keyboardCase:\s*'lower'/);
  assert.match(appSource, /syncKeyboardCaseFromEvent\(event\)/);
  assert.match(appSource, /syncKeyboardCaseFromEvent\(event, \{ fallbackToggle: true \}\)/);
  assert.match(appSource, /event\.getModifierState\('CapsLock'\)/);
  assert.match(appSource, /state\.keyboardCase === nextCase && options\.fallbackToggle/);
  assert.match(appSource, /if \(isCapsLockEvent\(event\)\)/);
  assert.match(appSource, /function isCapsLockEvent\(event\)/);
  assert.match(appSource, /event\?\.key === 'CapsLock' \|\| event\?\.code === 'CapsLock'/);
  assert.match(appSource, /function isMissionTypingEvent\(event\)/);
  assert.match(appSource, /if \(!isMissionTypingEvent\(event\)\)/);
  assert.match(appSource, /\['top-row', 'home-row', 'bottom-row'\]/);
  assert.match(appSource, /\{ key: 'Q', column: 3 \}/);
  assert.match(appSource, /\{ key: 'W', column: 5 \}/);
  assert.match(appSource, /\{ key: 'A', column: 4 \}/);
  assert.match(appSource, /\{ key: 'Z', column: 5 \}/);
  assert.match(appSource, /\{ key: ';', column: 22 \}/);
  assert.match(appSource, /\{ key: '\?', column: 23 \}/);
  assert.doesNotMatch(appSource, /\{ key: '!', column:/);
  assert.doesNotMatch(appSource, /const rowKeys = row\.filter\(\(key\) => visibleKeys\.has\(key\)\)/);
  assert.doesNotMatch(appSource, /if \(rowKeys\.length === 0\) return '';/);
  assert.match(appSource, /<div class="keyboard-row \$\{rowClass\}">/);
  assert.match(appSource, /<div class="keyboard-row space-row">/);
  assert.doesNotMatch(appSource, /class="keyboard-row special-row"/);
  assert.doesNotMatch(appSource, /\['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Space'/);
  assert.match(appSource, /data-action="toggle-keyboard-case"/);
  assert.match(appSource, />Caps<\/button>/);
  assert.doesNotMatch(appSource, /CapsLk/);
  assert.doesNotMatch(appSource, /state\.keyboardCase === 'upper' \? 'abc' : 'ABC'/);
  assert.doesNotMatch(appSource, /state\.keyboardCase === 'upper' \|\| needsCaps/);
  assert.match(appSource, /const active = needsCaseSwitch \? 'active' : ''/);
  assert.match(appSource, /const active = !needsCaseSwitch && key === next \? 'active' : ''/);
  assert.match(appSource, /function shouldPromptCapsSwitch\(key\)/);
  assert.match(appSource, /const targetCase = isUppercaseLetter\(key\) \? 'upper' : 'lower'/);
  assert.match(appSource, /return targetCase !== state\.keyboardCase/);
  assert.match(appSource, /function isLetterKey\(key\)/);
  assert.match(appSource, /state\.keyboardCase === 'upper' \? key : key\.toLowerCase\(\)/);
  assert.match(appSource, /key === 'Space'/);
  assert.match(appSource, /key === 'Case'/);
  assert.match(styleSource, /\.keyboard\s*{[\s\S]*display:\s*grid/);
  assert.match(styleSource, /\.keyboard\s*{[\s\S]*justify-items:\s*center/);
  assert.match(styleSource, /\.keyboard-row\s*{[\s\S]*display:\s*grid/);
  assert.match(styleSource, /\.keyboard-row\s*{[\s\S]*grid-template-columns:\s*repeat\(24,\s*16px\)/);
  assert.match(styleSource, /\.keyboard-row\s*{[\s\S]*width:\s*max-content/);
  assert.match(styleSource, /\.keyboard-row\s*{[\s\S]*justify-content:\s*center/);
  assert.match(styleSource, /\.keyboard-row\s*{[\s\S]*grid-column:\s*var\(--key-column\) \/ span var\(--key-span,\s*2\)/);
  assert.match(styleSource, /\.keyboard-row\.space-row\s*{[\s\S]*padding-left:\s*0/);
  assert.match(styleSource, /\.space-key\s*{[\s\S]*width:\s*100%/);
  assert.match(styleSource, /\.case-key\s*{/);
  assert.match(styleSource, /\.case-key\.active:hover,\s*\.case-key\.active:focus-visible\s*{[\s\S]*background:\s*var\(--sun\)/);
  assert.match(styleSource, /\.symbol-key\s*{/);
});

test('target error feedback keeps the card in place with a small red shake', () => {
  const errorRule = styleSource.match(/\.target-card\.error\s*{[\s\S]*?}/)?.[0] || '';
  assert.match(errorRule, /background:\s*#ffd1dc/);
  assert.match(errorRule, /border-color:\s*#e4485f/);
  assert.doesNotMatch(errorRule, /animation:/);
  assert.match(styleSource, /\.target-card\.shake\s*{[\s\S]*animation:\s*shake 150ms linear 2/);
  assert.match(appSource, /function triggerTargetShake\(\)/);
  assert.match(appSource, /const shouldShakeTarget = inputWasScored && state\.session\.feedback === 'error'/);
  assert.match(appSource, /if \(shouldShakeTarget\) triggerTargetShake\(\)/);
  assert.match(styleSource, /@keyframes shake\s*{[\s\S]*translateX\(0\)[\s\S]*translateX\(-2px\)[\s\S]*translateX\(2px\)[\s\S]*translateX\(0\)/);
  assert.doesNotMatch(styleSource, /translate\(calc\(-50%/);
  assert.doesNotMatch(styleSource, /translateX\(-8px\)|translateX\(8px\)|translateX\(-6px\)|translateX\(6px\)/);
});
