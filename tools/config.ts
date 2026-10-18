// Cấu hình người học: dsa.config.json ở thư mục gốc, vd. { "lang": "py" }.
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

export type Lang = 'ts' | 'py' | 'java';
export const LANGS: Lang[] = ['ts', 'py', 'java'];
const FILE = join(resolve(import.meta.dirname, '..'), 'dsa.config.json');

export function defaultLang(): Lang {
  if (!existsSync(FILE)) return 'ts';
  try {
    const lang = JSON.parse(readFileSync(FILE, 'utf8')).lang;
    return LANGS.includes(lang) ? lang : 'ts';
  } catch {
    return 'ts';
  }
}
