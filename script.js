let shapes = [];
let currentTool = 'move';
let mode = null; // 'kids' or 'advanced'
let kidsActivities = [];
let currentActivity = 0;
let drawingShape = null;
let selectedShape = null;
let dragOffset = {x:0, y:0};
let resizeMode = null; // 'start','end','radius'
let feedbackElem;
let symmetryDemo = null;
let undoStack = [];
let redoStack = [];
let actionChanged = false;
let currentColor = '#000000';
let currentWeight = 1;
let lineDashed = false;
let fillLayer;
let showGrid = true;
let triangleGuide = {};

function setTool(tool){
    currentTool = tool;
    lineDashed = tool === 'dotted';
    selectedShape = null;
    document.getElementById('tool-select').value = tool;
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tool === tool);
    });
}

function cloneShapeList(list){
    return list.map(s => {
        if(s instanceof Circle){
            const c = new Circle(s.x, s.y, s.r, s.color, s.clickable, s.weight);
            c.clicked = s.clicked;
            return c;
        }
        if(s instanceof Point){
            return new Point(s.x, s.y, s.color);
        }
        if(s instanceof LineSeg){
            return new LineSeg(s.x1, s.y1, s.x2, s.y2, s.dotted, s.color, s.weight);
        }
        return null;
    });
}

function cloneState(){
    return {
        shapes: cloneShapeList(shapes),
        fill: fillLayer.get()
    };
}

function restoreState(state){
    shapes = cloneShapeList(state.shapes);
    fillLayer.clear();
    fillLayer.image(state.fill, 0, 0);
}

function saveState(){
    undoStack.push(cloneState());
    redoStack = [];
}

function undo(){
    if(undoStack.length > 1){
        const current = undoStack.pop();
        redoStack.push(current);
        restoreState(undoStack[undoStack.length-1]);
        selectedShape = null;
        drawingShape = null;
    }
}

function redo(){
    if(redoStack.length){
        const state = redoStack.pop();
        restoreState(state);
        undoStack.push(cloneState());
        selectedShape = null;
        drawingShape = null;
    }
}

function setup() {
    const container = document.getElementById('canvas-container');
    const canvas = createCanvas(window.innerWidth, window.innerHeight);
    canvas.parent('canvas-container');
    fillLayer = createGraphics(window.innerWidth, window.innerHeight);
    fillLayer.pixelDensity(1);
    feedbackElem = document.getElementById('feedback');
    document.getElementById('tool-select').addEventListener('change', e => {
        setTool(e.target.value);
    });
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => setTool(btn.dataset.tool));
    });
    document.getElementById('color-input').addEventListener('input', e => {
        currentColor = e.target.value;
    });
    document.getElementById('thickness-input').addEventListener('input', e => {
        currentWeight = parseInt(e.target.value, 10) || 1;
    });
    document.getElementById('grid-toggle').addEventListener('change', e => {
        showGrid = e.target.checked;
    });
    document.getElementById('clear-btn').addEventListener('click', () => {
        shapes = [];
        selectedShape = null;
        if(mode === 'kids'){
            loadKidsActivity(currentActivity);
        } else {
            feedbackElem.textContent = '';
        }
        saveState();
    });
    document.getElementById('example-select').addEventListener('change', e => {
        loadExample(e.target.value);
        e.target.value = '';
    });

    document.getElementById('undo-btn').addEventListener('click', undo);
    document.getElementById('redo-btn').addEventListener('click', redo);

    document.addEventListener('keydown', e => {
        if((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z'){
            undo();
            e.preventDefault();
        } else if((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))){
            redo();
            e.preventDefault();
        }
    });

    document.getElementById('next-activity').addEventListener('click', () => {
        if(currentActivity < kidsActivities.length - 1){
            loadKidsActivity(currentActivity + 1);
        }
    });
    document.getElementById('prev-activity').addEventListener('click', () => {
        if(currentActivity > 0){
            loadKidsActivity(currentActivity - 1);
        }
    });

    document.getElementById('kids-mode').addEventListener('click', startKidsMode);
    document.getElementById('advanced-mode').addEventListener('click', startAdvancedMode);

    setTool('move');
    saveState();
}

function windowResized() {
    resizeCanvas(window.innerWidth, window.innerHeight);
    if(fillLayer){
        fillLayer.resizeCanvas(window.innerWidth, window.innerHeight);
    }
}

