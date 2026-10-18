// Chữ ký bài viết MỘT lần theo kiểu Java, công cụ tự suy ra kiểu TS / Python / Java.
//   function: 'int countPairs(int[] nums, int k)'
//   class   : 'class MinStack {\n  MinStack()\n  void push(int val)\n  int getMin()\n}'
// Kiểu hỗ trợ: int long double boolean char String · Integer Long Double Boolean (có thể null)
//              X[] · List<X> · ListNode · TreeNode · void
import { ListNode, TreeNode, buildList, buildCycleList, buildTree, listToArray, treeToArray } from './lib.ts';

export type Type =
  | { k: 'prim'; name: string }
  | { k: 'arr'; of: Type }
  | { k: 'list'; of: Type }
  | { k: 'node'; name: 'ListNode' | 'TreeNode' }
  | { k: 'void' };

export interface Param { name: string; type: Type; raw: string }
export interface Method { name: string; params: Param[]; ret: Type; retRaw: string }
export interface Sig {
  kind: 'function' | 'class';
  name: string;           // tên hàm hoặc tên class
  fn?: Method;            // kind = function
  ctor?: Param[];         // kind = class
  methods?: Method[];     // kind = class
}

const PRIMS = new Set(['int', 'long', 'short', 'double', 'float', 'boolean', 'char', 'String', 'Integer', 'Long', 'Double', 'Boolean', 'Character']);
const BOXED = new Set(['Integer', 'Long', 'Double', 'Boolean', 'Character']);

export function parseType(s: string): Type {
  s = s.trim();
  if (s.endsWith('[]')) return { k: 'arr', of: parseType(s.slice(0, -2)) };
  const m = /^List<(.+)>$/.exec(s);
  if (m) return { k: 'list', of: parseType(m[1]) };
  if (s === 'ListNode' || s === 'TreeNode') return { k: 'node', name: s };
  if (s === 'void') return { k: 'void' };
  if (PRIMS.has(s)) return { k: 'prim', name: s };
  throw new Error(`sig: kiểu không hỗ trợ "${s}"`);
}

function splitTop(s: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of s) {
    if (ch === '<') depth++;
    if (ch === '>') depth--;
    if (ch === ',' && depth === 0) {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
}

function parseParams(s: string): Param[] {
  return splitTop(s).map((p) => {
    const i = p.lastIndexOf(' ');
    const raw = p.slice(0, i).trim();
    return { name: p.slice(i + 1).trim(), type: parseType(raw), raw };
  });
}

function parseMethod(line: string): Method {
  const m = /^\s*(\S+)\s+(\w+)\s*\((.*)\)\s*;?\s*$/.exec(line);
  if (!m) throw new Error(`sig: không đọc được "${line}"`);
  return { name: m[2], params: parseParams(m[3]), ret: parseType(m[1]), retRaw: m[1] };
}

const cache = new Map<string, Sig>();
export function parseSig(src: string): Sig {
  const hit = cache.get(src);
  if (hit) return hit;
  let sig: Sig;
  const cls = /^\s*class\s+(\w+)\s*\{([\s\S]*)\}\s*$/.exec(src);
  if (cls) {
    const name = cls[1];
    const methods: Method[] = [];
    let ctor: Param[] = [];
    for (const line of cls[2].split('\n').map((l) => l.trim()).filter(Boolean)) {
      const c = new RegExp(`^${name}\\s*\\((.*)\\)\\s*;?$`).exec(line);
      if (c) ctor = parseParams(c[1]);
      else methods.push(parseMethod(line));
    }
    sig = { kind: 'class', name, ctor, methods };
  } else {
    const fn = parseMethod(src);
    sig = { kind: 'function', name: fn.name, fn };
  }
  cache.set(src, sig);
  return sig;
}

// ───────────────────────── plain JSON ↔ cấu trúc thật (phía TS) ─────────────────────────

/** Input thô (JSON) → giá trị thật theo kiểu: mảng → ListNode/TreeNode, {vals,pos} → list có chu trình. */
export function fromPlain(v: any, t: Type): any {
  if (v === null || v === undefined) return null;
  switch (t.k) {
    case 'node':
      if (t.name === 'ListNode') return Array.isArray(v) ? buildList(v) : buildCycleList(v.vals, v.pos);
      return buildTree(v);
    case 'arr':
    case 'list':
      return (v as any[]).map((x) => fromPlain(x, t.of));
    default:
      return v;
  }
}

/** Giá trị thật → JSON thuần để so sánh (list/tree → mảng, typed array → mảng, -0 → 0). */
export function toPlain(v: any, t?: Type): any {
  if (v === null || v === undefined) return t?.k === 'node' ? [] : null; // list/cây rỗng ↔ []
  if (v instanceof ListNode) return listToArray(v);
  if (v instanceof TreeNode) return treeToArray(v);
  if (typeof v === 'number') return v === 0 ? 0 : v;
  if (typeof v === 'bigint') return Number(v);
  if (Array.isArray(v) || ArrayBuffer.isView(v)) {
    const of = t && (t.k === 'arr' || t.k === 'list') ? t.of : undefined;
    return Array.from(v as ArrayLike<any>, (x) => toPlain(x, of));
  }
  return v;
}

// ───────────────────────── tên & kiểu theo từng ngôn ngữ ─────────────────────────

export const snake = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/([A-Z])([A-Z][a-z])/g, '$1_$2').toLowerCase();

