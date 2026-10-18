import type { Spec } from '../../tools/spec.ts';
import { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

/**
 * Ngây thơ, hiển nhiên đúng, dùng cho cả ex01 (tập con) và ex02:
 * thứ tự LRU là một mảng khóa (đầu = cũ nhất), mọi lệnh tìm bằng quét, zset sắp lại mỗi lần, setTime quét mọi khóa để xóa key hết hạn.
 */
type NEntry = { kind: 'string' | 'list' | 'zset'; str: string; list: string[]; z: [number, string][]; exp: number };
const zsort = (z: [number, string][]) =>
  z.sort((a, b) => (a[0] !== b[0] ? (a[0] < b[0] ? -1 : 1) : a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0));
/** Các chỉ số được chọn bởi (start, stop) kiểu Redis, viết lại bằng vòng lặp để độc lập với bản chuẩn hóa trong solutions. */
const picked = (start: number, stop: number, len: number): number[] => {
  const s = start < 0 ? Math.max(0, len + start) : start;
  const t = Math.min(stop < 0 ? len + stop : stop, len - 1);
  const out: number[] = [];
  for (let i = s; i <= t; i++) if (i >= 0 && i < len) out.push(i);
  return out;
};
class NaiveRedis {
  max: number;
  now = 0;
  order: string[] = [];
  data = new Map<string, NEntry>();
  constructor(max: number) {
    this.max = max;
  }
  private drop(k: string) {
    this.data.delete(k);
    this.order.splice(this.order.indexOf(k), 1);
  }
  private touch(k: string) {
    this.order.splice(this.order.indexOf(k), 1);
    this.order.push(k);
  }
  private create(k: string, kind: NEntry['kind']): NEntry {
    if (this.data.size >= this.max) this.drop(this.order[0]);
    const e: NEntry = { kind, str: '', list: [], z: [], exp: Infinity };
    this.data.set(k, e);
    this.order.push(k);
    return e;
  }
  setTime(t: number) {
    this.now = t;
    for (const k of [...this.order]) if (this.data.get(k)!.exp <= t) this.drop(k);
  }
  set(k: string, v: string) {
    const e = this.data.get(k);
    if (e) {
      this.touch(k);
      Object.assign(e, { kind: 'string', str: v, list: [], z: [], exp: Infinity });
    } else this.create(k, 'string').str = v;
  }
  get(k: string) {
    const e = this.data.get(k);
    if (!e) return null;
    this.touch(k);
    return e.kind === 'string' ? e.str : null;
  }
  delete(k: string) {
    if (!this.data.has(k)) return false;
    this.drop(k);
    return true;
  }
  expire(k: string, ttl: number) {
    const e = this.data.get(k);
    if (!e) return false;
    this.touch(k);
    if (ttl <= 0) this.drop(k);
    else e.exp = this.now + ttl;
    return true;
  }
  ttl(k: string) {
    const e = this.data.get(k);
    if (!e) return -2;
    return e.exp === Infinity ? -1 : e.exp - this.now;
  }
  type(k: string) {
    return this.data.get(k)?.kind ?? 'none';
  }
  size() {
    return this.data.size;
  }
  private pushList(k: string, v: string, front: boolean) {
    let e = this.data.get(k);
    if (e) {
      this.touch(k);
      if (e.kind !== 'list') return -1;
    } else e = this.create(k, 'list');
    if (front) e.list.unshift(v);
    else e.list.push(v);
    return e.list.length;
  }
  lpush(k: string, v: string) {
    return this.pushList(k, v, true);
  }
  rpush(k: string, v: string) {
    return this.pushList(k, v, false);
  }
  private popList(k: string, front: boolean) {
    const e = this.data.get(k);
    if (!e) return null;
    this.touch(k);
    if (e.kind !== 'list') return null;
    const v = front ? e.list.shift()! : e.list.pop()!;
    if (e.list.length === 0) this.drop(k);
    return v;
  }
  lpop(k: string) {
    return this.popList(k, true);
  }
  rpop(k: string) {
    return this.popList(k, false);
  }
  lrange(k: string, a: number, b: number) {
    const e = this.data.get(k);
    if (!e) return [];
    this.touch(k);
    if (e.kind !== 'list') return [];
    return picked(a, b, e.list.length).map((i) => e.list[i]);
  }
  zadd(k: string, score: number, m: string) {
    let e = this.data.get(k);
    if (e) {
      this.touch(k);
      if (e.kind !== 'zset') return -1;
    } else e = this.create(k, 'zset');
    const cur = e.z.find((x) => x[1] === m);
    if (cur) {
      cur[0] = score;
      zsort(e.z);
      return 0;
    }
    e.z.push([score, m]);
    zsort(e.z);
    return 1;
  }
  zrem(k: string, m: string) {
    const e = this.data.get(k);
    if (!e) return false;
    this.touch(k);
    if (e.kind !== 'zset') return false;
    const i = e.z.findIndex((x) => x[1] === m);
    if (i < 0) return false;
    e.z.splice(i, 1);
    if (e.z.length === 0) this.drop(k);
    return true;
  }
  zrange(k: string, a: number, b: number) {
    const e = this.data.get(k);
    if (!e) return [];
    this.touch(k);
    if (e.kind !== 'zset') return [];
    return picked(a, b, e.z.length).map((i) => e.z[i][1]);
  }
  zrank(k: string, m: string) {
    const e = this.data.get(k);
    if (!e) return -1;
    this.touch(k);
    if (e.kind !== 'zset') return -1;
    return e.z.findIndex((x) => x[1] === m);
  }
  zscore(k: string, m: string) {
    const e = this.data.get(k);
    if (!e) return null;
    this.touch(k);
    if (e.kind !== 'zset') return null;
    return e.z.find((x) => x[1] === m)?.[0] ?? null;
  }
}

/** Sinh chuỗi lệnh. `full` = có list/zset/type (ex02); không thì chỉ chuỗi + TTL + LRU (ex01). */
const genRedis = (cls: string, full: boolean) => (n: number, r: Rng) => {
  const big = n > 1000;
  const mid = !big && n > 100; // cỡ vừa: nhiều khóa hơn maxKeys ⇒ evict liên tục ở quy mô vài chục khóa
  const keys = big ? Array.from({ length: 30000 }, (_, i) => 'k' + i) : mid ? Array.from({ length: 80 }, (_, i) => 'k' + i) : ['a', 'b', 'c', 'd'];
  const members = big ? Array.from({ length: 200 }, (_, i) => 'm' + i) : mid ? Array.from({ length: 40 }, (_, i) => 'm' + i) : ['m0', 'm1', 'm2', 'm3'];
  const max = big ? 20000 : mid ? 40 : r.int(1, 3);
  const total = Math.max(1, n);
  const ops = [cls];
  const args: any[][] = [[max]];
  const push = (op: string, a: any[]) => (ops.push(op), args.push(a));
  const key = () => r.pick(keys);
  const val = () => r.string(r.int(1, 3), 'xyz');
  const idx = () => r.int(-5, 5);
  for (let i = 0; i < total; i++) {
    const p = full ? r.float() : r.float() * 0.46; // ex01: chỉ dùng phần lệnh chuỗi/TTL/size
    if (p < 0.08) push('setTime', [0]); // giá trị thật được gán lại tăng dần ở cuối
    else if (p < 0.2) push('set', [key(), val()]);
    else if (p < 0.3) push('get', [key()]);
    else if (p < 0.34) push('delete', [key()]);
    else if (p < 0.4) push('expire', [key(), big ? r.int(1, 200) : mid ? r.int(1, 30) : r.int(-1, 8)]);
    else if (p < 0.43) push('ttl', [key()]);
    else if (!full) push('size', []);
    else if (p < 0.46) push('type', [key()]);
    else if (p < 0.5) push('size', []);
    else if (p < 0.56) push('lpush', [key(), val()]);
    else if (p < 0.62) push('rpush', [key(), val()]);
    else if (p < 0.66) push('lpop', [key()]);
    else if (p < 0.7) push('rpop', [key()]);
    else if (p < 0.75) push('lrange', [key(), idx(), idx()]);
    else if (p < 0.83) push('zadd', [key(), big ? r.int(-1e6, 1e6) : mid ? r.int(-20, 20) : r.int(-3, 3), r.pick(members)]);
    else if (p < 0.86) push('zrem', [key(), r.pick(members)]);
    else if (p < 0.91) push('zrange', [key(), idx(), idx()]);
    else if (p < 0.96) push('zrank', [key(), r.pick(members)]);
    else push('zscore', [key(), r.pick(members)]);
  }
  // setTime phải không giảm: gán lại các giá trị tăng dần
  let now = 0;
  for (let i = 1; i < ops.length; i++) if (ops[i] === 'setTime') args[i] = [(now += r.int(0, big || mid ? 3 : 4))];
  return [ops, args];
};

/** Một zset 3 000 member với điểm ngẫu nhiên: chạm nhiều tầng skip list, rồi cập nhật/xóa và hỏi hạng. */
const bigZset = () => {
  const r = new Rng(21);
  const ops = ['MiniRedis'];
  const args: any[][] = [[10]];
  const N = 3000;
  for (let i = 0; i < N; i++) (ops.push('zadd'), args.push(['z', r.int(-500, 500), 'm' + i]));
  for (let i = 0; i < 1500; i++) {
    const m = 'm' + r.int(0, N - 1);
    const p = r.float();
    if (p < 0.4) (ops.push('zadd'), args.push(['z', r.int(-500, 500), m]));
    else if (p < 0.6) (ops.push('zrem'), args.push(['z', m]));
    else if (p < 0.85) (ops.push('zrank'), args.push(['z', m]));
    else (ops.push('zrange'), args.push(['z', r.int(-3100, 3100), r.int(-3100, 3100)]));
  }
  ops.push('zrange');
  args.push(['z', 0, -1]);
  return [ops, args];
};

/**
 * Heap hết hạn tích xác chết (TTL bị xóa bởi `set`) rồi phải dựng lại ngay khi đặt TTL mới cho `z`; sau đó:
 * `z` hết hạn đúng hạn, còn các key đã bị `set` ghi đè (mất TTL) sống mãi — xác chết không được "hồi sinh" hay xóa nhầm.
 */
const expireChurn = (cls: string) => {
  const ops = [cls];
  const args: any[][] = [[40]];
  for (let i = 0; i < 30; i++) (ops.push('set', 'expire'), args.push(['k' + i, 'v'], ['k' + i, 100]));
  for (let i = 0; i < 30; i++) (ops.push('set'), args.push(['k' + i, 'w']));
  ops.push('set', 'expire', 'ttl', 'setTime', 'get', 'get', 'setTime', 'get', 'size');
  args.push(['z', 'x'], ['z', 10], ['z'], [10], ['z'], ['k0'], [1000], ['k29'], []);
  // đặt lại TTL của cùng một key nhiều lần
  for (let i = 0; i < 60; i++) (ops.push('expire'), args.push(['k5', 2000 + i]));
  ops.push('expire', 'ttl', 'setTime', 'get');
  args.push(['k5', 50], ['k5'], [1049], ['k5']);
  return [ops, args];
};

const SIG_KV =
  'class MiniKV {\n  MiniKV(int maxKeys)\n  void setTime(long now)\n  void set(String key, String value)\n  String get(String key)\n  boolean delete(String key)\n  boolean expire(String key, long ttlMs)\n  long ttl(String key)\n  int size()\n}';
const SIG_REDIS =
  'class MiniRedis {\n  MiniRedis(int maxKeys)\n  void setTime(long now)\n  void set(String key, String value)\n  String get(String key)\n  boolean delete(String key)\n  boolean expire(String key, long ttlMs)\n  long ttl(String key)\n  String type(String key)\n  int size()\n  int lpush(String key, String value)\n  int rpush(String key, String value)\n  String lpop(String key)\n  String rpop(String key)\n  List<String> lrange(String key, int start, int stop)\n  int zadd(String key, long score, String member)\n  boolean zrem(String key, String member)\n  List<String> zrange(String key, int start, int stop)\n  int zrank(String key, String member)\n  Long zscore(String key, String member)\n}';

export const specs: Record<string, Spec> = {
  '01': {
    sig: SIG_KV,
    title: 'MiniKV: chuỗi + TTL + LRU',
    ref: S.MiniKV,
    brute: NaiveRedis,
    cases: [
      {
        args: [
          ['MiniKV', 'set', 'ttl', 'expire', 'ttl', 'setTime', 'ttl', 'get', 'setTime', 'get', 'ttl', 'size'],
          [[5], ['a', '1'], ['a'], ['a', 100], ['a'], [40], ['a'], ['a'], [100], ['a'], ['a'], []],
        ],
        expected: [null, null, -1, true, 100, null, 60, '1', null, null, -2, 0],
        note: 'TTL: key hết hạn khi now ≥ expireAt',
      },
      {
        args: [
          ['MiniKV', 'set', 'set', 'get', 'set', 'get', 'get', 'get', 'size'],
          [[2], ['a', '1'], ['b', '2'], ['a'], ['c', '3'], ['b'], ['a'], ['c'], []],
        ],
        expected: [null, null, null, '1', null, null, '1', '3', 2],
        note: 'LRU: get a làm b thành cũ nhất → b bị evict',
      },
      {
        args: [
          ['MiniKV', 'set', 'set', 'ttl', 'set', 'get', 'get'],
          [[2], ['a', 'x'], ['b', 'y'], ['a'], ['c', 'z'], ['a'], ['b']],
        ],
        expected: [null, null, null, -1, null, null, 'y'],
        note: 'ttl() KHÔNG đẩy key lên mới dùng: a vẫn là cũ nhất và bị evict',
      },
      {
        args: [
          ['MiniKV', 'set', 'expire', 'set', 'setTime', 'set', 'get', 'size'],
          [[2], ['a', 'x'], ['a', 5], ['b', 'y'], [10], ['c', 'z'], ['b'], []],
        ],
        expected: [null, null, true, null, null, null, 'y', 2],
        note: 'key hết hạn không chiếm chỗ: tạo c không phải evict b',
      },
      {
        args: [
          ['MiniKV', 'set', 'expire', 'set', 'ttl', 'expire', 'get', 'delete', 'delete', 'expire'],
          [[3], ['k', 'v'], ['k', 50], ['k', 'w'], ['k'], ['k', 0], ['k'], ['k'], ['k'], ['k', 5]],
        ],
        expected: [null, null, true, null, -1, true, null, false, false, false],
        note: 'set xóa TTL; expire(≤ 0) xóa key; thao tác trên key lạ',
      },
      {
        args: [
          ['MiniKV', 'set', 'expire', 'expire', 'setTime', 'ttl', 'setTime', 'get'],
          [[3], ['a', 'x'], ['a', 10], ['a', 100], [50], ['a'], [100], ['a']],
        ],
        expected: [null, null, true, true, null, 50, null, null],
        note: 'expire lại đặt TTL mới (tính từ now) và vô hiệu hạn cũ',
      },
      { args: expireChurn('MiniKV'), note: 'đặt lại TTL 60 lần (heap hết hạn phải dựng lại) rồi vẫn hết hạn đúng hạn cuối' },
      { args: genRedis('MiniKV', false)(900, new Rng(5)), note: '900 lệnh, 80 khóa, maxKeys 40 (evict liên tục)' },
      { args: genRedis('MiniKV', false)(6000, new Rng(4)), note: '6 000 lệnh ngẫu nhiên' },
    ],
    gen: genRedis('MiniKV', false),
    // ngây thơ: setTime quét mọi khóa, LRU bằng mảng (indexOf/splice)
    perf: { n: 1e5, limitMs: 400 },
  },
  '02': {
    sig: SIG_REDIS,
    title: 'MiniRedis: chuỗi + list + sorted set + TTL + LRU',
    ref: S.MiniRedis,
    brute: NaiveRedis,
    cases: [
      {
        args: [
          ['MiniRedis', 'rpush', 'rpush', 'lpush', 'lrange', 'lrange', 'lrange', 'lrange', 'lpop', 'rpop', 'rpop', 'type', 'lpop'],
          [[5], ['l', 'a'], ['l', 'b'], ['l', 'z'], ['l', 0, -1], ['l', 1, 1], ['l', -2, -1], ['l', 5, 9], ['l'], ['l'], ['l'], ['l'], ['l']],
        ],
        expected: [null, 1, 2, 3, ['z', 'a', 'b'], ['a'], ['a', 'b'], [], 'z', 'b', 'a', 'none', null],
        note: 'list: lpush/rpush trả độ dài mới; pop hết thì key biến mất',
      },
      {
        args: [
          ['MiniRedis', 'zadd', 'zadd', 'zadd', 'zrange', 'zrank', 'zadd', 'zrange', 'zrank', 'zscore', 'zscore', 'zrem', 'zrem', 'zrange', 'zrem', 'zrem', 'type'],
          [[5], ['z', 5, 'b'], ['z', 5, 'a'], ['z', 1, 'c'], ['z', 0, -1], ['z', 'b'], ['z', 0, 'b'], ['z', 0, 1], ['z', 'b'], ['z', 'b'], ['z', 'q'], ['z', 'c'], ['z', 'c'], ['z', 0, -1], ['z', 'a'], ['z', 'b'], ['z']],
        ],
        expected: [null, 1, 1, 1, ['c', 'a', 'b'], 2, 0, ['b', 'c'], 0, 0, null, true, false, ['b', 'a'], true, true, 'none'],
        note: 'zset: thứ tự (điểm, member); zadd member có sẵn trả 0 và đổi điểm',
      },
      {
        args: [
          ['MiniRedis', 'set', 'lpush', 'zadd', 'lrange', 'lpop', 'get', 'rpush', 'get', 'zadd', 'zrank', 'type', 'set', 'type', 'lpop'],
          [[5], ['s', 'v'], ['s', 'x'], ['s', 1, 'm'], ['s', 0, -1], ['s'], ['s'], ['l', 'a'], ['l'], ['l', 1, 'm'], ['l', 'm'], ['l'], ['l', 'q'], ['l'], ['l']],
        ],
        expected: [null, null, -1, -1, [], null, 'v', 1, null, -1, -1, 'list', null, 'string', null],
        note: 'sai kiểu: không đổi dữ liệu, trả giá trị thất bại; set ghi đè mọi kiểu',
      },
      {
        args: [
          ['MiniRedis', 'rpush', 'zadd', 'lpop', 'size', 'rpush', 'type', 'size', 'zadd', 'type', 'type'],
          [[2], ['a', 'x'], ['b', 1, 'm'], ['a'], [], ['c', 'y'], ['b'], [], ['d', 2, 'n'], ['b'], ['c']],
        ],
        expected: [null, 1, 1, 'x', 1, 1, 'zset', 2, 1, 'none', 'list'],
        note: 'list rỗng bị xóa (trả lại chỗ); type() không đẩy LRU nên b là cũ nhất và bị evict',
      },
      {
        args: [
          ['MiniRedis', 'rpush', 'expire', 'setTime', 'ttl', 'lrange', 'setTime', 'type', 'lrange'],
          [[3], ['l', 'a'], ['l', 10], [5], ['l'], ['l', 0, -1], [10], ['l'], ['l', 0, -1]],
        ],
        expected: [null, 1, true, null, 5, ['a'], null, 'none', []],
        note: 'TTL áp dụng cho mọi kiểu',
      },
      {
        args: [
          ['MiniRedis', 'rpush', 'rpush', 'rpush', 'rpush', 'rpush', 'lrange', 'lrange', 'lrange', 'lrange', 'lrange'],
          [[2], ['l', 'a'], ['l', 'b'], ['l', 'c'], ['l', 'd'], ['l', 'e'], ['l', -100, 100], ['l', 3, 1], ['l', -1, -1], ['l', 2, -2], ['l', -2, 0]],
        ],
        expected: [null, 1, 2, 3, 4, 5, ['a', 'b', 'c', 'd', 'e'], [], ['e'], ['c', 'd'], []],
        note: 'chỉ số âm, vượt biên, start > stop',
      },
      {
        args: [
          ['MiniRedis', 'set', 'expire', 'set', 'setTime', 'get', 'ttl'],
          [[3], ['k', 'v'], ['k', 5], ['k', 'w'], [10], ['k'], ['k']],
        ],
        expected: [null, null, true, null, null, 'w', -1],
        note: 'set ghi đè xóa TTL cũ',
      },
      {
        args: [
          ['MiniRedis', 'rpush', 'expire', 'set', 'ttl', 'setTime', 'type'],
          [[3], ['l', 'a'], ['l', 5], ['l', 'q'], ['l'], [10], ['l']],
        ],
        expected: [null, 1, true, null, -1, null, 'string'],
        note: 'set đè lên list: đổi kiểu và xóa TTL',
      },
      { args: expireChurn('MiniRedis'), note: 'đặt lại TTL 60 lần rồi vẫn hết hạn đúng hạn cuối' },
      { args: bigZset(), note: 'một zset 3 000 member (skip list nhiều tầng)' },
      { args: genRedis('MiniRedis', true)(900, new Rng(9)), note: '900 lệnh, 80 khóa, maxKeys 40 (evict liên tục, mọi kiểu)' },
      { args: genRedis('MiniRedis', true)(6000, new Rng(8)), note: '6 000 lệnh ngẫu nhiên (khóa trong 30 000, maxKeys 20 000: chưa chạm giới hạn)' },
    ],
    gen: genRedis('MiniRedis', true),
    perf: { n: 1e5, limitMs: 600 },
  },
};
