let grid = [];
let oldGrid = [];
let score = 0;
let sizeLength;
let gridSize;
let cellSize;
let strWeight;
let undoBuffer = 25;
let initial = false;
let autoMode = false;
let winConfirmation = false;
let isUpdate = true;

// set up
function setup() {
    newGame();
    noLoop();
}

// main loop
function draw() {
    if (autoMode)
        update(randomInt(1, 4));
}

function newGame() {
    if (!initial) {
        initial = true;
    } else if (!confirm("Do you want to start a new Game?")) {
        return false;
    }

    winConfirmation = false;
    score = 0;
    if (autoMode) auto();

    gridSize = document.getElementById("gridSize").value;
    sizeLength = document.getElementById("sizeLength").value;

    cellSize = (10 * sizeLength) / (11 * gridSize + 1);
    strWeight = cellSize / 10;

    createCanvas(sizeLength, sizeLength);       // set the canvas size
    background(187, 173, 161);      // border colour

    textAlign(CENTER, CENTER);
    noStroke();

    // initiate the grid
    grid = [];
    for (let i = 0; i < gridSize; i++) {
        grid[i] = [];
        for (let j = 0; j < gridSize; j++) {
            grid[i][j] = 0;
        }
    }

    // add two cell
    randomCell();
    randomCell();

    show();
}

function auto() {
    autoMode = !autoMode;
    if (autoMode) {
        frameRate(parseInt(document.getElementById("movePerSec").value));
        loop();
        document.getElementById("autoButton").value = "Auto Off";
    } else {
        noLoop();
        document.getElementById("autoButton").value = "Auto On";
    }
}

// key pressed event
function keyPressed() {
    if (keyCode == UP_ARROW || keyCode == 87) {                 // W(87)
        update(1);
    } else if (keyCode == DOWN_ARROW || keyCode == 83) {        // S(83)
        update(2);
    } else if (keyCode == LEFT_ARROW || keyCode == 65) {        // A(65)
        update(3);
    } else if (keyCode == RIGHT_ARROW || keyCode == 68) {       // D(68)
        update(4);
    }
}

// update the grid
function update(direction) {
    oldGrid.push([grid.slice(),score]);     // save the previous position to the history

    let tempGrid;

    switch (direction) {
        case 1:     // up
        tempGrid = invertGridDimention(grid);
        for (let i = 0; i < tempGrid.length; i++) {
            tempGrid[i] = process(tempGrid[i]);
        }
        grid = invertGridDimention(tempGrid);
        break;

        case 2:     // down
        tempGrid = invertGridDimention(grid);
        for (let i = 0; i < tempGrid.length; i++) {
            tempGrid[i] = process(tempGrid[i].reverse()).reverse();
        }
        grid = invertGridDimention(tempGrid);
        break;

        case 3:     // left
        for (let i = 0; i < grid.length; i++) {
            grid[i] = process(grid[i]);
        }
        break;

        case 4:     // right
        for (let i = 0; i < grid.length; i++) {
            grid[i] = process(grid[i].reverse()).reverse();
        }
        tempGrid = oldGrid.last()[0]
        for (let i = 0; i < tempGrid.length; i++) {
            tempGrid[i].reverse();
        }
        break;
    }

    // if there is no difference before and after the movement
    if (oldGrid.last()[0].equal(grid)) {
        oldGrid.pop();
        if (gameOver()) {
            show();
            if (autoMode) auto();
            if (confirm("Game Over. Restart the game?")) {
                initial = false;
                newGame();
            }
        }
    } else {randomCell();}


    if (oldGrid.length > undoBuffer)
        oldGrid.shift();       // maintain the length of oldGrid to the value of undoBuffer

    if (isUpdate) show();

    setTimeout(function () {
        if (!winConfirmation) {
            if (win()){
                show();
                winConfirmation = true;
                if (confirm("You Win! Restart the game?")) {
                    initial = false;
                    newGame();
                }
            }
        }
    }, 0);
}

