import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync, inflateSync } from 'node:zlib';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sourcePath = join(root, 'assets', 'reference', 'home-reference-b.png');
const outDir = join(root, 'assets', 'sprites');

const CROP_SPECS = [
  { name: 'home-brand-icon.png', x: 174, y: 136, width: 118, height: 128 },
  { name: 'button-adventure.png', x: 162, y: 372, width: 202, height: 188 },
  { name: 'button-practice.png', x: 382, y: 372, width: 198, height: 188 },
  { name: 'button-games.png', x: 594, y: 372, width: 198, height: 188, mode: 'gamesButton' },
  { name: 'icon-sound-on.png', x: 1299, y: 96, width: 88, height: 82 },
  { name: 'icon-sound-off.png', x: 1299, y: 96, width: 88, height: 82, mode: 'soundOff' },
  { name: 'icon-language-en.png', x: 1408, y: 96, width: 90, height: 82, mode: 'languageEn' },
  { name: 'icon-language-zh.png', x: 1408, y: 96, width: 90, height: 82, mode: 'languageZh' },
  { name: 'speech-bubble.png', x: 1189, y: 342, width: 246, height: 144 },
  { name: 'robot-guide.png', x: 1190, y: 485, width: 340, height: 357 },
  { name: 'bg-tree-left.png', x: 0, y: 480, width: 108, height: 382 },
  { name: 'bg-tree-right.png', x: 1570, y: 585, width: 108, height: 300 },
  { name: 'home-map.png', x: 176, y: 390, width: 966, height: 455, mode: 'map' },
];

const DRAWN_SPRITES = [
  {
    name: 'game-animal-floor.png',
    width: 320,
    height: 112,
    cell: 4,
    draw: 'animalFloor',
  },
  { name: 'game-animal-cat.png', width: 80, height: 72, draw: 'animalCat' },
  { name: 'game-animal-frog.png', width: 80, height: 72, draw: 'animalFrog' },
  { name: 'game-animal-dog.png', width: 80, height: 72, draw: 'animalDog' },
  {
    name: 'game-bomb.png',
    width: 180,
    height: 180,
    cell: 4,
    draw: 'bomb',
  },
  {
    name: 'game-raindrop.png',
    width: 96,
    height: 112,
    cell: 4,
    draw: 'raindrop',
  },
  {
    name: 'bg-cloud-a.png',
    width: 96,
    height: 56,
    cell: 4,
    palette: { W: '#ffffff', S: '#dff6ff' },
    pixels: [
      '                        ',
      '       WWWWWW           ',
      '     WWWWWWWWWW         ',
      '   WWWWWWWWWWWWWW       ',
      ' WWWWWWWWWWWWWWWWWW     ',
      'WWWWWWWWWWWWWWWWWWWW    ',
      'SSWWWWWWWWWWWWWWWWWWW   ',
      '  SSWWWWWWWWWWWWWWWWW   ',
      '    SSSSSSSSSSSSSSSS    ',
      '                        ',
      '                        ',
      '                        ',
      '                        ',
      '                        ',
    ],
  },
  {
    name: 'bg-cloud-b.png',
    width: 120,
    height: 64,
    cell: 4,
    palette: { W: '#ffffff', S: '#dff6ff' },
    pixels: [
      '                              ',
      '          WWWWWW              ',
      '        WWWWWWWWWW            ',
      '      WWWWWWWWWWWWWW          ',
      '   WWWWWWWWWWWWWWWWWWW        ',
      ' WWWWWWWWWWWWWWWWWWWWWWW      ',
      'WWWWWWWWWWWWWWWWWWWWWWWWW     ',
      'SSWWWWWWWWWWWWWWWWWWWWWWWW    ',
      '  SSWWWWWWWWWWWWWWWWWWWWW     ',
      '    SSSSSSSSSSSSSSSSSSS       ',
      '                              ',
      '                              ',
      '                              ',
      '                              ',
      '                              ',
      '                              ',
    ],
  },
  {
    name: 'bg-bush.png',
    width: 96,
    height: 52,
    cell: 4,
    palette: { A: '#2f9e44', B: '#6ecb63', C: '#9be15d', D: '#4caf50' },
    pixels: [
      '                        ',
      '      BBBB    BBB       ',
      '    BBCCCCBBBBCCCBB     ',
      '  BBBCCCCCCCCCCCCBBB    ',
      ' BBCCCCDDCCCCDDCCCCBB   ',
      'BBCCCDDDDCCDDDDCCCCBB   ',
      'BCCCCDDDDDDDDDDDCCCCB   ',
      'BBCCCCDDDDDDDDDCCCCBB   ',
      ' BBBCCCCCCCCCCCCCCBBB   ',
      '   BBBBBBBBBBBBBBBB     ',
      '                        ',
      '                        ',
      '                        ',
    ],
  },
  {
    name: 'bg-grass.png',
    width: 48,
    height: 28,
    cell: 4,
    palette: { A: '#6ecb63', B: '#9be15d', C: '#2f9e44' },
    pixels: [
      '            ',
      '    B       ',
      ' B  BA  B   ',
      ' BA BAC BA  ',
      'BACBACBACBA ',
      'AAAAAAAAAAAA',
      '            ',
    ],
  },
];