function mousePressed() {
    if (mouseButton !== LEFT) return;
    if(mode==='kids'){
        for(const s of shapes){
            if(s instanceof Circle && s.clickable){
                if(dist(mouseX,mouseY,s.x,s.y) <= s.r + 5){
                    s.clicked = true;
                    checkKidsActivity();
                    return;
                }
            }
        }
    }
    if (currentTool === 'point') {
        shapes.push(new Point(mouseX, mouseY));
        actionChanged = true;
    } else if (currentTool === 'circle') {
        drawingShape = new Circle(mouseX, mouseY, 0, currentColor, false, currentWeight);
        shapes.push(drawingShape);
        actionChanged = true;
    } else if (currentTool === 'line' || currentTool === 'dotted') {
        drawingShape = new LineSeg(mouseX, mouseY, mouseX, mouseY, lineDashed, currentColor, currentWeight);
        shapes.push(drawingShape);
        actionChanged = true;
    } else if (currentTool === 'fill') {
        bucketFill(mouseX, mouseY, currentColor);
        saveState();
    } else if (currentTool === 'move') {
        selectedShape = findShape(mouseX, mouseY);
        if (selectedShape) {
            const hit = selectedShape.hitTest(mouseX, mouseY);
            if (hit) {
                resizeMode = hit;
            } else {
                dragOffset.x = mouseX - selectedShape.x;
                dragOffset.y = mouseY - selectedShape.y;
            }
        }
    }
}

function mouseDragged() {
    if (drawingShape) {
        if (drawingShape instanceof Circle) {
            drawingShape.r = dist(drawingShape.x, drawingShape.y, mouseX, mouseY);
            actionChanged = true;
        } else if (drawingShape instanceof LineSeg) {
            drawingShape.x2 = mouseX;
            drawingShape.y2 = mouseY;
            actionChanged = true;
        }
    } else if (selectedShape) {
        if (resizeMode) {
            selectedShape.resize(resizeMode, mouseX, mouseY);
            actionChanged = true;
        } else {
            selectedShape.move(mouseX - dragOffset.x, mouseY - dragOffset.y);
            actionChanged = true;
            if(symmetryDemo && selectedShape === symmetryDemo.moveDot){
                const dx = selectedShape.x - symmetryDemo.centerX;
                symmetryDemo.mirrorDot.move(symmetryDemo.centerX - dx, selectedShape.y);
            }
        }
    }
}

function mouseReleased() {
    if(actionChanged){
        saveState();
        actionChanged = false;
    }
    drawingShape = null;
    resizeMode = null;
    checkKidsActivity();
}

function keyPressed() {
    if ((keyCode === DELETE || keyCode === BACKSPACE) && selectedShape) {
        const idx = shapes.indexOf(selectedShape);
        if (idx !== -1) shapes.splice(idx,1);
        selectedShape = null;
        actionChanged = true;
        saveState();
    }
}

function draw() {
    background(255);
    if(showGrid) drawGrid();
    image(fillLayer, 0, 0);
    updateCursor();
    for (const s of shapes) s.draw();
    drawIntersections();
}

function drawGrid(){
    const step = 25;
    stroke(230);
    strokeWeight(1);
    for(let x=0;x<width;x+=step){
        line(x,0,x,height);
    }
    for(let y=0;y<height;y+=step){
        line(0,y,width,y);
    }
}

class Circle {
    constructor(x,y,r,color='black',clickable=false,weight=1){
        this.x=x; this.y=y; this.r=r; this.color=color;
        this.clickable=clickable; this.clicked=false;
        this.weight=weight;
    }
    draw(pg){
        const g = pg || window;
        g.push();
        g.stroke(this.color);
        g.strokeWeight(this.weight);
        if(this.clickable||this.clicked){
            g.fill(this.clicked? 'lightgreen' : this.color);
        }else{
            g.noFill();
        }
        g.ellipse(this.x,this.y,this.r*2,this.r*2);
        g.pop();
        if(!pg && selectedShape===this){
            push();
            stroke('orange');
            strokeWeight(2);
            noFill();
            ellipse(this.x,this.y,this.r*2+6,this.r*2+6);
            fill('yellow');
            noStroke();
            rectMode(CENTER);
            rect(this.x + this.r, this.y, 6, 6);
            pop();
        }
    }
    hitTest(px,py){
        if(this.clickable) return null;
        const d=dist(px,py,this.x,this.y);
        if(abs(d-this.r)<6) return 'radius';
        if(d<this.r) return 'center';
        return null;
    }
    move(nx,ny){
        this.x=nx; this.y=ny;
    }
    resize(mode,px,py){
        if(mode==='radius') this.r=dist(this.x,this.y,px,py);
        if(mode==='center') this.move(px,py);
    }
}

