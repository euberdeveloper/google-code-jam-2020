const readline = require('readline');
const rl = readline.createInterface(process.stdin, process.stdout);

const condition = {
    testCount: null,
    bytesCount: null,
    testIndex: -1,
    queryIndex: 0,
    byteIndex: null,
    fromLeft: null,
    assignedBytes: null,
    recoverIndex: null,
    recoverOptions: null,
    recoverSwapped: null,
    recoverEqualsDone: null,
    recoverDifferentDone: null,
    vector: null
};

function currentIndex(condition) {
    return condition.fromLeft
        ? condition.byteIndex
        : condition.bytesCount - condition.byteIndex - 1;
}

function currentNumber(condition) {
    return currentIndex(condition) + 1;
}

function nextByte(condition) {
    if (condition.fromLeft) {
        condition.fromLeft = false;
    }
    else {
        condition.fromLeft = true;
        condition.byteIndex++;
    }
}

function prevByte(condition) {
    if (condition.fromLeft) {
        condition.fromLeft = false;
        condition.byteIndex--;
    }
    else {
        condition.fromLeft = true;
    }
}

function queryNextByte(condition) {
    condition.queryIndex++;
    console.log(currentNumber(condition));
}

function willDamage(condition) {
    return (condition.queryIndex + 1) % 10 === 1;
}

function initTest(condition) {
    condition.byteIndex = 0;
    condition.fromLeft = true;
    condition.assignedBytes = 0;
    condition.vector = Array(condition.bytesCount).fill(null);

    condition.queryIndex = 1;
    console.log(currentNumber(condition));
}

function assignVector(n, condition) {
    condition.vector[currentIndex(condition)] = n;
    condition.assignedBytes++;
}

function vectorCompleted(condition) {
    return condition.assignedBytes === condition.bytesCount;
}

function queryNextRecover(condition) {
    let equals, different;
    do {
        condition.recoverIndex++;
        
        equals = analogEquals(condition);
        different = !equals;
    }
    while (equals && condition.recoverEqualsDone || different && condition.recoverDifferentDone);
    
    condition.queryIndex++;
    console.log(condition.recoverIndex + 1);
}

function initRecover(condition) {
    condition.recoverIndex = -1;
    condition.recoverOptions = [1, 2, 3, 4];
    condition.recoverEqualsDone = false;
    condition.recoverDifferentDone = false;
    queryNextRecover(condition);
}

function applyInverse(condition) {
    for (let i = 0; i < condition.bytesCount; i++) {
        if (condition.vector[i] !== null) {
            condition.vector[i] = condition.vector[i] ? 0 : 1;
        }
    }
}

function applySwap(condition) {
    for (let i = 0; i < Math.floor(condition.bytesCount / 2); i++) {
        const temp = condition.vector[i];
        condition.vector[i] = condition.vector[condition.bytesCount - i - 1];
        condition.vector[condition.bytesCount - i - 1] = temp;
    }
}

function applyRecover(option, condition) {
    switch (option) {
        case 1:
            condition.recoverSwapped = false;
            break;
        case 2:
            applyInverse(condition);
            condition.recoverSwapped = false;
            break;
        case 3:
            applySwap(condition);
            condition.recoverSwapped = true;
            break;
        case 4:
            applySwap(condition);
            applyInverse(condition);
            condition.recoverSwapped = true;
            break;
    }
}

function analogEquals(condition) {
    return condition.vector[condition.recoverIndex] === condition.vector[condition.bytesCount - condition.recoverIndex - 1];
}

function askResponse(condition) {
    console.log(condition.vector.join(''));
}

function updateRecoverOptions(n, condition) {
    if (analogEquals(condition)) {
        condition.recoverEqualsDone = true;
        if (n === condition.vector[condition.recoverIndex]) {
            condition.recoverOptions = condition.recoverOptions
                .filter(el => [1, 3].includes(el));
        }
        else {
            condition.recoverOptions = condition.recoverOptions
                .filter(el => [2, 4].includes(el));
        }
    }
    else {
        condition.recoverEqualsDone = false;
        if (n === condition.vector[condition.recoverIndex]) {
            condition.recoverOptions = condition.recoverOptions
                .filter(el => [1, 4].includes(el));
        }
        else {
            condition.recoverOptions = condition.recoverOptions
                .filter(el => [2, 3].includes(el));
        }
    }
}

function begin(input, condition) {
    [condition.testCount, condition.bytesCount] = input.split(' ').map(v => +v);

    condition.testIndex = 0;
    initTest(condition);

    return 'WAITING_NUMBER';
}

function waitingNumber(input, condition) {
    const n = +input;

    assignVector(n, condition);
    if (vectorCompleted(condition)) {
        askResponse(condition);
        return 'WAITING_RESPONSE';
    }

    nextByte(condition);
    if (willDamage(condition)) {
        initRecover(condition);
        return 'WAITING_RECOVER';
    }
    else {
        queryNextByte(condition);
        return 'WAITING_NUMBER';
    }
}

function waitingRecover(input, condition) {
    const n = +input;

    updateRecoverOptions(n, condition);

    if (condition.recoverOptions.length === 1) {
        applyRecover(condition.recoverOptions[0], condition);
        if (condition.recoverSwapped && !condition.fromLeft) {
            prevByte(condition);
            return 'WAITING_SWAPPED';
        }
        else {
            queryNextByte(condition);
            return 'WAITING_NUMBER';
        }
    }
    else {
        queryNextRecover(condition);
        return 'WAITING_RECOVER';
    }
}

function waitingSwapped(input, condition) {
    const n = +input;

    assignVector(n, condition);
    if (vectorCompleted(condition)) {
        askResponse(condition);
        return 'WAITING_RESPONSE';
    }

    nextByte(condition);
    nextByte(condition);
    if (willDamage(condition)) {
        initRecover(condition);
        return 'WAITING_RECOVER';
    }
    else {
        queryNextByte(condition);
        return 'WAITING_NUMBER';
    }
}

function waitingResponse(input, condition) {
    switch(input) {
        case 'N':
            console.log('Errato');
            process.exit();
        case 'Y':
            condition.testIndex++;
            if (condition.testIndex === condition.testCount) {
                process.exit();
            }
            initTest(condition);
            return 'WAITING_NUMBER';
    }
}

const states = {
    BEGIN: begin,
    WAITING_NUMBER: waitingNumber,
    WAITING_RECOVER: waitingRecover,
    WAITING_SWAPPED: waitingSwapped,
    WAITING_RESPONSE: waitingResponse
};

function main() {
    let state = 'BEGIN';

    rl.on('line', function (line) {
        state = states[state](line, condition);
    });
}
main();