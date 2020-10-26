/*-------------------------------------------------------
                    Data Part
-------------------------------------------------------*/

var ROW  = 20;
var COL  = 10;
var grid = []; //全部方格
var shapes = [  //所有形状
    [0, 1, 4, 5],
    [0, 1, 2, 3], [0, 4, 8, 12], 
    [1, 2, 4, 5], [0, 4, 5, 9 ], 
    [0, 1, 5, 6], [1, 4, 5, 8 ], 
    [0, 1, 2, 5], [1, 4, 5, 9 ], [1, 4, 5, 6], [1, 5, 6, 9], 
    [0, 1, 4, 8], [0, 1, 2, 6 ], [1, 5, 8, 9], [0, 4, 5, 6], 
    [1, 5, 8, 9], [0, 4, 5, 6 ], [1, 2, 5, 9], [0, 1, 2, 6], 
];
var shapeMapper = {  //形状种类对应的形状变化
    1: 0,
    2: 1,
    3: 3,
    4: 5,
    5: 7,
    6: 11,
    7: 15
}
var currentShape = [];  //当前形状
var currentShapeNum;  
var currentShapeType;
var currentX;
var currentY; //左上角坐标so
var vertexColors = [
    [ 0.0, 0.0, 0.0, 1.0 ],  // black
    [ 1.0, 0.0, 0.0, 1.0 ],  // red
    [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
    [ 0.0, 1.0, 0.0, 1.0 ],  // green
    [ 0.0, 0.0, 1.0, 1.0 ],  // blue
    [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
    [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
    [ 0.7, 0.5, 0.5, 1.0 ],
    [ 1.0, 1.0, 1.0, 1.0 ]   // white
];
var points = [];
var colors = [];
var paintInterval;
var gameInterval;
var blockSize;
var lineSize = 1;
var height;
var width;
var score;
/*-------------------------------------------------------
                    Operating Part
-------------------------------------------------------*/
window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    height = canvas.height;
    width = canvas.width;
    blockSize = canvas.height / ROW;
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    // var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    // gl.useProgram( program );
    startGame();
}


function startGame() {
    console.log("game start");
    clearAllIntervals();
    initScore();
    initGrid();
    generateShape();
    //paint();
    paintInterval = setInterval(paint, 30);
    gameInterval = setInterval(gameMove, 360);
}

function endGame() {
    clearAllIntervals();
    // initGrid();
    window.alert("u lose");
}

function initScore() {
    score = 0;
    document.getElementById("score").innerHTML = score;
}

function initGrid() {
    for ( var y = 0; y < ROW; ++y ) {
        grid[y] = [];
        for ( var x = 0; x < COL; ++x ) {
            grid[y][x] = 0;
        }
    }
}

function generateShape() {
    // console.log("g");
    currentShapeType = Math.floor(Math.random() * 7 + 1);
    // console.log(currentShapeType);
    currentShapeNum = shapeMapper[currentShapeType];
    // console.log(currentShapeNum);
    currentShape = shapes[currentShapeNum];
    currentX = 0;
    currentY = 20;
}

function calculateAddScore() {
    var flag = true;
    var eliminateLines = 0;
    for(var i = 0; i < ROW; i++) {
        for(var j = 0; j < COL; j++) {
            if(grid[i][j]==0) {
                flag = false;
            }
        }
        if(flag) {
            eliminateLines++;
            clearLines(i);
        }
        flag = false;
    }
    var scoreForLength = [100, 300, 500, 800];
    if(eliminateLines != 0) {
        score += scoreForLength[eliminateLines - 1];
        document.getElementById("score").innerHTML = score;
    }
}

function clearLines(row) {
    for(var i = row; i < ROW - 1; i++) {
        for(var j = 0; j < COL; j++) {
            grid[i][j] = grid[i + 1][j];
        }
    }
    for(var j = 0; j < COL; j++) {
        grid[ROW - 1][j] = 0;
    }
}

/**
 * 检测每个格子是否出界
 * @param {*} shape 
 */
function collisionDetect(shape, x, y) {
    for(var i = 0; i < shape.length; i++) {
        var row = y - Math.floor(shape[i] / 4);
        // console.log(row);
        var col = x + shape[i] % 4;
        // console.log(col);
        if(row < 0 || row > ROW - 1 || col < 0 || col > COL - 1 ) {
            // console.log("xq");
            return true;
        }
        if(grid[row - 1][col] != 0) {
            // console.log("xw");
            return true;
        }
    }
    return false;
    
}

function collisionDetectWhenDown(shape, x, y) {
    for(var i = 0; i < shape.length; i++) {
        var row = y - Math.floor(shape[i] / 4);
        // console.log(row);
        var col = x + shape[i] % 4;
        // console.log(col);
        if(row < 1 || row > ROW ) {
            // console.log("xq");
            return true;
        }
        if(grid[row - 1][col] != 0) {
            // console.log("xw");
            return true;
        }
    }
    return false;
    
}

function putShape(shape, x, y) {
    for(var i = 0; i < shape.length; i++) {
        var row = y - Math.floor(shape[i] / 4);
        // console.log(row + "行");
        var col = x + shape[i] % 4;
        // console.log(col + "列");
        grid[row - 1][col] = currentShapeType;
    }
}

function gameMove() {
    if(!collisionDetectWhenDown(currentShape,currentX, currentY-1)){ 
        // console.log(collisionDetectWhenDown(currentShape,currentX, currentY-1));
        currentY--;
    }
    else {
        if(currentY >= 20) {
            endGame();
        }
        putShape(currentShape, currentX, currentY);
        calculateAddScore();
        generateShape();
    }
}

function rotate() {
    // var statusNum;
    // (currentShapeNum==7)? statusNUm = 4: statusNum = (shapeMapper[currentShapeNum+1] - shapeMapper[currentShape]);
    // var turnIndex = [0, 2, 1, 4, 3, 6, 5, 8, 9, 10, 7, 12, 13, 14, 11, 16, 17, 18, 15]
    var turnIndex = [0, 2, 1, 4, 3, 6, 5, 8, 9, 10, 7, 12, 13, 14, 11, 16, 17, 18, 15]
    var shape = [];
    // console.log(currentShapeNum);
    // console.log(turnIndex[currentShapeNum])
    shape = shapes[turnIndex[currentShapeNum]];
    // console.log(shape);
    if(!collisionDetect(shape, currentX, currentY)) {
        currentShape = shape;
        currentShapeNum = turnIndex[currentShapeNum];
    }
}

function moveLeft() {
    if(!collisionDetect(currentShape, currentX - 1, currentY)) {
        currentX -= 1;
    }
}

function moveRight() {
    if(!collisionDetect(currentShape, currentX + 1, currentY)) {
        currentX += 1;
    }
}

function moveDown() {
    if(!collisionDetect(currentShape, currentX, currentY - 1)) {
        currentY -= 1;
    }
}
/*-------------------------------------------------------
                    Painting Part
-------------------------------------------------------*/
function clearAllIntervals(){
    clearInterval( paintInterval );
    clearInterval( gameInterval );
}

function Vec2(x, y) {
    //console.log(x,y);
    var newX = 2 * x / width - 1;
    var newY = 2 * y / height - 1;
    return vec2(newX, newY);
}
function paint() {
    //
    //  Load shaders and initialize attribute buffers
    //
    clearShape();
    drawShape(currentX, currentY, currentShape);
    drawGrid();
    
    // console.log("paint");
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram(program);
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
}

function drawGrid() {
    for(var i = 0; i < COL; i++) {
        x = i*blockSize;
        // console.log("x" + x);
        drawLine(Vec2(x, height), Vec2(x + lineSize, height), Vec2(x, 0), Vec2(x + lineSize, 0));
    }
    drawLine(Vec2((COL)*blockSize -lineSize, height), Vec2((COL)*blockSize, height), Vec2((COL)*blockSize - lineSize, 0), Vec2((COL)*blockSize + lineSize, 0))
    for(var i = 0; i < ROW; i++) {
        y = i*blockSize;
        // console.log("y" + y);
        drawLine(Vec2(width, y), Vec2(width, y + lineSize), Vec2(0, y), Vec2(0, y + lineSize));
    }
    drawLine(Vec2(width, (ROW)*blockSize - lineSize), Vec2(width, (ROW)*blockSize), Vec2(0, (ROW)*blockSize - lineSize), Vec2(0, (ROW)*blockSize))
    
}

function clearShape() {
    for ( var y = 0; y < ROW; ++y ) {
        for ( var x = 0; x < COL; ++x ) {
            if(grid[y][x] == 0) {
                x1 = (x) * blockSize;
                y1 = (y + 1) * blockSize;
                drawBlock(Vec2(x1, y1), Vec2(x1 + blockSize, y1), 
            Vec2(x1 + blockSize, y1 - blockSize), Vec2(x1, y1 - blockSize), 8)
            }
            else {
                x1 = (x) * blockSize;
                y1 = (y + 1) * blockSize;
                // console.log(x + " " + y + " " + grid[y][x]);
                drawBlock(Vec2(x1, y1), Vec2(x1 + blockSize, y1), 
            Vec2(x1 + blockSize, y1 - blockSize), Vec2(x1, y1 - blockSize), grid[y][x]);
            }
        }
    }
}

function drawShape(x, y, shape) {
    var singleSize = blockSize;
    for(var i = 0; i < 4; i++) {
        var realRow = (y - Math.floor(shape[i] / 4)) * singleSize;
        var realCol = (x + shape[i] % 4) * singleSize;
        drawRectangle(Vec2(realCol, realRow), Vec2(realCol + singleSize, realRow), 
            Vec2(realCol + singleSize, realRow - singleSize), Vec2(realCol, realRow - singleSize), currentShapeType)
    }
}

function drawBlock(a, b, c, d, e) {
    // console.log("drawLine")
    var indices = [ a, b, c, a, c, d ];
    for ( var i = 0; i < indices.length; ++i ) {
        points.push(indices[i]);
        //colors.push( vertexColors[indices[i]] );
    
        // for solid colored faces use 
        colors.push(vertexColors[e]);  
    }
}

function drawLine(a, b, c, d) {
    // console.log("drawLine")
    var indices = [ a, b, c, a, c, d ];
    for ( var i = 0; i < indices.length; ++i ) {
        points.push(indices[i]);
        //colors.push( vertexColors[indices[i]] );
    
        // for solid colored faces use 
        colors.push(vertexColors[0]);  
    }
}

function drawRectangle(a, b, c, d, type) {
    var indices = [ a, b, c, a, c, d ];
    for ( var i = 0; i < indices.length; ++i ) {
        points.push(indices[i]);
        //colors.push( vertexColors[indices[i]] );
    
        // for solid colored faces use 
        colors.push(vertexColors[type]);  
    }
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length);
}

/*-------------------------------------------------------
                    Control Part
-------------------------------------------------------*/

var manipulate = {
    W: "rotate",
    A: "left",
    S: "down",
    D: "right"
}

window.onkeydown = function(event) {
    var key = String.fromCharCode(event.keyCode);
    console.log(key);
    action(manipulate[key]);
}

function action(key) {
    switch(key) {
        case "rotate":
            rotate();
            break;
        case "left":
            moveLeft();
            break;
        case "right":
            moveRight();
            break;
        case "down":
            moveDown();
            break;
    }
}



