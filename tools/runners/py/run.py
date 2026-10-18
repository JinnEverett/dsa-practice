"""Runner Python: chạy bài làm theo bộ test JSON, in kết quả từng test (JSON lines).
Được gọi từ tools/check.ts và tools/bench.ts:  python run.py <answer.py> <input.json>
"""
from __future__ import annotations

import importlib.util
import json
import math
import re
import sys
import threading
import time
import traceback
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from dsa import ListNode, TreeNode, build_cycle_list, build_list, build_tree, list_to_array, tree_to_array  # noqa: E402

TODO = "Chưa làm"


def snake(name: str) -> str:
    s = re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", name)
    s = re.sub(r"([A-Z])([A-Z][a-z])", r"\1_\2", s)
    return s.lower()


def parse_type(s: str):
    s = s.strip()
    if s.endswith("[]"):
        return ("arr", parse_type(s[:-2]))
    if s.startswith("List<") and s.endswith(">"):
        return ("list", parse_type(s[5:-1]))
    if s in ("ListNode", "TreeNode"):
        return ("node", s)
    if s == "void":
        return ("void",)
    return ("prim", s)


def from_plain(v, t):
    if v is None:
        return None
    k = t[0]
    if k == "node":
        if t[1] == "ListNode":
            return build_list(v) if isinstance(v, list) else build_cycle_list(v["vals"], v["pos"])
        return build_tree(v)
    if k in ("arr", "list"):
        return [from_plain(x, t[1]) for x in v]
    if k == "prim" and t[1] in ("double", "float", "Double"):
        return float(v)
    return v


def to_plain(v, t=None):
    if v is None:
        return [] if t is not None and t[0] == "node" else None  # list/cây rỗng ↔ []
    if isinstance(v, (bool, str)):
        return v
    if isinstance(v, int):
        return v
    if isinstance(v, float):
        if math.isnan(v) or math.isinf(v):
            return None
        return 0 if v == 0 else v
    name = type(v).__name__
    if name == "ListNode":
        return list_to_array(v)
    if name == "TreeNode":
        return tree_to_array(v)
    if isinstance(v, dict):
        return {str(k): to_plain(x) for k, x in v.items()}
    inner = t[1] if t is not None and t[0] in ("arr", "list") else None
    try:
        return [to_plain(x, inner) for x in v]
    except TypeError:
        return str(v)


def err_text(e: BaseException, answer: str) -> str:
    if isinstance(e, RecursionError):
        head = "RecursionError: đệ quy quá sâu"
    else:
        head = f"{type(e).__name__}: {e}"
    frames = [f for f in traceback.extract_tb(e.__traceback__) if f.filename and Path(f.filename).resolve() == Path(answer).resolve()]
    if frames:
        f = frames[-1]
        head += f"\n           tại {Path(f.filename).name}:{f.lineno} · {f.line}"
    return head


def main() -> None:
    answer, input_file = sys.argv[1], sys.argv[2]
    data = json.loads(Path(input_file).read_text(encoding="utf-8"))
    sig, need_args, tests = data["sig"], data["needArgs"], data["tests"]
    out = sys.stdout

    def emit(obj) -> None:
        out.write(json.dumps(obj, ensure_ascii=False) + "\n")
        out.flush()

    try:
        spec = importlib.util.spec_from_file_location("answer", answer)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
    except Exception as e:  # lỗi cú pháp / import
        emit({"fatal": err_text(e, answer) if not isinstance(e, SyntaxError) else f"SyntaxError: {e}"})
        return

    def pick(obj, name: str):
        f = getattr(obj, snake(name), None) or getattr(obj, name, None)
        if f is None:
            raise AttributeError(f"không tìm thấy `{snake(name)}`")
        return f

    if sig["kind"] == "function":
        try:
            fn = pick(mod, sig["name"])
        except AttributeError as e:
            emit({"fatal": f"{Path(answer).name} {e}"})
            return
        ptypes = [parse_type(p) for p in sig["fn"]["params"]]
        rtype = parse_type(sig["fn"]["ret"])

        def run_one(args):
            real = [from_plain(v, ptypes[i]) for i, v in enumerate(args)]
            return real, (lambda: fn(*real))
    else:
        cls = getattr(mod, sig["name"], None)
        if cls is None:
            emit({"fatal": f"{Path(answer).name} chưa có class `{sig['name']}`"})
            return
        ctor_t = [parse_type(p) for p in sig["ctor"]]
        mtypes = {name: [parse_type(p) for p in m["params"]] for name, m in sig["methods"].items()}
        mret = {name: parse_type(m["ret"]) for name, m in sig["methods"].items()}

        def run_one(args):
            ops, op_args = args
            conv = [[from_plain(v, ctor_t[j]) for j, v in enumerate(op_args[0])]]
            for i in range(1, len(ops)):
                conv.append([from_plain(v, mtypes[ops[i]][j]) for j, v in enumerate(op_args[i])])

            def go():
                obj = cls(*conv[0])
                res = [None]
                for i in range(1, len(ops)):
                    res.append(pick(obj, ops[i])(*conv[i]))
                return res

            return conv, go

    for i, t in enumerate(tests):
        try:
            repeat = t.get("repeat", 1)
            times = []
            ret = real = None
            for _ in range(repeat):
                real, call = run_one(t["args"])
                t0 = time.perf_counter()
                ret = call()
                times.append((time.perf_counter() - t0) * 1000)
            if sig["kind"] == "function":
                line = {"i": i, "ok": True, "ret": to_plain(ret, rtype)}
                if need_args:
                    line["args"] = [to_plain(x, ptypes[j]) for j, x in enumerate(real)]
            else:
                ops = t["args"][0]
                line = {"i": i, "ok": True, "ret": [None] + [to_plain(v, mret[ops[k]]) for k, v in enumerate(ret) if k > 0]}
            if t.get("time"):
                times.sort()
                line["ms"] = times[(len(times) - 1) // 2]
            emit(line)
        except NotImplementedError as e:
            emit({"i": i, "ok": False, "todo": TODO in str(e), "err": err_text(e, answer)})
            return
        except BaseException as e:  # noqa: BLE001
            emit({"i": i, "ok": False, "err": err_text(e, answer)})
            return
    emit({"done": True})


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    # Giới hạn đệ quy ~ tương đương JS (≈10⁴ tầng) để bài học về stack overflow công bằng giữa các ngôn ngữ.
    sys.setrecursionlimit(12_000)
    threading.stack_size(64 * 1024 * 1024)
    th = threading.Thread(target=main)
    th.start()
    th.join()
