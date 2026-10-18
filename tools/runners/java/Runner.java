import java.io.*;
import java.lang.reflect.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;

/**
 * Runner Java: chạy bài làm theo bộ test JSON, in kết quả từng test (JSON lines).
 * Được gọi từ tools/check.ts và tools/bench.ts:  java -cp <answer>;<lib> Runner input.json
 * Bài dạng hàm: class Solution { public R tenHam(...) }. Bài dạng class: class <TênClass> { ... }.
 */
public class Runner {
    static final String TODO = "Chưa làm";
    static PrintStream out;

    // ───────── kiểu ─────────
    static final class T {
        final String k; // prim | arr | list | node | void
        final String name;
        final T of;
        T(String k, String name, T of) { this.k = k; this.name = name; this.of = of; }
    }

    static T parseType(String s) {
        s = s.trim();
        if (s.endsWith("[]")) return new T("arr", null, parseType(s.substring(0, s.length() - 2)));
        if (s.startsWith("List<") && s.endsWith(">")) return new T("list", null, parseType(s.substring(5, s.length() - 1)));
        if (s.equals("ListNode") || s.equals("TreeNode")) return new T("node", s, null);
        if (s.equals("void")) return new T("void", null, null);
        return new T("prim", s, null);
    }

    static Class<?> classOf(T t) {
        switch (t.k) {
            case "arr": return Array.newInstance(classOf(t.of), 0).getClass();
            case "list": return List.class;
            case "node": return t.name.equals("ListNode") ? ListNode.class : TreeNode.class;
            case "void": return void.class;
            default:
                switch (t.name) {
                    case "int": return int.class;
                    case "long": return long.class;
                    case "short": return short.class;
                    case "double": return double.class;
                    case "float": return float.class;
                    case "boolean": return boolean.class;
                    case "char": return char.class;
                    case "String": return String.class;
                    case "Integer": return Integer.class;
                    case "Long": return Long.class;
                    case "Double": return Double.class;
                    case "Boolean": return Boolean.class;
                    case "Character": return Character.class;
                    default: throw new IllegalArgumentException("kiểu không hỗ trợ: " + t.name);
                }
        }
    }

    // ───────── JSON → giá trị Java ─────────
    @SuppressWarnings("unchecked")
    static Object fromPlain(Object v, T t) {
        if (v == null) return null;
        switch (t.k) {
            case "node":
                if (t.name.equals("ListNode")) {
                    if (v instanceof Map) {
                        Map<String, Object> m = (Map<String, Object>) v;
                        return buildCycle((List<Object>) m.get("vals"), ((Number) m.get("pos")).intValue());
                    }
                    return buildList((List<Object>) v);
                }
                return buildTree((List<Object>) v);
            case "arr": {
                List<Object> l = (List<Object>) v;
                int n = l.size();
                if (t.of.k.equals("prim")) {
                    switch (t.of.name) {
                        case "int": { int[] a = new int[n]; for (int i = 0; i < n; i++) a[i] = ((Number) l.get(i)).intValue(); return a; }
                        case "long": { long[] a = new long[n]; for (int i = 0; i < n; i++) a[i] = ((Number) l.get(i)).longValue(); return a; }
                        case "double": { double[] a = new double[n]; for (int i = 0; i < n; i++) a[i] = ((Number) l.get(i)).doubleValue(); return a; }
                        case "boolean": { boolean[] a = new boolean[n]; for (int i = 0; i < n; i++) a[i] = (Boolean) l.get(i); return a; }
                        case "char": { char[] a = new char[n]; for (int i = 0; i < n; i++) a[i] = ((String) l.get(i)).charAt(0); return a; }
                        default: break;
                    }
                }
                Object a = Array.newInstance(classOf(t.of), n);
                for (int i = 0; i < n; i++) Array.set(a, i, fromPlain(l.get(i), t.of));
                return a;
            }
            case "list": {
                List<Object> l = (List<Object>) v;
                List<Object> r = new ArrayList<>(l.size());
                for (Object x : l) r.add(fromPlain(x, t.of));
                return r;
            }
            default:
                switch (t.name) {
                    case "int": case "Integer": return ((Number) v).intValue();
                    case "long": case "Long": return ((Number) v).longValue();
                    case "short": return ((Number) v).shortValue();
                    case "double": case "Double": return ((Number) v).doubleValue();
                    case "float": return ((Number) v).floatValue();
                    case "char": case "Character": return ((String) v).charAt(0);
                    default: return v; // boolean, String
                }
        }
    }