if (!existsSync(sourcePath)) {
  throw new Error(`Missing reference image: ${sourcePath}`);
}

mkdirSync(outDir, { recursive: true });
const source = decodePng(readFileSync(sourcePath));
for (const spec of CROP_SPECS) {
  const crop = cropPixels(source, spec);
  if (spec.mode === 'map') {
    eraseHomeMapButtonArea(crop);
    transparentMapBackground(crop);
  } else if (spec.mode !== 'opaque') {
    transparentEdgeBackground(crop);
  }
  if (spec.mode === 'soundOff') drawSoundOffState(crop);
  if (spec.mode === 'languageEn') drawLanguageBadge(crop, 'EN');
  if (spec.mode === 'languageZh') drawLanguageBadge(crop, 'ZH');
  if (spec.mode === 'gamesButton') drawGamesButton(crop);
  writeFileSync(join(outDir, spec.name), encodePng(crop));
}
for (const spec of DRAWN_SPRITES) {
  writeFileSync(join(outDir, spec.name), encodePng(drawPixelSprite(spec)));
}

function cropPixels(sourceImage, spec) {
  const image = createPixels(spec.width, spec.height);
  for (let y = 0; y < spec.height; y += 1) {
    for (let x = 0; x < spec.width; x += 1) {
      const src = ((spec.y + y) * sourceImage.width + spec.x + x) * 4;
      const dest = (y * spec.width + x) * 4;
      image.rgba[dest] = sourceImage.rgba[src];
      image.rgba[dest + 1] = sourceImage.rgba[src + 1];
      image.rgba[dest + 2] = sourceImage.rgba[src + 2];
      image.rgba[dest + 3] = sourceImage.rgba[src + 3];
    }
  }
  return image;
}

function drawPixelSprite(spec) {
  const image = createPixels(spec.width, spec.height);
  if (spec.draw === 'animalFloor') {
    drawAnimalFloor(image);
    return image;
  }
  if (spec.draw === 'animalCat') {
    drawPixelAnimal(image, 12, 0, '#ffd166', '#f4a261', 'cat');
    return image;
  }
  if (spec.draw === 'animalFrog') {
    drawPixelAnimal(image, 12, 0, '#8ff3c5', '#2f9e44', 'frog');
    return image;
  }
  if (spec.draw === 'animalDog') {
    drawPixelAnimal(image, 12, 0, '#ff9f68', '#ef476f', 'dog');
    return image;
  }
  if (spec.draw === 'bomb') {
    drawBomb(image);
    return image;
  }
  if (spec.draw === 'raindrop') {
    drawRaindrop(image);
    return image;
  }
  const cell = spec.cell || 1;
  spec.pixels.forEach((row, rowIndex) => {
    [...row].forEach((key, colIndex) => {
      const color = spec.palette[key];
      if (!color) return;
      fillCell(image, colIndex * cell, rowIndex * cell, cell, color);
    });
  });
  return image;
}

function drawGamesButton(image) {
  drawRect(image, 54, 28, 92, 96, '#ff7a90');
  drawRect(image, 46, 56, 106, 52, '#0b1b2d');
  drawRect(image, 54, 48, 90, 60, '#0b1b2d');
  drawRect(image, 58, 52, 82, 52, '#e6f7ff');
  drawRect(image, 62, 56, 74, 44, '#35a7ff');
  drawRect(image, 70, 68, 24, 8, '#0b1b2d');
  drawRect(image, 78, 60, 8, 24, '#0b1b2d');
  drawRect(image, 112, 64, 8, 8, '#ffd166');
  drawRect(image, 124, 76, 8, 8, '#8ff3c5');
  drawRect(image, 62, 92, 16, 16, '#0b1b2d');
  drawRect(image, 120, 92, 16, 16, '#0b1b2d');
}

