// Encrypts an HTML page so it can only be opened with a username + password.
//
// Usage:
//   node tools/encrypt-page.mjs <input.html> <output.enc.json> <username> <password>
//
// Example:
//   node tools/encrypt-page.mjs ~/Desktop/teensy-patcher1.html \
//       pages/works/teensy-patcher1.enc.json 89Sound knob
//
// Only the .enc.json goes on the site. Never commit the plain .html.
// The browser side lives in pages/works/linkexe.html (decryptPage) and must
// use the same parameters as below.

import { readFile, writeFile } from 'node:fs/promises';
import { webcrypto as crypto } from 'node:crypto';

const ITERATIONS = 600000;

const [input, output, username, password] = process.argv.slice(2);
if (!input || !output || !username || !password) {
    console.error('Usage: node tools/encrypt-page.mjs <input.html> <output.enc.json> <username> <password>');
    process.exit(1);
}

const plaintext = await readFile(input);
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));

const baseKey = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(username + ':' + password), 'PBKDF2', false, ['deriveKey']
);
const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    baseKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt']
);
const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);

const b64 = (bytes) => Buffer.from(bytes).toString('base64');
await writeFile(output, JSON.stringify({
    v: 1,
    iterations: ITERATIONS,
    salt: b64(salt),
    iv: b64(iv),
    data: b64(new Uint8Array(ciphertext))
}));

console.log('Encrypted ' + input + ' -> ' + output);