    static ListNode buildList(List<Object> vals) {
        ListNode dummy = new ListNode(), tail = dummy;
        for (Object x : vals) { tail.next = new ListNode(((Number) x).intValue()); tail = tail.next; }
        return dummy.next;
    }

    static ListNode buildCycle(List<Object> vals, int pos) {
        ListNode head = buildList(vals);
        if (pos < 0 || head == null) return head;
        ListNode tail = head, target = null;
        for (int i = 0; ; i++) {
            if (i == pos) target = tail;
            if (tail.next == null) break;
            tail = tail.next;
        }
        tail.next = target;
        return head;
    }

    static TreeNode buildTree(List<Object> a) {
        if (a.isEmpty() || a.get(0) == null) return null;
        TreeNode root = new TreeNode(((Number) a.get(0)).intValue());
        ArrayDeque<TreeNode> q = new ArrayDeque<>();
        q.add(root);
        int i = 1;
        while (i < a.size()) {
            TreeNode node = q.poll();
            Object l = a.get(i++);
            if (l != null) { node.left = new TreeNode(((Number) l).intValue()); q.add(node.left); }
            if (i >= a.size()) break;
            Object r = a.get(i++);
            if (r != null) { node.right = new TreeNode(((Number) r).intValue()); q.add(node.right); }
        }
        return root;
    }

    // ───────── giá trị Java → JSON ─────────
    static Object toPlain(Object v, T t) {
        if (v == null) return t != null && t.k.equals("node") ? new ArrayList<>() : null; // list/cây rỗng ↔ []
        T inner = t != null && (t.k.equals("arr") || t.k.equals("list")) ? t.of : null;
        if (v instanceof ListNode h) {
            List<Object> r = new ArrayList<>();
            for (ListNode c = h; c != null; c = c.next) {
                r.add((long) c.val);
                if (r.size() > 10_000_000) throw new IllegalStateException("list có chu trình hoặc dài hơn 10^7 node");
            }
            return r;
        }
        if (v instanceof TreeNode root) {
            List<Object> r = new ArrayList<>();
            ArrayDeque<Object> q = new ArrayDeque<>();
            q.add(root);
            final Object NUL = new Object();
            while (!q.isEmpty()) {
                Object o = q.poll();
                if (o == NUL) { r.add(null); continue; }
                TreeNode n = (TreeNode) o;
                r.add((long) n.val);
                q.add(n.left == null ? NUL : n.left);
                q.add(n.right == null ? NUL : n.right);
            }
            while (!r.isEmpty() && r.get(r.size() - 1) == null) r.remove(r.size() - 1);
            return r;
        }
        if (v instanceof int[] a) { List<Object> r = new ArrayList<>(a.length); for (int x : a) r.add((long) x); return r; }
        if (v.getClass().isArray()) {
            int n = Array.getLength(v);
            List<Object> r = new ArrayList<>(n);
            for (int i = 0; i < n; i++) r.add(toPlain(Array.get(v, i), inner));
            return r;
        }
        if (v instanceof Map<?, ?> m) {
            Map<String, Object> r = new LinkedHashMap<>();
            for (Map.Entry<?, ?> e : m.entrySet()) r.put(String.valueOf(e.getKey()), toPlain(e.getValue(), null));
            return r;
        }
        if (v instanceof Iterable<?> it) {
            List<Object> r = new ArrayList<>();
            for (Object x : it) r.add(toPlain(x, inner));
            return r;
        }
        if (v instanceof Character c) return String.valueOf(c);
        if (v instanceof Double d && d == 0.0) return 0.0;
        return v;
    }