function drawAnimalFloor(image) {
  const ink = '#0b1b2d';
  drawRect(image, 12, 76, 296, 28, ink);
  drawRect(image, 20, 68, 280, 28, '#8bdc57');
  drawRect(image, 20, 88, 280, 16, '#70402f');
  for (let x = 28; x < 296; x += 32) drawRect(image, x, 88, 16, 8, '#4e2c24');
  for (let x = 28; x < 296; x += 40) drawRect(image, x, 64, 20, 8, '#b8ef71');
}

function drawPixelAnimal(image, x, y, face, accent, kind) {
  const ink = '#0b1b2d';
  if (kind === 'cat') {
    drawRect(image, x, y, 16, 16, ink);
    drawRect(image, x + 40, y, 16, 16, ink);
  }
  if (kind === 'dog') {
    drawRect(image, x - 8, y + 12, 12, 28, accent);
    drawRect(image, x + 52, y + 12, 12, 28, accent);
  }
  drawRect(image, x, y + 8, 56, 48, ink);
  drawRect(image, x + 4, y + 12, 48, 40, face);
  if (kind === 'frog') {
    drawRect(image, x + 4, y, 16, 16, ink);
    drawRect(image, x + 36, y, 16, 16, ink);
    drawRect(image, x + 8, y + 4, 8, 8, '#ffffff');
    drawRect(image, x + 40, y + 4, 8, 8, '#ffffff');
  }
  drawRect(image, x + 14, y + 26, 8, 8, ink);
  drawRect(image, x + 34, y + 26, 8, 8, ink);
  drawRect(image, x + 24, y + 38, 12, 4, accent);
  drawRect(image, x + 8, y + 52, 40, 12, ink);
  drawRect(image, x + 12, y + 52, 32, 8, accent);
}

function drawBomb(image) {
  const ink = '#0b1b2d';
  const body = '#302d2b';
  const fuse = '#9b6b4b';
  const bodyRows = [
    [40, 66, 48], [48, 50, 80], [56, 42, 96], [64, 34, 112],
    [72, 30, 120], [80, 26, 128], [88, 22, 136], [96, 22, 136],
    [104, 22, 136], [112, 22, 136], [120, 22, 136], [128, 26, 128],
    [136, 30, 120], [144, 34, 112], [152, 42, 96], [160, 50, 80],
    [168, 66, 48],
  ];

  bodyRows.forEach(([y, x, width]) => drawRect(image, x, y, width, 8, ink));
  bodyRows.slice(1, -1).forEach(([y, x, width]) => {
    drawRect(image, x + 8, y, width - 16, 8, body);
  });

  drawRect(image, 96, 24, 40, 16, ink);
  drawRect(image, 104, 24, 24, 8, body);
  drawRect(image, 128, 24, 8, 8, fuse);
  drawRect(image, 132, 16, 8, 8, fuse);

  [
    [0, 156, 8], [8, 148, 24], [16, 140, 40],
    [24, 148, 24], [32, 156, 8],
  ].forEach(([y, x, width]) => drawRect(image, x, y, width, 8, '#ff4b2b'));
  [
    [8, 156, 8], [16, 148, 24], [24, 156, 8],
  ].forEach(([y, x, width]) => drawRect(image, x, y, width, 8, '#ffd23f'));

  drawRect(image, 42, 80, 8, 8, '#ffffff');
  drawRect(image, 58, 64, 16, 16, '#ffffff');
  drawRect(image, 52, 96, 76, 40, '#fff8df');
  drawRect(image, 60, 104, 60, 24, ink);
  drawGlyph(image, 68, 108, [
    '11101110111',
    '10101010101',
    '10101010101',
    '10101010101',
    '11101110111',
  ], 4, '#ffd23f');
}

