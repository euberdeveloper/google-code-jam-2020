function readInput(input) {
    const result = {};
    
    const rows = input.split('\n');
    const T = +rows.shift();
    let tests = [];

    for (let i = 0; i < T; i++) {
        const n = +rows.shift();
        const matrix = [];
        
        for (let j = 0; j < n; j++) {
            const row = rows
                .shift()
                .split(' ')
                .map(v => +v);
            matrix.push(row);
        }
        
        tests.push({ n, matrix, index: i + 1 })
    }
    
    return tests;
}

function getTrace({ matrix, n }) {
    let sum = 0;
    
    for (let i = 0; i < n; i++) {
        sum += matrix[i][i];
    }
    
    return sum;
}

function rowsRepeated({ matrix, n }) {
    let count = 0;
    
    for (let i = 0; i < n; i++) {
        let values = new Set();
        for (let j = 0; j < n; j++) {
            if (values.has(matrix[i][j])) {
                count++;
                break;
            }
            values.add(matrix[i][j]);
        }
    }
    
    return count;
}

function colsRepeated({ matrix, n }) {
    let count = 0;
    
    for (let i = 0; i < n; i++) {
        let values = new Set();
        for (let j = 0; j < n; j++) {
            if (values.has(matrix[j][i])) {
                count++;
                break;
            }
            values.add(matrix[j][i]);
        }
    }
    
    return count;
}

function handleTest(test) {
    const x = test.index;
    const k = getTrace(test);
    const r = rowsRepeated(test);
    const c = colsRepeated(test);
    
    return `Case #${x}: ${k} ${r} ${c}`;
}

const fs = require('fs');
const input = fs.readFileSync(0, 'utf8');
const tests = readInput(input);
console.log(tests.map(test => handleTest(test)).join('\n'));