class Point {
    constructor(x, y, color = 'black') {
        this.x = x;
        this.y = y;
        this.color = color;
        this.r = 4;
    }
    draw(pg){
        const g = pg || window;
        g.push();
        g.fill(this.color);
        g.noStroke();
        g.ellipse(this.x, this.y, this.r * 2, this.r * 2);
        g.pop();
        if(!pg && selectedShape === this) {
            push();
            stroke('orange');
            strokeWeight(2);
            noFill();
            ellipse(this.x, this.y, this.r * 2 + 6, this.r * 2 + 6);
            fill('yellow');
            noStroke();
            rectMode(CENTER);
            rect(this.x, this.y, 6, 6);
            pop();
        }
    }
    hitTest(px, py){
        const d = dist(px, py, this.x, this.y);
        if(d <= this.r + 3) return 'center';
        return null;
    }
    move(nx, ny){
        this.x = nx;
        this.y = ny;
    }
    resize(mode, px, py){
        if(mode === 'center') this.move(px, py);
    }
}

class LineSeg {
    constructor(x1,y1,x2,y2,dotted=false,color='black',weight=1){
        this.x1=x1; this.y1=y1; this.x2=x2; this.y2=y2; this.dotted=dotted;
        this.color=color; this.weight=weight;
    }
    get x(){ return this.x1; }
    get y(){ return this.y1; }
    draw(pg){
        const g = pg || window;
        g.push();
        g.stroke(this.color);
        g.strokeWeight(this.weight);
        if(this.dotted){ g.drawingContext.setLineDash([5,5]); }
        g.line(this.x1,this.y1,this.x2,this.y2);
        g.drawingContext.setLineDash([]);
        g.pop();
        if(!pg && selectedShape===this){
            push();
            stroke('orange');
            strokeWeight(2);
            line(this.x1,this.y1,this.x2,this.y2);
            fill('yellow');
            noStroke();
            rectMode(CENTER);
            rect(this.x1,this.y1,6,6);
            rect(this.x2,this.y2,6,6);
            pop();
        }
    }
    hitTest(px,py){
        const d1=dist(px,py,this.x1,this.y1);
        const d2=dist(px,py,this.x2,this.y2);
        const lineLen=dist(this.x1,this.y1,this.x2,this.y2);
        if(abs(d1+d2-lineLen)<3) {
            if(d1<6) return 'start';
            if(d2<6) return 'end';
            return 'body';
        }
        return null;
    }
    move(nx,ny){
        const dx=nx-this.x1; const dy=ny-this.y1;
        this.x1+=dx; this.y1+=dy; this.x2+=dx; this.y2+=dy;
    }
    resize(mode,px,py){
        if(mode==='start'){ this.x1=px; this.y1=py; }
        if(mode==='end'){ this.x2=px; this.y2=py; }
    }
}

function findShape(px,py){
    for(let i=shapes.length-1;i>=0;i--){
        if(shapes[i].hitTest && shapes[i].hitTest(px,py)) return shapes[i];
    }
    return null;
}

function updateCursor(){
    if(resizeMode){
        cursor('nwse-resize');
        return;
    }
    if(currentTool !== 'move'){
        cursor('default');
        return;
    }
    const shape = findShape(mouseX, mouseY);
    if(shape){
        const mode = shape.hitTest(mouseX, mouseY);
        if(mode === 'start' || mode === 'end' || mode === 'radius'){
            cursor('nwse-resize');
        } else if(mode){
            cursor('move');
        } else {
            cursor('default');
        }
    } else {
        cursor('default');
    }
}

function drawIntersections(){
    stroke('red');
    fill('red');
    for(let i=0;i<shapes.length;i++){
        for(let j=i+1;j<shapes.length;j++){
            const pts=getIntersections(shapes[i], shapes[j]);
            if(pts){
                for(const p of pts){
                    ellipse(p.x,p.y,5,5);
                }
            }
        }
    }
}