function drawRaindrop(image) {
  const ink = '#0b1b2d';
  const darkWater = '#35a7d8';
  const water = '#75dff3';
  const highlight = '#dff8ff';

  drawRect(image, 44, 0, 8, 8, ink);
  drawRect(image, 40, 8, 16, 8, ink);
  drawRect(image, 36, 16, 24, 8, ink);
  drawRect(image, 32, 24, 32, 8, ink);
  drawRect(image, 28, 32, 40, 8, ink);
  drawRect(image, 24, 40, 48, 8, ink);
  drawRect(image, 20, 48, 56, 8, ink);
  drawRect(image, 16, 56, 64, 8, ink);
  drawRect(image, 12, 64, 72, 24, ink);
  drawRect(image, 16, 88, 64, 8, ink);
  drawRect(image, 24, 96, 48, 8, ink);
  drawRect(image, 32, 104, 32, 8, ink);

  drawRect(image, 44, 12, 8, 12, highlight);
  drawRect(image, 40, 20, 16, 12, highlight);
  drawRect(image, 36, 28, 24, 12, water);
  drawRect(image, 32, 36, 32, 12, water);
  drawRect(image, 28, 44, 40, 12, water);
  drawRect(image, 24, 52, 48, 12, water);
  drawRect(image, 20, 60, 56, 24, water);
  drawRect(image, 24, 84, 48, 8, darkWater);
  drawRect(image, 32, 92, 32, 8, darkWater);
  drawRect(image, 40, 100, 16, 4, darkWater);
  drawRect(image, 28, 48, 8, 24, highlight);
}

function fillCell(image, x, y, size, color) {
  const { r, g, b, a } = parseColor(color);
  for (let row = y; row < Math.min(image.height, y + size); row += 1) {
    for (let col = x; col < Math.min(image.width, x + size); col += 1) {
      const index = (row * image.width + col) * 4;
      image.rgba[index] = r;
      image.rgba[index + 1] = g;
      image.rgba[index + 2] = b;
      image.rgba[index + 3] = a;
    }
  }
}

function parseColor(color) {
  const hex = color.replace('#', '');
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
    a: 255,
  };
}

function transparentEdgeBackground(image) {
  const queue = [];
  const seen = new Uint8Array(image.width * image.height);

  for (let x = 0; x < image.width; x += 1) {
    queueIfBackground(image, x, 0, queue, seen);
    queueIfBackground(image, x, image.height - 1, queue, seen);
  }
  for (let y = 0; y < image.height; y += 1) {
    queueIfBackground(image, 0, y, queue, seen);
    queueIfBackground(image, image.width - 1, y, queue, seen);
  }

  while (queue.length > 0) {
    const [x, y] = queue.shift();
    const index = (y * image.width + x) * 4;
    image.rgba[index + 3] = 0;
    queueIfBackground(image, x + 1, y, queue, seen);
    queueIfBackground(image, x - 1, y, queue, seen);
    queueIfBackground(image, x, y + 1, queue, seen);
    queueIfBackground(image, x, y - 1, queue, seen);
  }
}

function transparentMapBackground(image) {
  floodTransparent(image, looksLikeMapBackground);
}

function floodTransparent(image, backgroundTest) {
  const queue = [];
  const seen = new Uint8Array(image.width * image.height);

  for (let x = 0; x < image.width; x += 1) {
    queueIfCustomBackground(image, x, 0, queue, seen, backgroundTest);
    queueIfCustomBackground(image, x, image.height - 1, queue, seen, backgroundTest);
  }
  for (let y = 0; y < image.height; y += 1) {
    queueIfCustomBackground(image, 0, y, queue, seen, backgroundTest);
    queueIfCustomBackground(image, image.width - 1, y, queue, seen, backgroundTest);
  }

  while (queue.length > 0) {
    const [x, y] = queue.shift();
    const index = (y * image.width + x) * 4;
    image.rgba[index + 3] = 0;
    queueIfCustomBackground(image, x + 1, y, queue, seen, backgroundTest);
    queueIfCustomBackground(image, x - 1, y, queue, seen, backgroundTest);
    queueIfCustomBackground(image, x, y + 1, queue, seen, backgroundTest);
    queueIfCustomBackground(image, x, y - 1, queue, seen, backgroundTest);
  }
}

function queueIfBackground(image, x, y, queue, seen) {
  if (x < 0 || y < 0 || x >= image.width || y >= image.height) return;
  const pixelIndex = y * image.width + x;
  if (seen[pixelIndex]) return;
  const index = pixelIndex * 4;
  if (!looksLikeReferenceBackground(image.rgba[index], image.rgba[index + 1], image.rgba[index + 2], image.rgba[index + 3])) return;
  seen[pixelIndex] = 1;
  queue.push([x, y]);
}

