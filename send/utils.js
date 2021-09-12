const b64 = require('base64-js');

function arrayToB64(array) {
  return b64
    .fromByteArray(array)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function b64ToArray(str) {
  return b64.toByteArray(str + '==='.slice((str.length + 3) % 4));
}

const UNITS = ['bytes', 'kb', 'mb', 'gb'];
function bytes(num) {
  if (num < 1) {
    return '0B';
  }
  const exponent = Math.min(Math.floor(Math.log10(num) / 3), UNITS.length - 1);
  const n = Number(num / Math.pow(1024, exponent));
  const decimalDigits = Math.floor(n) === n ? 0 : 1;
  let nStr = n.toFixed(decimalDigits);
  return `${nStr} ${UNITS[exponent]}`;
}

async function streamToArrayBuffer(stream, size) {
  const reader = stream.getReader();
  let state = await reader.read();

  if (size) {
    const result = new Uint8Array(size);
    let offset = 0;
    while (!state.done) {
      result.set(state.value, offset);
      offset += state.value.length;
      state = await reader.read();
    }
    return result.buffer;
  }

  const parts = [];
  let len = 0;
  while (!state.done) {
    parts.push(state.value);
    len += state.value.length;
    state = await reader.read();
  }
  let offset = 0;
  const result = new Uint8Array(len);
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result.buffer;
}

const ECE_RECORD_SIZE = 1024 * 64;
const TAG_LENGTH = 16;
function encryptedSize(size, rs = ECE_RECORD_SIZE, tagLength = TAG_LENGTH) {
  const chunk_meta = tagLength + 1; // Chunk metadata, tag and delimiter
  return 21 + size + chunk_meta * Math.ceil(size / (rs - chunk_meta));
}

function concat(b1, b2) {
  const result = new Uint8Array(b1.length + b2.length);
  result.set(b1, 0);
  result.set(b2, b1.length);
  return result;
}

module.exports = {
  concat,
  bytes,
  arrayToB64,
  b64ToArray,
  streamToArrayBuffer,
  encryptedSize,
};
