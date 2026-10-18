// Tạo file khung bài làm answers/exNN.{ts,py,java} (không ghi đè file đã có).
//   node tools/scaffold.ts lessons/F04-hashing              ngôn ngữ mặc định (dsa.config.json)
//   node tools/scaffold.ts lessons/F04-hashing --lang java
//   node tools/scaffold.ts --all --lang py
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Spec } from './spec.ts';
import { stub } from './sig.ts';
import { defaultLang, LANGS, type Lang } from './config.ts';

const ROOT = resolve(import.meta.dirname, '..');

async function scaffold(lessonDir: string, lang: Lang) {
  const checks = join(lessonDir, 'checks.ts');
  if (!existsSync(checks)) return 0;
  const specs: Record<string, Spec> = (await import(pathToFileURL(resolve(checks)).href)).specs;
  mkdirSync(join(lessonDir, 'answers'), { recursive: true });
  let made = 0;
  for (const [nn, spec] of Object.entries(specs)) {
    if (spec.benchOnly) continue;
    const file = join(lessonDir, 'answers', `ex${nn}.${lang}`);
    if (existsSync(file)) continue;
    const header = [`ex${nn} · ${spec.title} — đề ở exercises.md`, `Chấm: node tools/check.ts ${lessonDir.replace(/\\/g, '/')} ${nn}`];
    writeFileSync(file, stub(lang, spec.sig, header));
    made++;
  }
  return made;
}

const args = process.argv.slice(2);
const li = args.indexOf('--lang');
const lang = (li >= 0 ? args[li + 1] : defaultLang()) as Lang;
if (!LANGS.includes(lang)) {
  console.log(`--lang phải là một trong: ${LANGS.join(', ')}`);
  process.exit(2);
}
const dirs = args.includes('--all')
  ? readdirSync(join(ROOT, 'lessons')).map((d) => join('lessons', d))
  : args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--lang');
if (!dirs.length) {
  console.log('Dùng: node tools/scaffold.ts <lessons/ID-slug> | --all  [--lang ts|py|java]');
  process.exit(2);
}
let total = 0;
for (const d of dirs) total += await scaffold(d, lang);
console.log(`Đã tạo ${total} file khung .${lang} trong answers/ (file đã có được giữ nguyên).`);