function getIntersections(a,b){
    if(a instanceof LineSeg && b instanceof LineSeg){
        const p=lineLineIntersection(a,b);
        return p? [p] : null;
    } else if(a instanceof Circle && b instanceof Circle){
        return circleCircleIntersection(a,b);
    } else if(a instanceof Circle && b instanceof LineSeg){
        return circleLineIntersection(a,b);
    } else if(b instanceof Circle && a instanceof LineSeg){
        return circleLineIntersection(b,a);
    }
    return null;
}

function lineLineIntersection(l1,l2){
    const {x1,y1,x2,y2}=l1;
    const {x1:x3,y1:y3,x2:x4,y2:y4}=l2;
    const den=(x1-x2)*(y3-y4)-(y1-y2)*(x3-x4);
    if(den===0) return null;
    const px=((x1*y2 - y1*x2)*(x3 - x4)-(x1 - x2)*(x3*y4 - y3*x4))/den;
    const py=((x1*y2 - y1*x2)*(y3 - y4)-(y1 - y2)*(x3*y4 - y3*x4))/den;
    if(px<min(x1,x2)-1||px>max(x1,x2)+1||px<min(x3,x4)-1||px>max(x3,x4)+1) return null;
    if(py<min(y1,y2)-1||py>max(y1,y2)+1||py<min(y3,y4)-1||py>max(y3,y4)+1) return null;
    return {x:px,y:py};
}

function circleCircleIntersection(c1,c2){
    const d=dist(c1.x,c1.y,c2.x,c2.y);
    if(d>c1.r+c2.r||d<abs(c1.r-c2.r)||d===0) return null;
    const a=(c1.r**2 - c2.r**2 + d**2)/(2*d);
    const h=Math.sqrt(c1.r**2 - a**2);
    const xm=c1.x + a*(c2.x - c1.x)/d;
    const ym=c1.y + a*(c2.y - c1.y)/d;
    const xs1=xm + h*(c2.y - c1.y)/d;
    const ys1=ym - h*(c2.x - c1.x)/d;
    const xs2=xm - h*(c2.y - c1.y)/d;
    const ys2=ym + h*(c2.x - c1.x)/d;
    return [{x:xs1,y:ys1},{x:xs2,y:ys2}];
}

function circleLineIntersection(c,l){
    const x1=l.x1-c.x, y1=l.y1-c.y;
    const x2=l.x2-c.x, y2=l.y2-c.y;
    const dx=x2-x1, dy=y2-y1;
    const dr2=dx*dx+dy*dy;
    const D=x1*y2-x2*y1;
    const disc=c.r*c.r*dr2-D*D;
    if(disc<0) return null;
    const sqrtDisc=Math.sqrt(disc);
    const sign=dy<0?-1:1;
    const ix1=(D*dy+sign*dx*sqrtDisc)/dr2 + c.x;
    const iy1=(-D*dx+abs(dy)*sqrtDisc)/dr2 + c.y;
    if(disc===0) return [{x:ix1,y:iy1}];
    const ix2=(D*dy-sign*dx*sqrtDisc)/dr2 + c.x;
    const iy2=(-D*dx-abs(dy)*sqrtDisc)/dr2 + c.y;
    return [{x:ix1,y:iy1},{x:ix2,y:iy2}];
}

function hexToRgb(hex){
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if(!m) return {r:0,g:0,b:0};
    return {
        r: parseInt(m[1],16),
        g: parseInt(m[2],16),
        b: parseInt(m[3],16)
    };
}

function bucketFill(x,y,color){
    const temp = createGraphics(width, height);
    temp.pixelDensity(1);
    temp.image(fillLayer,0,0);
    for(const s of shapes){
        s.draw(temp);
    }
    temp.loadPixels();
    fillLayer.loadPixels();
    const startX=Math.floor(x), startY=Math.floor(y);
    const idx = (startY*width + startX)*4;
    const target = {
        r: temp.pixels[idx],
        g: temp.pixels[idx+1],
        b: temp.pixels[idx+2],
        a: temp.pixels[idx+3]
    };
    const fc = hexToRgb(color);
    if(target.r===fc.r && target.g===fc.g && target.b===fc.b && target.a===255) {
        return;
    }
    const stack=[[startX,startY]];
    const visited = new Uint8Array(width*height);
    while(stack.length){
        const [cx,cy] = stack.pop();
        if(cx<0||cy<0||cx>=width||cy>=height) continue;
        const pos = cy*width+cx;
        if(visited[pos]) continue;
        const pidx = pos*4;
        if(temp.pixels[pidx]===target.r && temp.pixels[pidx+1]===target.g && temp.pixels[pidx+2]===target.b && temp.pixels[pidx+3]===target.a){
            visited[pos]=1;
            temp.pixels[pidx]=fc.r;
            temp.pixels[pidx+1]=fc.g;
            temp.pixels[pidx+2]=fc.b;
            temp.pixels[pidx+3]=255;
            fillLayer.pixels[pidx]=fc.r;
            fillLayer.pixels[pidx+1]=fc.g;
            fillLayer.pixels[pidx+2]=fc.b;
            fillLayer.pixels[pidx+3]=255;
            stack.push([cx+1,cy]);
            stack.push([cx-1,cy]);
            stack.push([cx,cy+1]);
            stack.push([cx,cy-1]);
        }
    }
    temp.updatePixels();
    fillLayer.updatePixels();
}

