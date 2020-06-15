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