//undo the grid up to value of undoBuffer
function undo() {
    if (oldGrid.length) {
        let history = oldGrid.pop()
        grid = history[0];
        score = history[1];
        show()
    } else {
        alert("Cannot undo anymore!")
    }
}

// turn grid[row][column] to grid[column][row]
function invertGridDimention(grid) {
    let tempGrid = [];
    for (let i = 0; i < grid[0].length; i++) {
        tempGrid.push([]);
        for (let j = 0; j < grid.length; j++) {
            tempGrid[i].push(grid[j][i]);
        }
    }
    return tempGrid;
}

// process each row or column
function process(array) {
    array = array.filter(num => {return num != 0;})     // get rid of all the zero
    let newArray = [];

    for (let i = 0; i < array.length; i++) {
        if (i != array.length - 1) {
            if (array[i] == array[i + 1]) {
                newArray.push(array[i] * 2);
                score += array[i] * 2;
                i++;
                continue;
            }
        }
        newArray.push(array[i]);
    }
    while (newArray.length < gridSize) newArray.push(0);
    return newArray;
}

function toggleUpdate() {isUpdate = !isUpdate;}

// display the cell to the screen
function show() {
    background(187, 173, 161);      // border colour

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            switch (grid[i][j]) {
                case 0:    fill(213, 205, 196); break;
                case 2:    fill(238, 228, 218); break;
                case 4:    fill(236, 224, 200); break;
                case 8:    fill(242, 177, 120); break;
                case 16:   fill(245, 149, 99);  break;
                case 32:   fill(246, 124, 96);  break;
                case 64:   fill(246, 93, 59);   break;
                case 128:  fill(237, 206, 113); break;
                case 256:  fill(237, 204, 98);  break;
                case 512:  fill(236, 201, 80);  break;
                case 1024: fill(237, 197, 63);  break;
                case 2048: fill(238, 194, 45);  break;
                default:   fill(238, 194, 45);  break;
            }

            let x = j * cellSize + (j + 1) * strWeight;
            let y = i * cellSize + (i + 1) * strWeight;
            rect(x, y, cellSize, cellSize);

            textSize(cellSize * .5);
            if(grid[i][j] == 0) {
                fill(213, 205, 196);
            } else if(grid[i][j] <= 4) {
                fill(117, 109, 100);
            } else {
                fill(250);
                if(grid[i][j] >= 128) {
                    textSize(cellSize * .4);
                }
            }
            text(grid[i][j], x + cellSize * .5, y + cellSize * .5);
        }
    }
    document.getElementById("score").innerHTML = score.toString();
}

// random a cell that has not been occupied
function randomCell() {
  while (true) {
    let x = floor(Math.random() * gridSize);
    let y = floor(Math.random() * gridSize);
    if(!grid[x][y]) {
        grid[x][y] = randomInt(1, 4, [1, 3]);
        break;
    }
  }
}

// check whether it is win
function win() {
    for (let i = 0; i < grid.length; i++)
        for (let j = 0; j < grid[i].length; j++)
            if (grid[i][j] == 2048) return true;
}

// check whether it is game over
function gameOver() {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] == 0) return false;
        }
    }
    return true;
}

// return a random integer n where small >= n <= large excluding an array of number
function randomInt(small, large, exclude = []) {
    while (true) {
        let rand = floor(Math.random() * large + small);
        if (!exclude.find(num => {return num == rand;})) return rand;
    }
}

// an array prototype function that return the last item of the array
Array.prototype.last = function () {return this[this.length - 1];}

//an array prototype function that compare two array
Array.prototype.equal = function (array) {
    if (!array)
        return false;       // if array has no value, return false
    if (this.length != array.length)
        return false;      // if two array has different length, return false

    for (let i = 0; i < this.length; i++) {
        if (this[i] instanceof Array && array[i] instanceof Array) {
            if (!this[i].equal(array[i]))
                return false;
        } else if (this[i] != array[i]) {
            return false;
        }
    }
    return true;
}