    // ───────── lỗi ─────────
    static String errText(Throwable e) {
        String head = e instanceof StackOverflowError ? "StackOverflowError (đệ quy quá sâu)" : e.getClass().getSimpleName() + ": " + e.getMessage();
        for (StackTraceElement f : e.getStackTrace()) {
            String cls = f.getClassName();
            if (!cls.equals("Runner") && !cls.startsWith("java.") && !cls.startsWith("jdk.") && !cls.startsWith("sun.") && f.getFileName() != null) {
                head += "\n           tại " + f.getFileName() + ":" + f.getLineNumber() + " (" + f.getMethodName() + ")";
                break;
            }
        }
        return head;
    }

    static Method findMethod(Class<?> c, String name, int n) {
        for (Method m : c.getDeclaredMethods()) if (m.getName().equals(name) && m.getParameterCount() == n) { m.setAccessible(true); return m; }
        throw new IllegalStateException("class " + c.getSimpleName() + " chưa có method " + name + "(" + n + " tham số)");
    }

    static Constructor<?> findCtor(Class<?> c, int n) {
        for (Constructor<?> k : c.getDeclaredConstructors()) if (k.getParameterCount() == n) { k.setAccessible(true); return k; }
        throw new IllegalStateException("class " + c.getSimpleName() + " chưa có constructor " + n + " tham số");
    }

    static void emit(Map<String, Object> m) { out.println(Json.write(m)); out.flush(); }

    static Map<String, Object> line(Object... kv) {
        Map<String, Object> m = new LinkedHashMap<>();
        for (int i = 0; i < kv.length; i += 2) m.put((String) kv[i], kv[i + 1]);
        return m;
    }

