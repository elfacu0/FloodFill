const BACKGROUND_COLOR = '#0d0d0d';
const squares = [];
let SQUARE_SIZE;
let squaresInRow;
let squaresInCollum;
const filledSpeed = 10;
let lastChanged = {};
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
                if (lastChanged.x != square.x || lastChanged.y != square.y) {
                    if (square.type === 'wall') {
                        square.typeSelector('empty');
                    } else {
                        square.typeSelector('wall');
                    }
                    lastChanged = { x: square.x, y: square.y };
                    console.log('ASD');
                }
            }
        });
    });
}

function floodFill(pos = { x: 2, y: 2 }, color = '#f000f0') {
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

function improvedFloodFill(pos = { x: 2, y: 2 }, color = '#f000f0') {
    let tmpX;
    let tmpY;
    let neighbour = {};
    let neighbourString = {};
    const stack = [JSON.stringify(pos)];
    const visited = [];
    let current = pos;
    squares[pos.x][pos.y].color = '#aa00dd';
    squares[pos.x][pos.y].type = 'filled';
    let animate = setInterval(() => {
        if (stack.length > 0) {
            for (let i = -1; i < 2; i++) {
                for (let j = -1; j < 2; j++) {
                    if (i === 0 && j === 0) continue;
                    tmpX = current.x + i;
                    tmpY = current.y + j;
                    if (exceptions(tmpX, tmpY)) continue;

                    neighbour = { x: tmpX, y: tmpY };
                    neighbourString = JSON.stringify(neighbour);
                    if (visited.includes(neighbourString)) continue;
                    if (!isValidCorner(current, neighbour)) continue;

                    if (squares[neighbour.x][neighbour.y].type == 'empty') {
                        if (
                            !stack.includes(neighbourString) &&
                            !visited.includes(neighbourString)
                        ) {
                            stack.push(neighbourString);
                        }
                    }
                }
            }
            current = stack.pop();
            visited.push(current);
            current = JSON.parse(current);
            squares[current.x][current.y].typeSelector('filled');
        } else {
            clearInterval(animate);
        }
    }, filledSpeed);
    console.log('END');
}

function dijkstra(origin = { x: 3, y: 3 }, end = { x: 10, y: 10 }) {
    squares[origin.x][origin.y].color = '#0000ff';
    squares[end.x][end.y].color = '#0000ff';
    squares[origin.x][origin.y].fCost = 0;
    let current = { x: origin.x, y: origin.y };
    let stack = [JSON.stringify(origin)];
    let visited = [JSON.stringify(origin)];
    let minCost = 0;
    let neighbour = {};
    let tmpX = 0;
    let tmpY = 0;
    let tmpDistance = 0;
    let ite = 0;
    let dijkstraInterval = setInterval(() => {
        if (stack.length) {
            if (++ite > 5000) return 0;
            minCost = 10000;
            stack = stack.filter((posString) => {
                let pos = JSON.parse(posString);
                if (pos.x === current.x && pos.y === current.y) {
                    return false;
                }
                return true;
            });
            visited.push(JSON.stringify(current));

            if (current.x == end.x && current.y === end.y) {
                console.log('END');
                squares[end.x][end.y].color = '#0000ff';
                clearInterval(dijkstraInterval);
                animateDijkstra(end, origin);
            } else {
                squares[current.x][current.y].color = '#ff0000';
            }

            for (let i = -1; i < 2; i++) {
                for (let j = -1; j < 2; j++) {
                    if (i === 0 && j === 0) continue;
                    tmpX = current.x + i;
                    tmpY = current.y + j;
                    if (exceptions(tmpX, tmpY)) continue;

                    neighbour = { x: tmpX, y: tmpY };
                    if (!isValidCorner(current, neighbour)) continue;

                    tmpDistance = dijkstraDistance(current, neighbour);
                    if (tmpDistance < squares[tmpX][tmpY].fCost) {
                        squares[tmpX][tmpY].fCost = tmpDistance;
                    }

                    if (
                        !stack.includes(JSON.stringify(neighbour)) &&
                        !visited.includes(JSON.stringify(neighbour))
                    ) {
                        stack.push(JSON.stringify(neighbour));
                        squares[tmpX][tmpY].typeSelector('path');
                    }
                }
            }

            stack.forEach((posString) => {
                let pos = JSON.parse(posString);
                tmpDistance = squares[pos.x][pos.y].fCost;
                if (tmpDistance < minCost && !visited.includes(posString)) {
                    minCost = tmpDistance;
                    current = pos;
                }
            });
        }
    }, 5);
}

function exceptions(tmpX, tmpY) {
    if (tmpX < 0 || tmpX >= squaresInRow) return true;
    if (tmpY < 0 || tmpY >= squaresInCollum) return true;
    if (squares[tmpX][tmpY].type == 'wall') return true;
    return false;
}

function isValidCorner(origin, end) {
    let xDif = end.x - origin.x;
    let yDif = end.y - origin.y;
    let blocks = 0;
    if (squares[origin.x + xDif][origin.y].type === 'wall') {
        blocks++;
    }
    if (squares[origin.x][origin.y + yDif].type === 'wall') {
        blocks++;
    }
    if (blocks === 2) {
        return false;
    } else {
        return true;
    }
}

function animateDijkstra(origin, end) {
    let tmpX = 0;
    let tmpY = 0;
    let current = { x: origin.x, y: origin.y };
    let tmpCurrent = {};
    let neighbour = {};
    let minDist = 0;
    let ite = 0;
    while (ite < 1000) {
        ite++;
        minDist = 10000;
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (i === 0 && j === 0) continue;
                tmpX = current.x + i;
                tmpY = current.y + j;
                if (tmpX < 0 || tmpX >= squaresInRow) continue;
                if (tmpY < 0 || tmpY >= squaresInCollum) continue;
                if (squares[tmpX][tmpY].type == 'wall') continue;

                neighbour = { x: tmpX, y: tmpY };
                if (minDist > squares[tmpX][tmpY].fCost) {
                    minDist = squares[tmpX][tmpY].fCost;
                    tmpCurrent = neighbour;
                }
            }
        }
        squares[current.x][current.y].color = '#0000ff';
        current = tmpCurrent;
        if (current.x === end.x && current.y === end.y) {
            squares[current.x][current.y].color = '#0000ff';
            break;
        }
    }
}

function dijkstraDistance(origin, current) {
    let distance = squares[origin.x][origin.y].fCost;
    let tmpIndex =
        Math.abs(origin.x - current.x) + Math.abs(origin.y - current.y);
    if (tmpIndex == 2) {
        distance += 14;
    } else {
        distance += 10;
    }
    return distance;
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

                let gCost = calculateGCost(actualTmp, origin);
                let hCost = calculateHCost(actualTmp, end);
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

function calculateGCost(actual, end) {
    let cost = Math.abs(actual.x - end.x) + Math.abs(actual.y - end.y);
    return cost;
}

function calculateHCost(actual, end) {
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
