function getTests(input) {
    const rows = input.split('\n');
    const n = +rows.shift();
    return rows
        .slice(0, n)
        .map(row => row
            .split('')
            .map(v => +v)
        );
}

function solveTest(test, i) {
    let result = '';
    let depth = 0;
    
    for (let i = 0; i < test.length; i++) {
        const n = test[i];

        while (depth < n) {
            result += '(';
            depth++;
        }
        while (depth > n) {
            result += ')';
            depth--;
        }
        result += n;
    }
    
    while (depth > 0) {
        result += ')';
        depth--;
    }

    return `Case #${i + 1}: ${result}`;
}

const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8');
const tests = getTests(input);
console.log(tests.map((test, i) => solveTest(test, i)).join('\n'));