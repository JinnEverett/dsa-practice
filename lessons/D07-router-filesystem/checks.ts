import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

const segsOf = (p: string) => (p === '/' ? [] : p.slice(1).split('/'));
const pathOf = (segs: string[]) => '/' + segs.join('/');

/**
 * Ngây thơ: thử MỌI mẫu rồi chọn mẫu khớp có "vector ưu tiên" nhỏ nhất theo thứ tự từ điển
 * (đoạn tĩnh 0 < tham số 1 < wildcard 2; so sánh từ đoạn đầu). Hai mẫu cùng hình dạng (bỏ tên tham số): mẫu thêm sau ghi đè.
 */
class NaiveRouter {
  routes = new Map<string, { segs: string[]; handler: string }>();
  add(pattern: string, handler: string) {
    const segs = segsOf(pattern);
    const shape = segs.map((s) => (s[0] === ':' ? ':' : s)).join('/');
    this.routes.set(shape, { segs, handler });
  }
  match(path: string) {
    const p = segsOf(path);
    let best: { vec: number[]; handler: string } | null = null;
    for (const { segs, handler } of this.routes.values()) {
      const vec: number[] = [];
      let ok = true;
      for (let i = 0; i < segs.length && ok; i++) {
        const k = segs[i];
        if (k === '*') {
          ok = i < p.length;
          vec.push(2);
          break;
        }
        if (i >= p.length) ok = false;
        else if (k[0] === ':') vec.push(1);
        else if (k === p[i]) vec.push(0);
        else ok = false;
      }
      if (ok && segs[segs.length - 1] !== '*' && segs.length !== p.length) ok = false;
      if (ok && (!best || this.less(vec, best.vec))) best = { vec, handler };
    }
    return best ? best.handler : null;
  }
  less(a: number[], b: number[]) {
    for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i] < b[i];
    return a.length < b.length;
  }
}

/** Ngây thơ: lưu phẳng Map<đường dẫn, nội dung | null(thư mục)>; ls quét mọi đường dẫn. */
class NaiveFileSystem {
  m = new Map<string, string | null>([['/', null]]);
  private ensureDirs(segs: string[]) {
    for (let i = 1; i <= segs.length; i++) {
      const p = pathOf(segs.slice(0, i));
      if (!this.m.has(p)) this.m.set(p, null);
    }
  }
  ls(path: string) {
    const v = this.m.get(path);
    if (v !== null && v !== undefined) return [segsOf(path).pop()!];
    const prefix = path === '/' ? '/' : path + '/';
    const out: string[] = [];
    for (const k of this.m.keys()) {
      if (k.length > prefix.length && k.startsWith(prefix) && !k.slice(prefix.length).includes('/')) out.push(k.slice(prefix.length));
    }
    return out.sort();
  }
  mkdir(path: string) {
    this.ensureDirs(segsOf(path));
  }
  addContentToFile(path: string, content: string) {
    const segs = segsOf(path);
    this.ensureDirs(segs.slice(0, -1));
    this.m.set(path, (this.m.get(path) ?? '') + content);
  }
  readContentFromFile(path: string) {
    return this.m.get(path)!;
  }
}

const routerSegs = ['a', 'b', 'c'];
const bigWords = Array.from({ length: 60 }, (_, i) => 'w' + i);