function queueIfCustomBackground(image, x, y, queue, seen, backgroundTest) {
  if (x < 0 || y < 0 || x >= image.width || y >= image.height) return;
  const pixelIndex = y * image.width + x;
  if (seen[pixelIndex]) return;
  const index = pixelIndex * 4;
  if (!backgroundTest(image.rgba[index], image.rgba[index + 1], image.rgba[index + 2], image.rgba[index + 3])) return;
  seen[pixelIndex] = 1;
  queue.push([x, y]);
}

function looksLikeReferenceBackground(r, g, b, a) {
  if (a === 0) return true;
  const cream = r >= 215 && g >= 198 && b >= 145 && Math.abs(r - g) <= 55;
  const sky = b >= 210 && g >= 145 && r <= 120;
  return cream || sky;
}

function looksLikeMapBackground(r, g, b, a) {
  if (a === 0) return true;
  return r >= 232 && g >= 218 && b >= 185;
}

function eraseHomeMapButtonArea(image) {
  clearRect(image, 0, 0, 650, 182);
}

function clearRect(image, x, y, width, height) {
  const endX = Math.min(image.width, x + width);
  const endY = Math.min(image.height, y + height);
  for (let row = Math.max(0, y); row < endY; row += 1) {
    for (let col = Math.max(0, x); col < endX; col += 1) {
      image.rgba[(row * image.width + col) * 4 + 3] = 0;
    }
  }
}

function drawSoundOffState(image) {
  tintOpaquePixels(image, (r, g, b, a) => {
    if (a === 0) return [r, g, b, a];
    const isGreenButton = g > 145 && r < 170 && b > 110;
    if (!isGreenButton) return [r, g, b, a];
    return [
      Math.round(r * 0.62 + 120 * 0.38),
      Math.round(g * 0.62 + 132 * 0.38),
      Math.round(b * 0.62 + 144 * 0.38),
      a,
    ];
  });
  drawPixelLine(image, 25, 58, 63, 20, 5, '#0b1b2d');
  drawPixelLine(image, 28, 58, 66, 20, 3, '#ff6b7a');
}

function drawLanguageBadge(image, label) {
  const x = 49;
  const y = 45;
  const badgeFill = label === 'EN' ? '#7bdff2' : '#ffd565';
  drawRect(image, x, y, 35, 28, '#0b1b2d');
  drawRect(image, x + 4, y + 4, 27, 20, '#fff8dc');
  drawRect(image, x + 7, y + 7, 21, 14, badgeFill);
  if (label === 'EN') {
    drawGlyph(image, x + 9, y + 9, [
      '1110',
      '1000',
      '1110',
      '1000',
      '1110',
    ], 2, '#0b1b2d');
    drawGlyph(image, x + 19, y + 9, [
      '1001',
      '1101',
      '1011',
      '1001',
      '1001',
    ], 2, '#0b1b2d');
  } else {
    drawGlyph(image, x + 11, y + 8, [
      '00100',
      '11111',
      '10101',
      '10101',
      '11111',
      '00100',
    ], 2, '#0b1b2d');
  }
}

function tintOpaquePixels(image, transform) {
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const index = (y * image.width + x) * 4;
      const [r, g, b, a] = transform(
        image.rgba[index],
        image.rgba[index + 1],
        image.rgba[index + 2],
        image.rgba[index + 3],
      );
      image.rgba[index] = r;
      image.rgba[index + 1] = g;
      image.rgba[index + 2] = b;
      image.rgba[index + 3] = a;
    }
  }
}

function drawRect(image, x, y, width, height, color) {
  const { r, g, b, a } = parseColor(color);
  for (let row = Math.max(0, y); row < Math.min(image.height, y + height); row += 1) {
    for (let col = Math.max(0, x); col < Math.min(image.width, x + width); col += 1) {
      const index = (row * image.width + col) * 4;
      image.rgba[index] = r;
      image.rgba[index + 1] = g;
      image.rgba[index + 2] = b;
      image.rgba[index + 3] = a;
    }
  }
}