    @SuppressWarnings("unchecked")
    public static void main(String[] argv) throws Exception {
        out = new PrintStream(new FileOutputStream(FileDescriptor.out), true, StandardCharsets.UTF_8);
        Map<String, Object> data = (Map<String, Object>) Json.parse(Files.readString(Path.of(argv[0]), StandardCharsets.UTF_8));
        Map<String, Object> sig = (Map<String, Object>) data.get("sig");
        boolean needArgs = Boolean.TRUE.equals(data.get("needArgs"));
        List<Object> tests = (List<Object>) data.get("tests");
        boolean isClass = "class".equals(sig.get("kind"));
        String clsName = isClass ? (String) sig.get("name") : "Solution";
        Class<?> cls;
        try {
            cls = Class.forName(clsName);
        } catch (ClassNotFoundException e) {
            emit(line("fatal", "chưa có class " + clsName));
            return;
        }

        Method fn = null;
        List<T> ptypes = new ArrayList<>();
        T rtype = null;
        Map<String, T> mret = new HashMap<>();
        List<T> ctorTypes = new ArrayList<>();
        Map<String, List<T>> mtypes = new HashMap<>();
        Object instance = null;
        try {
            if (!isClass) {
                Map<String, Object> f = (Map<String, Object>) sig.get("fn");
                for (Object p : (List<Object>) f.get("params")) ptypes.add(parseType((String) p));
                rtype = parseType((String) f.get("ret"));
                fn = findMethod(cls, (String) f.get("name"), ptypes.size());
                if (!Modifier.isStatic(fn.getModifiers())) instance = findCtor(cls, 0).newInstance();
            } else {
                for (Object p : (List<Object>) sig.get("ctor")) ctorTypes.add(parseType((String) p));
                for (Map.Entry<String, Object> e : ((Map<String, Object>) sig.get("methods")).entrySet()) {
                    List<T> ts = new ArrayList<>();
                    for (Object p : (List<Object>) ((Map<String, Object>) e.getValue()).get("params")) ts.add(parseType((String) p));
                    mtypes.put(e.getKey(), ts);
                    mret.put(e.getKey(), parseType((String) ((Map<String, Object>) e.getValue()).get("ret")));
                }
            }
        } catch (Throwable e) {
            Throwable c = e instanceof InvocationTargetException ? e.getCause() : e;
            emit(line("fatal", errText(c)));
            return;
        }

        Map<String, Method> mcache = new HashMap<>();
        for (int i = 0; i < tests.size(); i++) {
            Map<String, Object> t = (Map<String, Object>) tests.get(i);
            List<Object> args = (List<Object>) t.get("args");
            int repeat = t.containsKey("repeat") ? ((Number) t.get("repeat")).intValue() : 1;
            double[] times = new double[repeat];
            Object ret = null;
            Object[] real = null;
            try {
                for (int r = 0; r < repeat; r++) {
                    if (!isClass) {
                        real = new Object[args.size()];
                        for (int j = 0; j < real.length; j++) real[j] = fromPlain(args.get(j), ptypes.get(j));
                        long t0 = System.nanoTime();
                        ret = fn.invoke(instance, real);
                        times[r] = (System.nanoTime() - t0) / 1e6;
                    } else {
                        List<Object> ops = (List<Object>) args.get(0);
                        List<Object> opArgs = (List<Object>) args.get(1);
                        Object[][] conv = new Object[ops.size()][];
                        for (int k = 0; k < ops.size(); k++) {
                            List<Object> a = (List<Object>) opArgs.get(k);
                            List<T> ts = k == 0 ? ctorTypes : mtypes.get((String) ops.get(k));
                            conv[k] = new Object[a.size()];
                            for (int j = 0; j < a.size(); j++) conv[k][j] = fromPlain(a.get(j), ts.get(j));
                        }
                        Method[] ms = new Method[ops.size()];
                        for (int k = 1; k < ops.size(); k++) {
                            String op = (String) ops.get(k);
                            String key = op + "/" + conv[k].length;
                            ms[k] = mcache.get(key);
                            if (ms[k] == null) { ms[k] = findMethod(cls, op, conv[k].length); mcache.put(key, ms[k]); }
                        }
                        Constructor<?> ctor = findCtor(cls, conv[0].length);
                        List<Object> res = new ArrayList<>(ops.size());
                        long t0 = System.nanoTime();
                        Object obj = ctor.newInstance(conv[0]);
                        res.add(null);
                        for (int k = 1; k < ops.size(); k++) res.add(ms[k].invoke(obj, conv[k]));
                        times[r] = (System.nanoTime() - t0) / 1e6;
                        List<Object> plain = new ArrayList<>(res.size());
                        plain.add(null);
                        for (int k = 1; k < res.size(); k++) plain.add(toPlain(res.get(k), mret.get((String) ops.get(k))));
                        ret = plain;
                    }
                }
                Map<String, Object> m = line("i", (long) i, "ok", true, "ret", isClass ? ret : toPlain(ret, rtype));
                if (needArgs && !isClass) {
                    List<Object> pa = new ArrayList<>();
                    for (int j = 0; j < real.length; j++) pa.add(toPlain(real[j], ptypes.get(j)));
                    m.put("args", pa);
                }
                if (Boolean.TRUE.equals(t.get("time"))) {
                    Arrays.sort(times);
                    m.put("ms", times[(repeat - 1) / 2]);
                }
                emit(m);
            } catch (Throwable e) {
                Throwable c = e instanceof InvocationTargetException ? e.getCause() : e;
                boolean todo = c instanceof UnsupportedOperationException && TODO.equals(c.getMessage());
                emit(line("i", (long) i, "ok", false, "todo", todo, "err", errText(c)));
                return;
            }
        }
        emit(line("done", true));
    }
}
