const BACKGROUND_COLOR = '#0d0d0d';
const squares = [];
let SQUARE_SIZE;
let squaresInRow;
let squaresInCollum;
const filledSpeed = 10;
function setup() {
    rectMode(CORNER);
    const canvas = createCanvas(600, 600);
    SQUARE_SIZE = width / 20;
    canvas.parent('sketch-holder');
    for (let i = 0; i < height; i += SQUARE_SIZE) {
        squares.push([]);
    }
    for (let i = 0; i < height; i += SQUARE_SIZE) {
        for (let j = 0; j < width; j += SQUARE_SIZE) {
            squares[i / SQUARE_SIZE].push(new Square(i, j, SQUARE_SIZE));
        }
    }
    squaresInRow = Math.ceil(height / SQUARE_SIZE);
    squaresInCollum = Math.ceil(width / SQUARE_SIZE);
}
function draw() {
    background(BACKGROUND_COLOR);
    squares.forEach((row) => {
        row.forEach((square) => {
            square.draw();
        });
    });
}

function mouseDragged() {
    squares.forEach((row) => {
        row.forEach((square) => {
            if (square.isSelected(mouseX, mouseY)) {
                square.typeSelector('wall');
            }
        });
    });
}

function floodFill(pos, color) {
    const { x, y } = pos;
    const stack = [pos];
    const visited = [];
    squares[x][y].color = '#aa00dd';
    squares[x][y].type = 'filled';
    setTimeout(() => {
        delayedFloodFill(stack, visited);
    }, filledSpeed);
}

function delayedFloodFill(stack, visited) {
    if (stack.length > 0) {
        let visiting = stack.pop();
        getNeighbors(stack, visited, visiting);
        setTimeout(() => delayedFloodFill(stack, visited), filledSpeed);
        visited.push(visiting);
    }
}

function getNeighbors(stack, visited, pos) {
    const moves = [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
    ];
    for (let i = 0; i < moves.length; i++) {
        let { x, y } = pos;
        x += moves[i][0];
        if (x < 0 || x >= squaresInRow) continue;

        y += moves[i][1];
        if (y < 0 || y >= squaresInCollum) continue;

        const actualPos = { x: x, y: y };
        if (squares[x][y].type == 'empty') {
            if (!stack.includes(actualPos) && !visited.includes(actualPos)) {
                stack.push(actualPos);
                squares[x][y].typeSelector('filled');
            }
        }
    }
}

function a_star(origin = { x: 0, y: 0 }, end = { x: 2, y: 2 }) {
    squares[origin.x][origin.y].color = '#0000ff';
    squares[origin.x][origin.y].fCost = 1;
    squares[end.x][end.y].color = '#0000ff';
    let finished = false;
    actual = origin;
    let stack = [];
    let visited = [JSON.stringify(origin)];
    let tmpX = 0;
    let tmpY = 0;
    let minCost = 100;
    let actualTmp = {};
    while (finished === false) {
        minCost = 1000;
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (i === 0 && j === 0) continue;
                tmpX = actual.x + i;
                tmpY = actual.y + j;
                if (tmpX < 0 || tmpX >= squaresInRow) continue;
                if (tmpY < 0 || tmpY >= squaresInCollum) continue;
                if (squares[tmpX][tmpY].type == 'wall') continue;

                actualTmp = { x: tmpX, y: tmpY };
                if (visited.includes(JSON.stringify(actualTmp))) continue;

                let gCost = calculateCost(actualTmp, origin);
                let hCost = calculateCost(actualTmp, end);
                squares[tmpX][tmpY].updateCosts(gCost, hCost);

                if (!stack.includes(actualTmp)) {
                    stack.push(actualTmp);
                }
                console.log(gCost, hCost);
                if (squares[tmpX][tmpY].hCost === 0) {
                    finished = true;
                    break;
                }

                squares[tmpX][tmpY].typeSelector('path');
            }
        }
        stack.forEach((pos) => {
            if (squares[pos.x][pos.y].fCost < minCost) {
                if (!visited.includes(JSON.stringify(pos))) {
                    minCost = squares[pos.x][pos.y].fCost;
                    actual = { x: pos.x, y: pos.y };
                }
            }
        });
        visited.push(JSON.stringify(actual));
        squares[actual.x][actual.y].color = '#ff2222';
        // debugger;
    }
    // animatePath(end);
}

function animatePath(actual) {
    let finished = false;
    let visited = [JSON.stringify(actual)];
    let minPos = actual;
    while (finished === false) {
        minPos = getMinCost(minPos, visited);
        if (squares[minPos.x][minPos.y].gCost === 0) {
            finished = true;
        }
        squares[minPos.x][minPos.y].typeSelector('finalPath');
    }
}

function getMinCost(actual, visited) {
    minCost = 1000;
    let minPos = {};
    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            if (i === 0 && j === 0) continue;
            tmpX = actual.x + i;
            tmpY = actual.y + j;
            if (squares[tmpX][tmpY].fCost === 0) continue;
            if (tmpX < 0 || tmpX >= squaresInRow) continue;
            if (tmpY < 0 || tmpY >= squaresInCollum) continue;
            if (squares[tmpX][tmpY].type == 'wall') continue;

            actualTmp = { x: tmpX, y: tmpY };
            if (visited.includes(JSON.stringify(actualTmp))) continue;
            if (squares[tmpX][tmpY].fCost < minCost) {
                minPos = actualTmp;
                minCost = squares[tmpX][tmpY].fCost;
            }
            // debugger;
        }
    }
    visited.push(JSON.stringify(minPos));
    return minPos;
}

function calculateCost(actual, end) {
    let cost = 0;
    let tmpX = actual.x;
    let tmpY = actual.y;
    cost = Math.max(Math.abs(tmpX - end.x), Math.abs(tmpY - end.y));
    // while (tmpX != end.x || tmpY != end.y) {
    //     if (tmpX != end.x && tmpY != end.y) {
    //         cost += 1.4;
    //         tmpX += tmpX > end.x ? -1 : 1;
    //         tmpY += tmpY > end.y ? -1 : 1;
    //     } else {
    //         if (tmpX != end.x) {
    //             cost += 1;
    //             tmpX += tmpX > end.x ? -1 : 1;
    //         }
    //         if (tmpY != end.y) {
    //             cost += 1;
    //             tmpY += tmpY > end.y ? -1 : 1;
    //         }
    //     }
    // }
    return Math.ceil(cost * 10);
}
