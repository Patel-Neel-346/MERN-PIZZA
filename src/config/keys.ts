import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config(); 
export function loadPrivateKey(): string {
    const envPath = process.env.PRIVATE_KEY_PATH;

    const keyPath = path.resolve(process.cwd(), envPath || 'certs/private.pem');

    try {
        return fs.readFileSync(keyPath, 'utf8');
    } catch (err) {
        console.error(` Error reading private key at ${keyPath}`, err);
        throw err;
    }
}
