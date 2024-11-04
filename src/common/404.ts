import { readFileSync } from 'fs';
import { join } from 'path';

export async function call404() {
    let html = readFileSync(join(__dirname, '../../public/404.html'), 'utf-8');
    return html;
}