function loadExample(name){
    shapes = [];
    if(name==='equilateral'){
        const side=200;
        const x1=width/2-side/2;
        const y1=height/2+side/3;
        const x2=width/2+side/2;
        const y2=y1;
        const h=side*Math.sqrt(3)/2;
        const x3=width/2;
        const y3=y1-h;
        shapes.push(new LineSeg(x1,y1,x2,y2,false));
        shapes.push(new LineSeg(x2,y2,x3,y3,false));
        shapes.push(new LineSeg(x3,y3,x1,y1,false));
        feedbackElem.textContent='Equilateral triangle constructed';
    } else if(name==='triangle-congruency'){
        const left=[{x:200,y:300},{x:300,y:150},{x:400,y:300}];
        shapes.push(new LineSeg(left[0].x,left[0].y,left[1].x,left[1].y,false));
        shapes.push(new LineSeg(left[1].x,left[1].y,left[2].x,left[2].y,false));
        shapes.push(new LineSeg(left[2].x,left[2].y,left[0].x,left[0].y,false));
        const dx=250;
        for(let i=0;i<3;i++){
            const j=(i+1)%3;
            shapes.push(new LineSeg(left[i].x+dx,left[i].y,left[j].x+dx,left[j].y,false));
        }
        feedbackElem.textContent='Two triangles with equal sides - congruent (SSS)';
    } else if(name==='circle-theorem'){
        const c=new Circle(width/2, height/2, 120);
        const aAngle=PI/6, bAngle=-PI/6, cAngle=PI/2;
        const ax=c.x+cos(aAngle)*c.r, ay=c.y+sin(aAngle)*c.r;
        const bx=c.x+cos(bAngle)*c.r, by=c.y+sin(bAngle)*c.r;
        const cxp=c.x+cos(cAngle)*c.r, cyp=c.y+sin(cAngle)*c.r;
        shapes.push(c);
        shapes.push(new LineSeg(ax,ay,bx,by,false));
        shapes.push(new LineSeg(ax,ay,cxp,cyp,false));
        shapes.push(new LineSeg(bx,by,cxp,cyp,false));
        feedbackElem.textContent='Angles subtended by the same arc are equal';
    } else if(name==='pythagorean'){
        const base=160;
        const x=width/2-base/2, y=height/2+base/2;
        shapes.push(new LineSeg(x,y,x+base,y,false));
        shapes.push(new LineSeg(x+base,y,x+base,y-base,false));
        shapes.push(new LineSeg(x+base,y-base,x,y,false));
        // squares
        shapes.push(new LineSeg(x,y,x,y-base,false));
        shapes.push(new LineSeg(x,y-base,x+base,y-base,false));
        shapes.push(new LineSeg(x+base,y-base,x+base,y-base-base,false));
        shapes.push(new LineSeg(x+base,y-base-base,x,y-base-base,false));
        shapes.push(new LineSeg(x,y-base-base,x,y-base,false));
        shapes.push(new LineSeg(x+base,y,x+base+base,y,false));
        shapes.push(new LineSeg(x+base+base,y,x+base+base,y-base,false));
        shapes.push(new LineSeg(x+base+base,y-base,x+base,y-base,false));
        feedbackElem.textContent='Right triangle with squares demonstrates a^2+b^2=c^2';
    } else if(name==='parallel-lines'){
        const y1=height/2-60, y2=height/2+60;
        const x1=width/2-120, x2=width/2+120;
        shapes.push(new LineSeg(x1,y1,x2,y1,false));
        shapes.push(new LineSeg(x1,y2,x2,y2,false));
        const tx=width/2, ty1=height/2-100, ty2=height/2+100;
        shapes.push(new LineSeg(tx,ty1,tx,ty2,false));
        feedbackElem.textContent='Parallel lines with a transversal';
    } else {
        feedbackElem.textContent='';
    }
    saveState();
}

