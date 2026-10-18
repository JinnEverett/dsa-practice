import java.util.*;

// Bug 02 · sắp từ theo tần suất. Code CÓ LỖI.
class Solution {
    public List<String> sortByFrequency(String[] words) {
        Map<String, Integer> cnt = new HashMap<>();
        for (String w : words) cnt.merge(w, 1, Integer::sum);
        List<String> keys = new ArrayList<>(cnt.keySet());
        keys.sort((a, b) -> cnt.get(b) - cnt.get(a));
        return keys;
    }
}