export function tsType(t: Type): string {
  switch (t.k) {
    case 'void': return 'void';
    case 'node': return `${t.name} | null`;
    case 'arr':
    case 'list': {
      const inner = tsType(t.of);
      return inner.includes('|') ? `(${inner})[]` : `${inner}[]`;
    }
    case 'prim': {
      const base = ['boolean', 'Boolean'].includes(t.name) ? 'boolean' : ['String', 'char', 'Character'].includes(t.name) ? 'string' : 'number';
      return BOXED.has(t.name) ? `${base} | null` : base;
    }
  }
}

export function pyType(t: Type): string {
  switch (t.k) {
    case 'void': return 'None';
    case 'node': return `${t.name} | None`;
    case 'arr':
    case 'list': return `list[${pyType(t.of)}]`;
    case 'prim': {
      const base = ['boolean', 'Boolean'].includes(t.name) ? 'bool' : ['String', 'char', 'Character'].includes(t.name) ? 'str'
        : ['double', 'float', 'Double'].includes(t.name) ? 'float' : 'int';
      return BOXED.has(t.name) ? `${base} | None` : base;
    }
  }
}

const usesNode = (src: string) => ['ListNode', 'TreeNode'].filter((n) => new RegExp(`\\b${n}\\b`).test(src));

// ───────────────────────── sinh khung bài làm ─────────────────────────

export type Lang = 'ts' | 'py' | 'java';
export const EXT: Record<Lang, string> = { ts: 'ts', py: 'py', java: 'java' };

export function stub(lang: Lang, sigSrc: string, header: string[]): string {
  const sig = parseSig(sigSrc);
  const nodes = usesNode(sigSrc);
  if (lang === 'ts') {
    const TODO = "throw new Error('Chưa làm');";
    const imp = nodes.length ? `import { ${nodes.join(', ')} } from '../../../tools/lib.ts';\n\n` : '';
    const params = (ps: Param[]) => ps.map((p) => `${p.name}: ${tsType(p.type)}`).join(', ');
    const head = header.map((h) => `// ${h}\n`).join('') + '\n';
    if (sig.kind === 'function') {
      const f = sig.fn!;
      return `${imp}${head}export function ${f.name}(${params(f.params)}): ${tsType(f.ret)} {\n  ${TODO}\n}\n`;
    }
    const body = [
      `  constructor(${params(sig.ctor!)}) {\n    ${TODO}\n  }`,
      ...sig.methods!.map((m) => `  ${m.name}(${params(m.params)}): ${tsType(m.ret)} {\n    ${TODO}\n  }`),
    ];
    return `${imp}${head}export class ${sig.name} {\n${body.join('\n\n')}\n}\n`;
  }
  if (lang === 'py') {
    const TODO = 'raise NotImplementedError("Chưa làm")';
    const imp = nodes.length
      ? `import sys, pathlib\nsys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[3] / "tools" / "runners" / "py"))\nfrom dsa import ${nodes.join(', ')}  # noqa: E402\n\n`
      : '';
    const params = (ps: Param[], self = false) => [...(self ? ['self'] : []), ...ps.map((p) => `${snake(p.name)}: ${pyType(p.type)}`)].join(', ');
    const head = header.map((h) => `# ${h}\n`).join('') + '\n';
    const fut = 'from __future__ import annotations\n\n';
    if (sig.kind === 'function') {
      const f = sig.fn!;
      return `${fut}${imp}${head}def ${snake(f.name)}(${params(f.params)}) -> ${pyType(f.ret)}:\n    ${TODO}\n`;
    }
    const body = [
      `    def __init__(${params(sig.ctor!, true)}) -> None:\n        ${TODO}`,
      ...sig.methods!.map((m) => `    def ${snake(m.name)}(${params(m.params, true)}) -> ${pyType(m.ret)}:\n        ${TODO}`),
    ];
    return `${fut}${imp}${head}class ${sig.name}:\n${body.join('\n\n')}\n`;
  }
  // java
  const TODO = 'throw new UnsupportedOperationException("Chưa làm");';
  const params = (ps: Param[]) => ps.map((p) => `${p.raw} ${p.name}`).join(', ');
  const head = header.map((h) => `// ${h}\n`).join('') + '\n';
  const imp = 'import java.util.*;\n\n';
  if (sig.kind === 'function') {
    const f = sig.fn!;
    return `${imp}${head}class Solution {\n    public ${f.retRaw} ${f.name}(${params(f.params)}) {\n        ${TODO}\n    }\n}\n`;
  }
  const body = [
    `    public ${sig.name}(${params(sig.ctor!)}) {\n        ${TODO}\n    }`,
    ...sig.methods!.map((m) => `    public ${m.retRaw} ${m.name}(${params(m.params)}) {\n        ${TODO}\n    }`),
  ];
  return `${imp}${head}class ${sig.name} {\n${body.join('\n\n')}\n}\n`;
}

/** Dạng gọn gửi cho runner Python/Java. */
export function sigForRunner(sigSrc: string) {
  const sig = parseSig(sigSrc);
  const m = (x: Method) => ({ name: x.name, params: x.params.map((p) => p.raw), ret: x.retRaw });
  return sig.kind === 'function'
    ? { kind: 'function', name: sig.name, fn: m(sig.fn!) }
    : { kind: 'class', name: sig.name, ctor: sig.ctor!.map((p) => p.raw), methods: Object.fromEntries(sig.methods!.map((x) => [x.name, m(x)])) };
}