/** Sinh mẫu ngẫu nhiên: mỗi đoạn tĩnh / tham số / (đoạn cuối) wildcard. */
const genPattern = (r: Rng, words: string[], maxLen: number, wildP: number) => {
  const len = r.int(0, maxLen);
  const segs: string[] = [];
  for (let i = 0; i < len; i++) {
    if (i === len - 1 && r.bool(wildP)) segs.push('*');
    else segs.push(r.bool(0.3) ? ':' + r.pick(['x', 'y', 'id']) : r.pick(words));
  }
  return pathOf(segs);
};

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'class Router {\n  Router()\n  void add(String pattern, String handler)\n  String match(String path)\n}',
    title: 'Router (static > :param > *)',
    ref: S.Router,
    brute: NaiveRouter,
    cases: [
      {
        args: [
          ['Router', 'add', 'add', 'add', 'add', 'match', 'match', 'match', 'match', 'match', 'match'],
          [[], ['/users/me', 'me'], ['/users/:id', 'user'], ['/users/:id/posts', 'posts'], ['/static/*', 'static'], ['/users/me'], ['/users/42'], ['/users/42/posts'], ['/static/css/app.css'], ['/static'], ['/nope']],
        ],
        expected: [null, null, null, null, null, 'me', 'user', 'posts', 'static', null, null],
        note: '`/static/*` cần ≥ 1 đoạn; không khớp → null',
      },
      {
        args: [
          ['Router', 'add', 'add', 'add', 'match', 'match'],
          [[], ['/a/b/c', 'exact'], ['/a/:x/d', 'param-d'], ['/a/*', 'wild'], ['/a/b/d'], ['/a/b/e']],
        ],
        expected: [null, null, null, null, 'param-d', 'wild'],
        note: 'quay lui: nhánh tĩnh /a/b không có /d → thử :x',
      },
      {
        args: [['Router', 'add', 'add', 'match', 'match', 'add', 'match'], [[], ['/', 'root'], ['/*', 'any'], ['/'], ['/x/y'], ['/:id', 'one'], ['/x']]],
        expected: [null, null, null, 'root', 'any', null, 'one'],
        note: 'gốc `/` và `/*`',
      },
      {
        args: [['Router', 'add', 'add', 'match'], [[], ['/u/:id', 'first'], ['/u/:name', 'second'], ['/u/7']]],
        expected: [null, null, null, 'second'],
        note: 'cùng hình dạng (khác tên tham số) → mẫu sau ghi đè',
      },
    ],
    gen: (n, r) => {
      const big = n > 1000;
      const words = big ? bigWords : routerSegs;
      const total = Math.max(1, n);
      const ops = ['Router'];
      const args: any[][] = [[]];
      for (let i = 0; i < total; i++) {
        if (r.bool(big ? (i < total * 0.4 ? 1 : 0) : 0.4)) {
          ops.push('add');
          // mẫu dài hơn ở scale lớn để trie sâu hơn
          args.push([genPattern(r, words, big ? 5 : 3, big ? 0.1 : 0.25), 'h' + i]);
        } else {
          ops.push('match');
          const len = r.int(0, big ? 5 : 4);
          args.push([pathOf(Array.from({ length: len }, () => r.pick(words)))]);
        }
      }
      return [ops, args];
    },
    // ngây thơ thử lần lượt ~2·10⁴ mẫu cho mỗi request
    perf: { n: 1e5, limitMs: 700 },
  },
  '02': {
    sig: 'class FileSystem {\n  FileSystem()\n  List<String> ls(String path)\n  void mkdir(String path)\n  void addContentToFile(String filePath, String content)\n  String readContentFromFile(String filePath)\n}',
    title: 'File system trong bộ nhớ',
    ref: S.FileSystem,
    brute: NaiveFileSystem,
    cases: [
      {
        args: [
          ['FileSystem', 'ls', 'mkdir', 'addContentToFile', 'ls', 'readContentFromFile'],
          [[], ['/'], ['/a/b/c'], ['/a/b/c/d', 'hello'], ['/'], ['/a/b/c/d']],
        ],
        expected: [null, [], null, null, ['a'], 'hello'],
        note: 'ví dụ LeetCode 588',
      },
      {
        args: [
          ['FileSystem', 'mkdir', 'addContentToFile', 'addContentToFile', 'ls', 'ls', 'readContentFromFile'],
          [[], ['/d'], ['/d/f', 'ab'], ['/d/f', 'cd'], ['/d/f'], ['/d'], ['/d/f']],
        ],
        expected: [null, null, null, null, ['f'], ['f'], 'abcd'],
        note: 'ls trên tệp → [tên tệp]; nối nội dung',
      },
      {
        args: [
          ['FileSystem', 'addContentToFile', 'mkdir', 'addContentToFile', 'ls'],
          [[], ['/z/f10', '1'], ['/z/a'], ['/z/b9', '2'], ['/z']],
        ],
        expected: [null, null, null, null, ['a', 'b9', 'f10']],
        note: 'tạo thư mục cha ngầm; ls sắp xếp từ điển',
      },
    ],
    gen: (n, r) => {
      const big = n > 1000;
      const dirNames = Array.from({ length: big ? 40 : 3 }, (_, i) => 'd' + i);
      const fileNames = Array.from({ length: big ? 30 : 3 }, (_, i) => 'f' + i);
      const dirs = new Set<string>(['/']);
      const files = new Set<string>();
      const dirList = ['/']; // song song với Set để pick O(1)
      const fileList: string[] = [];
      const ops = ['FileSystem'];
      const args: any[][] = [[]];
      const total = Math.max(1, n);
      const chain = () => Array.from({ length: r.int(big ? 0 : 0, big ? 3 : 2) }, () => r.pick(dirNames));
      const addDirs = (segs: string[]) => {
        for (let i = 1; i <= segs.length; i++) {
          const d = pathOf(segs.slice(0, i));
          if (!dirs.has(d)) (dirs.add(d), dirList.push(d));
        }
      };
      for (let i = 0; i < total; i++) {
        const p = r.float();
        if (p < 0.2) {
          const c = chain();
          if (c.length === 0) c.push(r.pick(dirNames));
          addDirs(c);
          ops.push('mkdir');
          args.push([pathOf(c)]);
        } else if (p < 0.5 || files.size === 0) {
          const c = chain();
          addDirs(c);
          const f = pathOf([...c, r.pick(fileNames)]);
          if (!files.has(f)) (files.add(f), fileList.push(f));
          ops.push('addContentToFile');
          args.push([f, r.string(r.int(1, 3), 'ab')]);
        } else if (p < 0.65) {
          ops.push('readContentFromFile');
          args.push([r.pick(fileList)]);
        } else {
          ops.push('ls');
          args.push([r.pick(r.bool(0.8) ? dirList : fileList)]);
        }
      }
      return [ops, args];
    },
    // ngây thơ: ls quét phẳng toàn bộ đường dẫn
    perf: { n: 1e5, limitMs: 700 },
  },
};
