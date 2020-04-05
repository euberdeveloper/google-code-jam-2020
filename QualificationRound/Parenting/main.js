function getTests(input) {
    const rows = input.split('\n');
    const T = +rows.shift();
    const tests = [];

    for (let i = 0; i < T; i++) {
        const n = +rows.shift();
        const intervals = [];

        for (let j = 0; j < n; j++) {
            const interval = rows
                .shift()
                .split(' ')
                .map(v => +v);
            intervals.push({ interval, index: j, value: null });
        }

        tests.push(intervals);
    }

    return tests;
}

function solveTest(test, index) {
    class State {
        getValue() {
            return this._value ? 'C' : 'J';
        }
        toggle() {
            this._value = !this._value;
        }

        constructor() {
            this._value = true;
        }
    }
    const state = new State();

    test.sort((x, y) => x.interval[0] - y.interval[0]);

    for (let i = 0; i < test.length; i++) {
        test[i].value = state.getValue();
        const [start, end] = test[i].interval;

        let e = start, keepValue = true;
        state.toggle();
        for (let j = i + 1; j < test.length && test[j].interval[0] < end; j++) {
            if (test[j].interval[0] < e) {
                return `Case #${index + 1}: IMPOSSIBLE`;
            }

            if (test[j].interval[1] < end) {
                test[j].value = state.getValue();
                i++;
            }
            else {
                keepValue = false;
            }

            e = test[j].interval[1];
        }

        if (keepValue) {
            state.toggle();
        }
    }

    const result = test
        .sort((x, y) => x.index - y.index)
        .map(v => v.value)
        .join('');

    return `Case #${index + 1}: ${result}`;
}

const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8');
const tests = getTests(input);
console.log(tests.map((test, i) => solveTest(test, i)).join('\n'));