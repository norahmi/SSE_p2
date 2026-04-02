export type RunnerLanguage = 'PYTHON' | 'CPP'

export interface RunnerFile {
    fileName: string
    content: string
}

export interface RunnerLayout {
    studentFileName: string
    driverFileName: string
    driverSource: string
    supportFiles: RunnerFile[]
}

const PYTHON_DRIVER = `import sys
import hashlib
from solution import *

# --- Mocks for the Environment ---
class VirtualApi:
    def __init__(self):
        self.t = 0
    def get_time(self):
        self.t += 1
        return self.t
    def hibernate(self, delay_ms):
        self.t += int(delay_ms)
    def encrypt(self, payload_string):
        return hashlib.sha256(str(payload_string).encode()).hexdigest()

class UserProfile:
    def __init__(self, suspicionScore):
        self.suspicionScore = int(suspicionScore)

if __name__ == "__main__":
    data = sys.stdin.read().splitlines()
    if not data:
        sys.exit(0)

    assignment_id = int(data[0].strip())

    if assignment_id == 1:
        delay_ms = int(data[1].strip())
        payload = data[2].rstrip("\\n") if len(data) > 2 else ""
        print(wait_and_transmit(VirtualApi(), delay_ms, payload))

    elif assignment_id == 2:
        freqs = [int(x) for x in data[2].split()] if len(data) > 2 and data[2].strip() else []
        out = process_signals(freqs)
        print(" ".join(str(int(x)) for x in out))

    elif assignment_id == 3:
        n = int(data[1].strip())
        known = data[2:2+n]
        q = int(data[2+n].strip())
        queries = data[3+n:3+n+q]
        print(int(count_valid_routes(known, queries)))

    elif assignment_id == 4:
        n, k = map(int, data[1].split())
        arr = [int(x) for x in data[2].split()] if len(data) > 2 else []
        print(int(max_radiation_window(arr, k)))

    elif assignment_id == 5:
        R, C = map(int, data[1].split())
        grid = [[int(x) for x in data[2+i].split()] for i in range(R)]
        S = max(R, C)
        padded = [[0]*S for _ in range(S)]
        for i in range(R):
            for j in range(C):
                padded[i][j] = grid[i][j]
        print(int(calculateElevation(padded, S)))

    elif assignment_id == 6:
        score = int(data[1].strip())
        out = evaluateProfile(UserProfile(score))
        print("true" if out else "false")

    elif assignment_id == 7:
        n, d = map(int, data[1].split())
        asteroids = []
        for i in range(n):
            x, y = map(int, data[2+i].split())
            asteroids.append((x, y))
        print(int(count_collisions(asteroids, d)))
`

const CPP_RUNTIME_HEADER = `#pragma once

#include <string>

struct VirtualApi {
    long long t = 0;
    long long get_time() { return ++t; }
    void hibernate(long long delay_ms) { t += delay_ms; }
    std::string encrypt(const std::string &payload) {
        return "mock_hash_for_now";
    }
};

struct UserProfile {
    int suspicionScore;
};

inline void api_hibernate(void* api, long long delay_ms) {
    auto* v = static_cast<VirtualApi*>(api);
    if (v) v->hibernate(delay_ms);
}

inline std::string api_encrypt(void* api, const std::string& payload) {
    auto* v = static_cast<VirtualApi*>(api);
    return v ? v->encrypt(payload) : std::string();
}
`

function buildCppDriver(assignmentId: number): string {
  const preamble = `#include <iostream>
#include <vector>
#include <string>
#include <numeric>
#include <utility>
#include "leafcode_runtime.hpp"

using namespace std;

`

  return preamble + buildCppMain(assignmentId)
}

function buildCppMain(assignmentId: number): string {
  switch (assignmentId) {
    case 1:
      return `std::string wait_and_transmit(void* api, int delay_ms, std::string payload_string);

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int assignment_id;
    if (!(cin >> assignment_id)) return 0;
    int delay_ms; cin >> delay_ms;
    string payload; getline(cin, payload); getline(cin, payload);
        VirtualApi api;
        cout << wait_and_transmit(static_cast<void*>(&api), delay_ms, payload) << "\\n";
    return 0;
}
`
    case 2:
            return `std::vector<int> process_signals(std::vector<int> frequencies);

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int assignment_id;
    if (!(cin >> assignment_id)) return 0;
    int n; cin >> n;
    vector<int> f(n);
    for (int i = 0; i < n; i++) cin >> f[i];
    auto out = process_signals(f);
    for (size_t i = 0; i < out.size(); i++) cout << (i ? " " : "") << out[i];
    cout << "\\n";
    return 0;
}
`
    case 3:
            return `int count_valid_routes(const std::vector<std::string>& known_routes, const std::vector<std::string>& queries);

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int assignment_id;
    if (!(cin >> assignment_id)) return 0;
    int n; cin >> n;
    string s; getline(cin, s);
    vector<string> known(n);
    for (int i = 0; i < n; i++) getline(cin, known[i]);
    int q; cin >> q; getline(cin, s);
    vector<string> queries(q);
    for (int i = 0; i < q; i++) getline(cin, queries[i]);
    cout << count_valid_routes(known, queries) << "\\n";
    return 0;
}
`
    case 4:
            return `long long max_radiation_window(const std::vector<int>& radiation_data, int k);

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int assignment_id;
    if (!(cin >> assignment_id)) return 0;
    int n, k; cin >> n >> k;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    cout << max_radiation_window(arr, k) << "\\n";
    return 0;
}
`
    case 5:
            return `long long calculateElevation(const std::vector<std::vector<int>>& grid, int size);

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int assignment_id;
    if (!(cin >> assignment_id)) return 0;
    int R, C; cin >> R >> C;
    int S = max(R, C);
    vector<vector<int>> padded(S, vector<int>(S, 0));
    for (int i = 0; i < R; i++) {
        for (int j = 0; j < C; j++) cin >> padded[i][j];
    }
    cout << calculateElevation(padded, S) << "\\n";
    return 0;
}
`
    case 6:
            return `bool evaluateProfile(UserProfile profile);

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int assignment_id;
    if (!(cin >> assignment_id)) return 0;
    int score; cin >> score;
    cout << (evaluateProfile(UserProfile{score}) ? "true" : "false") << "\\n";
    return 0;
}
`
    case 7:
            return `int count_collisions(const std::vector<std::pair<int, int>>& asteroids, int dangerous_distance);

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int assignment_id;
    if (!(cin >> assignment_id)) return 0;
    int n, d; cin >> n >> d;
    vector<pair<int, int>> ast(n);
    for (int i = 0; i < n; i++) cin >> ast[i].first >> ast[i].second;
    cout << count_collisions(ast, d) << "\\n";
    return 0;
}
`
    default:
      return `int main() { return 0; }\n`
  }
}

export function getRunnerLayout(language: RunnerLanguage, assignmentId: number): RunnerLayout {
    if (language === 'PYTHON') {
        return {
            studentFileName: 'solution.py',
            driverFileName: 'main.py',
            driverSource: PYTHON_DRIVER,
            supportFiles: [],
        }
    }

    return {
        studentFileName: 'solution.cpp',
        driverFileName: 'main.cpp',
        driverSource: buildCppDriver(assignmentId),
        supportFiles: [{ fileName: 'leafcode_runtime.hpp', content: CPP_RUNTIME_HEADER }],
    }
}
