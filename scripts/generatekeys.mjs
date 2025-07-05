import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const certsDir = path.join(__dirname, 'certs');
if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir);
}

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
    },
    privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
    },
});

console.log('Public Key:\n', publicKey);
console.log('Private Key:\n', privateKey);

fs.writeFileSync(path.join(certsDir, 'private.pem'), privateKey);
fs.writeFileSync(path.join(certsDir, 'public.pem'), publicKey);
