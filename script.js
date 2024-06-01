var leftBuffer; 
var rightBuffer;

var backgroundColor = 0;

var maxWidth = 800;
var maxHeight = 800;

var quadWidth = maxWidth;
var quadHeight = maxHeight;

var precision = 8;
var maxFrames = 15;

var drawing, jiggly, doHone, jiggleRando, flashingQuad = false;

var targX, targY = 0;
var currentFrame = 0; 

var scaleFactor = maxWidth/1200;

var maxFlashFrames = 5;
var currentColorDepth = 0; 
var maxDepth = 7;

var maxHomeSize = 100;
var homer = 0;

var randomPointCount = 1;

var rectToDraw = [];
var linesToDraw = [];
var randomPoints = [];

var colorOrder = ['lightgrey', 'grey', 'darkgrey', 'black', 'white'];

// Buttons 
var jiggleBtn, togglehomerBtn, jiggleRandoBtn, flashingQuadBtn, randomPointButton; 

class RectData
{
    constructor(x, y, w, h)
    {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    
    draw()
    {
        leftBuffer.rect(this.x, this.y, this.w, this.h);
    }
}

class LineData
{
    constructor(x1, y1, x2, y2)
    {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }
    draw(shouldWiggle = false)
    {
        if (shouldWiggle)
        {
            var x1 = this.x1 + wiggle();
            var y1 = this.y1 + wiggle();
            var x2 = this.x2 + wiggle();
            var y2 = this.y2 + wiggle();
            leftBuffer.line(x1, y1, x2, y2);
            return;
        }

        leftBuffer.line(this.x1, this.y1, this.x2, this.y2);
    }
}

function setup() 
{
    createCanvas(1300, 900);
    leftBuffer = createGraphics(800, 800);
    rightBuffer = createGraphics(500, 800);  
    DrawBackground();  
    GenerateRandomPoints(randomPointCount);
    GetQuadData(maxDepth);
    DoButtons();
    DoFields();
}

function DoButtons()
{
    var pointStr = randomPointCount > 1 ? "s" : "";
    randomPointButton = createButton('Generate new random point' + pointStr);
    randomPointButton.position(860, 150);
    randomPointButton.size(400, 100);
    randomPointButton.mousePressed(FindNewQuads);

    jiggleBtn = createButton(!jiggly ? "Do jiggly lines" : "Do straight lines");
    jiggleBtn.position(860, 270);
    jiggleBtn.size(400, 100);
    jiggleBtn.mousePressed(_ => 
        {
            jiggly = !jiggly;
            jiggleBtn.html(!jiggly ? "Do jiggly lines" : "Do straight lines");
        });

    togglehomerBtn = createButton("Toggle homer");
    togglehomerBtn.position(860, 480);
    togglehomerBtn.size(400, 100);
    togglehomerBtn.mousePressed(_ => 
        {
             doHone = !doHone;
             togglehomerBtn.html(doHone ? "Turn off homer" : "Turn on homer");
        });

    jiggleRandoBtn = createButton(jiggleRando ? "Turn off jiggle" : "Turn on jiggle");
    jiggleRandoBtn.position(860, 600);
    jiggleRandoBtn.size(400, 100);
    jiggleRandoBtn.mousePressed(_ => 
        {
            jiggleRando = !jiggleRando;
            jiggleRandoBtn.html(!jiggleRando ? "jiggly random points" : "Turn off jiggly points");
        });
    
    flashingQuadBtn = createButton(flashingQuad ? "Turn off flashing quad" : "Turn on flashing quad");
    flashingQuadBtn.position(860, 720);
    flashingQuadBtn.size(400, 100);
    flashingQuadBtn.mousePressed(_ => 
        {
            flashingQuad = !flashingQuad;
            flashingQuadBtn.html(flashingQuad ? "Turn off flashing quad" : "Turn on flashing quad");
        });
}

function DoFields()
{
    var fieldSize = 15;
    var fieldX = 1025;

    let depthField = createInput();
    depthField.position(fieldX, 390);
    depthField.size(fieldSize, fieldSize);
    depthField.input(_ => 
        {
            var newMaxDepth = parseInt(depthField.value());
            maxDepth = Number.isInteger(newMaxDepth) ? newMaxDepth : maxDepth;
            maxDepth = Math.min(Math.max(maxDepth, 1), 8);
            FindNewQuads();
            depthField.value(maxDepth);
        });
    depthField.value(maxDepth);
    
    let frameField = createInput();
    frameField.position(fieldX, 420);
    frameField.size(fieldSize, fieldSize);
    frameField.input(_ => 
        {
            var newMaxFrames = parseInt(frameField.value());
            maxFrames = Number.isInteger(newMaxFrames) ? newMaxFrames : maxFrames;
            maxFrames = Math.min(Math.max(maxFrames, 1), 60);
            frameField.value(maxFrames);
        });
    frameField.value(maxFrames);

    let pointField = createInput();
    pointField.position(fieldX + 80, 450);
    pointField.size(fieldSize + 10, fieldSize);
    pointField.input(_ => 
        {
            var newPointCount = parseInt(pointField.value());
            randomPointCount = Number.isInteger(newPointCount) ? newPointCount : randomPointCount;
            randomPointCount = Math.min(Math.max(randomPointCount, 1), 100);
            FindNewQuads();
            pointField.value(randomPointCount);
            randomPointButton.html('Generate new random point' + (randomPointCount > 1 ? "s" : ""));
        });
    pointField.value(randomPointCount);
}

function FindNewQuads()
{
    currentColorDepth = 0;
    rectToDraw = [];
    linesToDraw = [];
    linesToDraw = [];
    randomPoints = [];
    randomPoints = [];
    GenerateRandomPoints(randomPointCount);
    GetQuadData(maxDepth);
    drawing = true;
    currentFrame = 0;
    currentColorDepth = 0;
    quadWidth = maxWidth;
}

function GenerateRandomPoints(amount)
{
    for (var i = 0; i < amount; i++)
    {
        var x = Math.random() * maxWidth;
        var y = Math.random() * maxHeight;
        randomPoints.push({x: x, y: y});
    }
}

function GetQuadData(precision)
{
    leftBuffer.stroke('black');
    leftBuffer.strokeWeight(1);
    randomPoints.forEach(p => leftBuffer.ellipse(p.x, p.y, 3, 3));
    randomPoints.forEach(p => 
        {
            FindQuads(maxWidth, maxHeight, quadWidth/2, quadHeight/2, p.x, p.y, precision, 0);
        });
}

function draw()
{
    DrawBackground();
    var coordinates = GetMouseCoordinates();
    var soughtCoordinates = randomPoints[0];
    leftBuffer.stroke('black');
    leftBuffer.strokeWeight(5);
    leftBuffer.strokeWeight(1);
    leftBuffer.noFill();
    linesToDraw.forEach(l => l.draw(jiggly)); 
    var deepestRect = rectToDraw[rectToDraw.length - 1];

    if (currentColorDepth < maxDepth)
    {
        ColorNodeSearch()
    }
    else
    {
        leftBuffer.rect(deepestRect.x - deepestRect.w/2, deepestRect.y - deepestRect.h/2, deepestRect.w, deepestRect.h);
        if (flashingQuad) FlashFound(currentFrame < maxFlashFrames ? 'red' : 'black');
    }
    currentFrame++;
    if (currentFrame >= maxFrames)
    {
        currentColorDepth++;
        drawing = false;
        currentFrame = 0;
    }
    leftBuffer.stroke('black');
    leftBuffer.strokeWeight(3);

    randomPoints.forEach(p => {
        leftBuffer.point(p.x + (jiggleRando ? wiggle() : 0), p.y + (jiggleRando ? wiggle() : 0));
        });
    
    if (doHone) DrawEchohomer();

    rightBuffer.strokeWeight(1);
    rightBuffer.stroke('black');
    rightBuffer.fill('black');
    rightBuffer.textSize(24);
    rightBuffer.text('Depth (1 - 8)', 55, 400);
    rightBuffer.text('Frames (1 - 60)', 55, 430);
    rightBuffer.text('Random Points (1 - 100)', 55, 460);
    rightBuffer.text("Quad Tree Visualizer",130, 50);
    rightBuffer.text(`X: ${mouseX.toFixed(1)}, Y:${mouseY.toFixed(1)}`, 55, 110);
    rightBuffer.text(`Random point: ${soughtCoordinates.x.toFixed(2)}, ${soughtCoordinates.y.toFixed(2)}`, 55, 85);
    var halfDeepestRectWidth = deepestRect.w/2;
    var halfDeepestRectHeight = deepestRect.h/2;
    rightBuffer.text(`Locale: X:${deepestRect.x - halfDeepestRectWidth}, Y:${deepestRect.y - halfDeepestRectHeight}, W:${deepestRect.w}, H:${deepestRect.h}`, 55, 135); 

    image(leftBuffer, 0, 50, maxWidth, maxHeight, 0, 0, maxWidth, maxHeight, COVER);
    image(rightBuffer,800, 0, 500, 800, 0, 0, 500, 800, COVER);
}

function wiggle()
{
    return Math.random() * 2 - 1;
}

function DrawEchohomer()
{
    var honeColor = color('red');
    honeColor = color(red(honeColor), green(honeColor), blue(honeColor), 150);
    leftBuffer.stroke(honeColor);   
    leftBuffer.noFill();
    homer = homer < 60 ? homer + 0.5: 0;

    for (var i = 0; i < 4; i++)
    {
        leftBuffer.strokeWeight(4 - i);
        leftBuffer.ellipse(randomPoints[0].x, randomPoints[0].y, homer + (i * 10));
    }

    leftBuffer.stroke('black');
}

function DrawBackground() 
{ 
    leftBuffer.background(0,0,0);
    leftBuffer.fill(255,180,80);
    leftBuffer.rect(0, 0, 800, maxHeight);
    rightBuffer.background(255,255,255);
}

function GetMouseCoordinates()
{
    var x = mouseX;
    var y = mouseY;
    var coordinates = "X: " + x + " Y: " + y;
    return coordinates;
}

function mouseClicked()
{
    targX = mouseX;
    targY = mouseY;
    return false; 
}

function mouseReleased() 
{
    drawing = false;
    return false;
}

function FindQuads(quadWidth, quadHeight, startX, startY, targetX, targetY, totalDepth, currentSearchDepth)
{
    if (startX < 0 || startY < 0 || startX > width || startY > height)
    {
        return;
    }

    if (currentSearchDepth >= totalDepth)
    {
        rectToDraw.push(new RectData(startX, startY, quadWidth, quadHeight));
        return;
    }

    // draw subdividing lines
    linesToDraw.push(new LineData(startX, startY-quadHeight/2, startX, startY + quadHeight/2));
    linesToDraw.push(new LineData(startX-quadWidth/2, startY, startX + quadWidth/2, startY));

    var drawableX = startX > targetX ? startX - quadWidth/2 : startX;
    var drawableY = startY > targetY ? startY - quadHeight/2 : startY;

    rectToDraw.push(new RectData(drawableX, drawableY, quadWidth/2, quadHeight/2));

    quadWidth /= 2;
    quadHeight /= 2;

    // find our next subquad
    var newStartX = targetX >= startX ? startX + quadWidth/2 : startX - quadWidth/2;
    var newStartY = targetY >= startY ? startY + quadHeight/2 : startY - quadHeight/2;

    FindQuads(quadWidth, quadHeight, newStartX, newStartY, targetX, targetY, totalDepth, currentSearchDepth + 1);
}

function DoQuads(depth, targetX, targetY)
{
    var x = maxWidth/2;
    var y = height/2;
    var w = maxWidth * 1.0;
    var h = height * 1.0;

    leftBuffer.stroke(15);
    leftBuffer.fill(255, 255, 255);

    for (var i = 0; i < depth; i++)
    {
        leftBuffer.rect(x, y, w, h);

        x = targetX >= x ? Math.min(x + w/2, maxWidth) : x - w/2;
        y = targetY >= y ? Math.min(y + h/2, maxHeight) : y - h/2;
        
        leftBuffer.rect(x,y, w/2, h/2);

        w /= 2; 
        h /= 2;
    }

    currentFrame++;

    if (currentFrame >= maxFrames)
    {
        drawing = false;
        currentFrame = 0;
    }
}

function ColorNodeSearch()
{
    var col = (colorOrder[currentColorDepth % colorOrder.length]);
    col = color(red(col), green(col), blue(col), 127);
    leftBuffer.fill(col);
    leftBuffer.rect(rectToDraw[currentColorDepth].x, rectToDraw[currentColorDepth].y, rectToDraw[currentColorDepth].w, rectToDraw[currentColorDepth].h);
}

function FlashFound(currentColor)
{
    leftBuffer.fill(color(red(currentColor), green(currentColor), blue(currentColor), 80));
    leftBuffer.rect(rectToDraw[maxDepth-1].x, rectToDraw[maxDepth-1].y, rectToDraw[maxDepth-1].w, rectToDraw[maxDepth-1].h);
}
