import { deflateSync, inflateSync } from 'node:zlib';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const targetDirs = [
  join(root, 'assets', 'sprites'),
  join(root, 'assets', 'reference'),
];

let scanned = 0;
let optimized = 0;
let savedBytes = 0;

for (const dir of targetDirs) {
  for (const file of listPngFiles(dir)) {
    scanned += 1;
    const original = readFileSync(file);
    const optimizedPng = optimizePng(original);
    if (!optimizedPng || optimizedPng.length >= original.length) continue;

    writeFileSync(file, optimizedPng);
    optimized += 1;
    savedBytes += original.length - optimizedPng.length;
    console.log(`${relativeToRoot(file)} ${formatBytes(original.length)} -> ${formatBytes(optimizedPng.length)}`);
  }
}

console.log(`Optimized ${optimized}/${scanned} PNG files, saved ${formatBytes(savedBytes)}.`);

function listPngFiles(dir) {
  const entries = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stats = statSync(path);
    if (stats.isDirectory()) {
      entries.push(...listPngFiles(path));
    } else if (extname(name).toLowerCase() === '.png') {
      entries.push(path);
    }
  }
  return entries;
}

function optimizePng(buffer) {
  const png = parsePng(buffer);
  if (!png || png.bitDepth !== 8 || png.interlace !== 0) return null;

  const channels = getChannelCount(png.colorType);
  if (!channels) return null;

  const rowLength = png.width * channels;
  const inflated = inflateSync(Buffer.concat(png.idatChunks));
  const rows = unfilterRows(inflated, png.height, rowLength, channels);
  const filtered = filterRows(rows, rowLength, channels);
  const compressed = deflateSync(filtered, { level: 9 });

  return Buffer.concat([
    PNG_SIGNATURE,
    chunk('IHDR', makeIhdr(png)),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function parsePng(buffer) {
  if (buffer.length < PNG_SIGNATURE.length || !buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
    return null;
  }

  let offset = PNG_SIGNATURE.length;
  const idatChunks = [];
  const png = { idatChunks };

  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString('ascii');
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (dataEnd + 4 > buffer.length) return null;

    const data = buffer.subarray(dataStart, dataEnd);
    if (type === 'IHDR') {
      png.width = data.readUInt32BE(0);
      png.height = data.readUInt32BE(4);
      png.bitDepth = data[8];
      png.colorType = data[9];
      png.compression = data[10];
      png.filter = data[11];
      png.interlace = data[12];
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }

    offset = dataEnd + 4;
  }

  if (!png.width || !png.height || idatChunks.length === 0) return null;
  return png;
}

function getChannelCount(colorType) {
  if (colorType === 0) return 1;
  if (colorType === 2) return 3;
  if (colorType === 4) return 2;
  if (colorType === 6) return 4;
  return 0;
}

function unfilterRows(data, height, rowLength, bytesPerPixel) {
  const rows = [];
  let offset = 0;
  let previous = Buffer.alloc(rowLength);

  for (let y = 0; y < height; y += 1) {
    const filterType = data[offset];
    const source = data.subarray(offset + 1, offset + 1 + rowLength);
    const row = Buffer.alloc(rowLength);

    for (let x = 0; x < rowLength; x += 1) {
      const left = x >= bytesPerPixel ? row[x - bytesPerPixel] : 0;
      const up = previous[x];
      const upperLeft = x >= bytesPerPixel ? previous[x - bytesPerPixel] : 0;
      row[x] = (source[x] + predict(filterType, left, up, upperLeft)) & 0xff;
    }

    rows.push(row);
    previous = row;
    offset += rowLength + 1;
  }

  return rows;
}

function filterRows(rows, rowLength, bytesPerPixel) {
  const output = Buffer.alloc((rowLength + 1) * rows.length);
  let outputOffset = 0;
  let previous = Buffer.alloc(rowLength);

  for (const row of rows) {
    let bestType = 0;
    let bestRow = null;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let type = 0; type <= 4; type += 1) {
      const filtered = Buffer.alloc(rowLength);
      let score = 0;

      for (let x = 0; x < rowLength; x += 1) {
        const left = x >= bytesPerPixel ? row[x - bytesPerPixel] : 0;
        const up = previous[x];
        const upperLeft = x >= bytesPerPixel ? previous[x - bytesPerPixel] : 0;
        const value = (row[x] - predict(type, left, up, upperLeft)) & 0xff;
        filtered[x] = value;
        score += value < 128 ? value : 256 - value;
      }

      if (score < bestScore) {
        bestType = type;
        bestRow = filtered;
        bestScore = score;
      }
    }

    output[outputOffset] = bestType;
    bestRow.copy(output, outputOffset + 1);
    outputOffset += rowLength + 1;
    previous = row;
  }

  return output;
}

function predict(type, left, up, upperLeft) {
  if (type === 0) return 0;
  if (type === 1) return left;
  if (type === 2) return up;
  if (type === 3) return Math.floor((left + up) / 2);
  if (type === 4) return paeth(left, up, upperLeft);
  throw new Error(`Unsupported PNG filter type: ${type}`);
}

function paeth(left, up, upperLeft) {
  const p = left + up - upperLeft;
  const pa = Math.abs(p - left);
  const pb = Math.abs(p - up);
  const pc = Math.abs(p - upperLeft);
  if (pa <= pb && pa <= pc) return left;
  if (pb <= pc) return up;
  return upperLeft;
}

function makeIhdr(png) {
  const data = Buffer.alloc(13);
  data.writeUInt32BE(png.width, 0);
  data.writeUInt32BE(png.height, 4);
  data[8] = png.bitDepth;
  data[9] = png.colorType;
  data[10] = png.compression;
  data[11] = png.filter;
  data[12] = png.interlace;
  return data;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function relativeToRoot(path) {
  return path.replace(`${root}\\`, '').replaceAll('\\', '/');
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}