// ----- Mode Switching -----
function startKidsMode(){
    mode = 'kids';
    document.body.classList.add('kids');
    document.getElementById('mode-selector').style.display = 'none';
    document.getElementById('toolbar').style.display = 'flex';
    document.getElementById('canvas-container').style.display = 'block';
    document.getElementById('prev-activity').style.display = 'inline-block';
    document.getElementById('next-activity').style.display = 'inline-block';
    resizeCanvas(window.innerWidth, window.innerHeight);
    triangleGuide = {};
    setupKidsActivities();
    loadKidsActivity(0);
}

function startAdvancedMode(){
    mode = 'advanced';
    document.body.classList.remove('kids');
    document.getElementById('mode-selector').style.display = 'none';
    document.getElementById('toolbar').style.display = 'flex';
    document.getElementById('canvas-container').style.display = 'block';
    document.getElementById('prev-activity').style.display = 'none';
    document.getElementById('next-activity').style.display = 'none';
    resizeCanvas(window.innerWidth, window.innerHeight);
    feedbackElem.textContent = '';
}

function setupKidsActivities(){
    kidsActivities = [
        {
            prompt: 'Place a point anywhere on the canvas. A point is an exact position with no size.',
            setup: function(){
                // nothing pre-drawn
            },
            check: function(){
                for(const s of shapes){
                    if(s instanceof Point){
                        return true;
                    }
                }
                return false;
            }
        },
        {
            prompt: 'Draw a line segment connecting the two red points. A line segment is the straight path between points.',
            setup: function(){
                const x1 = width/2 - 60;
                const x2 = width/2 + 60;
                const y = height/2;
                shapes.push(new Circle(x1, y, 6, 'magenta'));
                shapes.push(new Circle(x2, y, 6, 'magenta'));
            },
            check: function(){
                const x1 = width/2 - 60;
                const x2 = width/2 + 60;
                const y = height/2;
                for(const s of shapes){
                    if(s instanceof LineSeg){
                        const c1 = dist(s.x1,s.y1,x1,y) < 10 && dist(s.x2,s.y2,x2,y) < 10;
                        const c2 = dist(s.x1,s.y1,x2,y) < 10 && dist(s.x2,s.y2,x1,y) < 10;
                        if(c1 || c2) return true;
                    }
                }
                return false;
            }
        },
        {
            prompt: 'Use line segments to connect the 3 red points into a triangle. Can you make two line segments equal?',
            setup: function(){
                placeTriangleDots();
            },
            check: function(){
                const pts=[
                    {x: width/2 - 100, y: height/2 + 80},
                    {x: width/2 + 100, y: height/2 + 80},
                    {x: width/2, y: height/2 - 80}
                ];
                const lines=[];
                for(const s of shapes){
                    if(s instanceof LineSeg){
                        for(let i=0;i<3;i++){
                            for(let j=i+1;j<3;j++){
                                const c1 = dist(s.x1,s.y1,pts[i].x,pts[i].y) < 10 && dist(s.x2,s.y2,pts[j].x,pts[j].y) < 10;
                                const c2 = dist(s.x1,s.y1,pts[j].x,pts[j].y) < 10 && dist(s.x2,s.y2,pts[i].x,pts[i].y) < 10;
                                if(c1 || c2){
                                    lines.push({seg:s,len:dist(pts[i].x,pts[i].y,pts[j].x,pts[j].y)});
                                }
                            }
                        }
                    }
                }
                if(lines.length>=3){
                    for(let i=0;i<lines.length;i++){
                        for(let j=i+1;j<lines.length;j++){
                            if(abs(lines[i].len-lines[j].len)<15){
                                lines[i].seg.color='blue';
                                lines[j].seg.color='blue';
                                return true;
                            }
                        }
                    }
                }
                return false;
            }
        },
        {
            prompt: 'Use a dotted line segment to complete the base of the triangle.',
            setup: function(){
                const x1 = width/2 - 80;
                const x2 = width/2 + 80;
                const y1 = height/2 + 60;
                const x3 = width/2;
                const y3 = height/2 - 60;
                shapes.push(new LineSeg(x1,y1,x3,y3,false));
                shapes.push(new LineSeg(x3,y3,x2,y1,false));
            },
            check: function(){
                const x1 = width/2 - 80;
                const x2 = width/2 + 80;
                const y1 = height/2 + 60;
                for(const s of shapes){
                    if(s instanceof LineSeg && s.dotted){
                        const c1 = dist(s.x1,s.y1,x1,y1) < 10 && dist(s.x2,s.y2,x2,y1) < 10;
                        const c2 = dist(s.x1,s.y1,x2,y1) < 10 && dist(s.x2,s.y2,x1,y1) < 10;
                        if(c1 || c2) return true;
                    }
                }
                return false;
            }
        },
        {
            prompt: 'Click each corner point of the square to find the right angles.',
            setup: function(){
                const size=120;
                const cx=width/2;
                const cy=height/2;
                const half=size/2;
                shapes.push(new LineSeg(cx-half,cy-half,cx+half,cy-half,false));
                shapes.push(new LineSeg(cx+half,cy-half,cx+half,cy+half,false));
                shapes.push(new LineSeg(cx+half,cy+half,cx-half,cy+half,false));
                shapes.push(new LineSeg(cx-half,cy+half,cx-half,cy-half,false));
                shapes.push(new Circle(cx-half,cy-half,8,'gray',true));
                shapes.push(new Circle(cx+half,cy-half,8,'gray',true));
                shapes.push(new Circle(cx+half,cy+half,8,'gray',true));
                shapes.push(new Circle(cx-half,cy+half,8,'gray',true));
            },
            check: function(){
                let allClicked=true;
                for(const s of shapes){
                    if(s instanceof Circle && s.clickable){
                        if(!s.clicked){
                            allClicked=false;
                        }
                    }
                }
                return allClicked;
            }
        },
        {
            prompt: 'Place the first point (point A) anywhere on the canvas.',
            keepShapes: false,
            setup: function(){
                triangleGuide = {};
            },
            check: function(){
                for(const s of shapes){
                    if(s instanceof Point){
                        triangleGuide.A = {x:s.x, y:s.y};
                        return true;
                    }
                }
                return false;
            }
        },
        {
            prompt: 'Draw a circle centered at point A.',
            keepShapes: true,
            setup: function(){
                if(triangleGuide.A){
                    shapes.push(new Circle(triangleGuide.A.x, triangleGuide.A.y, 6, 'magenta'));
                }
            },
            check: function(){
                if(!triangleGuide.A) return false;
                for(const s of shapes){
                    if(s instanceof Circle && s.r > 10){
                        if(dist(s.x,s.y,triangleGuide.A.x,triangleGuide.A.y) < 5){
                            triangleGuide.radius = s.r;
                            return true;
                        }
                    }
                }
                return false;
            }
        },
        {
            prompt: 'Place a second point (point B) on the circle\u2019s circumference.',
            keepShapes: true,
            setup: function(){
                if(triangleGuide.A){
                    shapes.push(new Circle(triangleGuide.A.x, triangleGuide.A.y, 6, 'magenta'));
                }
            },
            check: function(){
                if(!triangleGuide.A || !triangleGuide.radius) return false;
                for(const s of shapes){
                    if(s instanceof Point){
                        const d = dist(s.x,s.y,triangleGuide.A.x,triangleGuide.A.y);
                        if(abs(d - triangleGuide.radius) < 5){
                            triangleGuide.B = {x:s.x, y:s.y};
                            return true;
                        }
                    }
                }
                return false;
            }
        },
        {
            prompt: 'Draw a second circle centered at B with the same radius as the first.',
            keepShapes: true,
            setup: function(){
                if(triangleGuide.B){
                    shapes.push(new Circle(triangleGuide.B.x, triangleGuide.B.y, 6, 'magenta'));
                }
            },
            check: function(){
                if(!triangleGuide.B || !triangleGuide.radius) return false;
                for(const s of shapes){
                    if(s instanceof Circle && s.r > 10){
                        if(dist(s.x,s.y,triangleGuide.B.x,triangleGuide.B.y) < 5 && abs(s.r - triangleGuide.radius) < 5){
                            return true;
                        }
                    }
                }
                return false;
            }
        },
        {
            prompt: 'Mark the intersection of both circles as point C and connect A-B-C with line segments.',
            keepShapes: true,
            setup: function(){
                if(triangleGuide.A && triangleGuide.B && triangleGuide.radius){
                    shapes.push(new Circle(triangleGuide.A.x, triangleGuide.A.y, 6, 'magenta'));
                    shapes.push(new Circle(triangleGuide.B.x, triangleGuide.B.y, 6, 'magenta'));
                    const c1 = new Circle(triangleGuide.A.x, triangleGuide.A.y, triangleGuide.radius);
                    const c2 = new Circle(triangleGuide.B.x, triangleGuide.B.y, triangleGuide.radius);
                    const inter = circleCircleIntersection(c1,c2);
                    if(inter && inter.length){
                        triangleGuide.C = inter[0];
                        shapes.push(new Circle(triangleGuide.C.x, triangleGuide.C.y, 6, 'magenta'));
                    }
                }
            },
            check: function(){
                if(!triangleGuide.C) return false;
                let cPoint = null;
                for(const s of shapes){
                    if(s instanceof Point){
                        if(dist(s.x,s.y,triangleGuide.C.x,triangleGuide.C.y) < 5){
                            cPoint = {x:s.x, y:s.y};
                            break;
                        }
                    }
                }
                if(!cPoint) return false;
                let ab=false, bc=false, ca=false;
                function near(px,py,qx,qy){ return dist(px,py,qx,qy) < 5; }
                for(const s of shapes){
                    if(s instanceof LineSeg){
                        if((near(s.x1,s.y1,triangleGuide.A.x,triangleGuide.A.y) && near(s.x2,s.y2,triangleGuide.B.x,triangleGuide.B.y)) ||
                           (near(s.x2,s.y2,triangleGuide.A.x,triangleGuide.A.y) && near(s.x1,s.y1,triangleGuide.B.x,triangleGuide.B.y))) ab=true;
                        if((near(s.x1,s.y1,triangleGuide.B.x,triangleGuide.B.y) && near(s.x2,s.y2,cPoint.x,cPoint.y)) ||
                           (near(s.x2,s.y2,triangleGuide.B.x,triangleGuide.B.y) && near(s.x1,s.y1,cPoint.x,cPoint.y))) bc=true;
                        if((near(s.x1,s.y1,triangleGuide.A.x,triangleGuide.A.y) && near(s.x2,s.y2,cPoint.x,cPoint.y)) ||
                           (near(s.x2,s.y2,triangleGuide.A.x,triangleGuide.A.y) && near(s.x1,s.y1,cPoint.x,cPoint.y))) ca=true;
                    }
                }
                return ab && bc && ca;
            }
        }
    ];
}