function drawGlyph(image, x, y, rows, cell, color) {
  rows.forEach((row, rowIndex) => {
    [...row].forEach((value, colIndex) => {
      if (value !== '1') return;
      drawRect(image, x + colIndex * cell, y + rowIndex * cell, cell, cell, color);
    });
  });
}

function drawPixelLine(image, x1, y1, x2, y2, size, color) {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const steps = Math.max(dx, dy);
  for (let step = 0; step <= steps; step += 1) {
    const x = Math.round(x1 + ((x2 - x1) * step) / steps);
    const y = Math.round(y1 + ((y2 - y1) * step) / steps);
    drawRect(image, x, y, size, size, color);
  }
}

function decodePng(bytes) {
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  const bitDepth = bytes[24];
  const colorType = bytes[25];
  if (bitDepth !== 8 || ![2, 6].includes(colorType)) {
    throw new Error(`Unsupported PNG format: bitDepth=${bitDepth}, colorType=${colorType}`);
  }

  let offset = 8;
  const idat = [];
  while (offset < bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    const dataStart = offset + 8;
    if (type === 'IDAT') idat.push(bytes.subarray(dataStart, dataStart + length));
    offset = dataStart + length + 4;
  }

  const channels = colorType === 6 ? 4 : 3;
  const stride = width * channels;
  const raw = inflateSync(Buffer.concat(idat));
  const unpacked = Buffer.alloc(height * stride);

  for (let y = 0; y < height; y += 1) {
    const rawRow = y * (stride + 1);
    const filter = raw[rawRow];
    const row = raw.subarray(rawRow + 1, rawRow + 1 + stride);
    const outRow = y * stride;
    const prevRow = y > 0 ? (y - 1) * stride : -1;

    for (let x = 0; x < stride; x += 1) {
      const left = x >= channels ? unpacked[outRow + x - channels] : 0;
      const up = prevRow >= 0 ? unpacked[prevRow + x] : 0;
      const upLeft = prevRow >= 0 && x >= channels ? unpacked[prevRow + x - channels] : 0;
      let value = row[x];
      if (filter === 1) value = (value + left) & 255;
      else if (filter === 2) value = (value + up) & 255;
      else if (filter === 3) value = (value + Math.floor((left + up) / 2)) & 255;
      else if (filter === 4) value = (value + paeth(left, up, upLeft)) & 255;
      else if (filter !== 0) throw new Error(`Unsupported PNG filter: ${filter}`);
      unpacked[outRow + x] = value;
    }
  }

  const image = createPixels(width, height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const src = (y * width + x) * channels;
      const dest = (y * width + x) * 4;
      image.rgba[dest] = unpacked[src];
      image.rgba[dest + 1] = unpacked[src + 1];
      image.rgba[dest + 2] = unpacked[src + 2];
      image.rgba[dest + 3] = colorType === 6 ? unpacked[src + 3] : 255;
    }
  }
  return image;
}

function paeth(left, up, upLeft) {
  const p = left + up - upLeft;
  const pa = Math.abs(p - left);
  const pb = Math.abs(p - up);
  const pc = Math.abs(p - upLeft);
  if (pa <= pb && pa <= pc) return left;
  if (pb <= pc) return up;
  return upLeft;
}

function createPixels(width, height) {
  return {
    width,
    height,
    rgba: new Uint8Array(width * height * 4),
  };
}

function encodePng(image) {
  const raw = Buffer.alloc((image.width * 4 + 1) * image.height);
  for (let y = 0; y < image.height; y += 1) {
    const rowStart = y * (image.width * 4 + 1);
    raw[rowStart] = 0;
    for (let x = 0; x < image.width; x += 1) {
      const src = (y * image.width + x) * 4;
      const dest = rowStart + 1 + x * 4;
      raw[dest] = image.rgba[src];
      raw[dest + 1] = image.rgba[src + 1];
      raw[dest + 2] = image.rgba[src + 2];
      raw[dest + 3] = image.rgba[src + 3];
    }
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr(image.width, image.height)),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function ihdr(width, height) {
  const data = Buffer.alloc(13);
  data.writeUInt32BE(width, 0);
  data.writeUInt32BE(height, 4);
  data[8] = 8;
  data[9] = 6;
  data[10] = 0;
  data[11] = 0;
  data[12] = 0;
  return data;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  typeBuffer.copy(out, 4);
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 8 + data.length);
  return out;
}

function crc32(buffer) {
  let crc = -1;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ -1) >>> 0;
}