function loadKidsActivity(i){
    currentActivity = i;
    const act = kidsActivities[i];
    if(!act.keepShapes){
        shapes = [];
    }
    symmetryDemo = null;
    act.setup();
    feedbackElem.textContent = act.prompt;
    document.getElementById('prev-activity').disabled = i === 0;
    document.getElementById('next-activity').disabled = i === kidsActivities.length - 1;
    saveState();
}

function checkKidsActivity(){
    if(mode !== 'kids') return;
    const act = kidsActivities[currentActivity];
    if(act.check && act.check()){
        feedbackElem.textContent = 'Great job!';
    }
}

// ----- Additional Demonstrations -----
function placeTriangleDots(){
    const x1 = width/2 - 100;
    const x2 = width/2 + 100;
    const y1 = height/2 + 80;
    const x3 = width/2;
    const y3 = height/2 - 80;
    shapes.push(new Circle(x1, y1, 6, 'magenta'));
    shapes.push(new Circle(x2, y1, 6, 'magenta'));
    shapes.push(new Circle(x3, y3, 6, 'magenta'));
    feedbackElem.textContent = 'Connect the dots to form a triangle!';
}

function demonstrateCircleSymmetry(){
    shapes = [];
    const centerX = width/2;
    const centerY = height/2;
    const radius = 80;
    const c = new Circle(centerX, centerY, radius);
    const axis = new LineSeg(centerX, centerY - radius - 30, centerX, centerY + radius + 30, false);
    const dot = new Circle(centerX + radius, centerY, 6, 'blue');
    const mirror = new Circle(centerX - radius, centerY, 6, 'green');
    shapes.push(c, axis, dot, mirror);
    symmetryDemo = {centerX, moveDot: dot, mirrorDot: mirror};
    feedbackElem.textContent = 'Move the blue dot. The green dot mirrors it across the line.';
}

function showEqualSidesPrompt(){
    feedbackElem.textContent = 'Can you make this triangle have two equal sides?';
}
