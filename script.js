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

function cloneShapeList(list){
    return list.map(s => {
        if(s instanceof Circle){
            const c = new Circle(s.x, s.y, s.r, s.color, s.clickable);
            c.clicked = s.clicked;
            return c;
        }
        if(s instanceof Point){
            return new Point(s.x, s.y, s.color);
        }
        if(s instanceof LineSeg){
            const l = new LineSeg(s.x1, s.y1, s.x2, s.y2, s.dotted);
            if(s.color) l.color = s.color;
            return l;
        }
        return null;
    });
}

function saveState(){
    undoStack.push(cloneShapeList(shapes));
    redoStack = [];
}

function undo(){
    if(undoStack.length > 1){
        const current = undoStack.pop();
        redoStack.push(current);
        shapes = cloneShapeList(undoStack[undoStack.length-1]);
        selectedShape = null;
        drawingShape = null;
    }
}

function redo(){
    if(redoStack.length){
        const state = redoStack.pop();
        shapes = cloneShapeList(state);
        undoStack.push(cloneShapeList(state));
        selectedShape = null;
        drawingShape = null;
    }
}

function setup() {
    const container = document.getElementById('canvas-container');
    const canvas = createCanvas(window.innerWidth, window.innerHeight);
    canvas.parent('canvas-container');
    feedbackElem = document.getElementById('feedback');
    document.getElementById('tool-select').addEventListener('change', e => {
        currentTool = e.target.value;
        selectedShape = null;
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

    saveState();
}

function windowResized() {
    resizeCanvas(window.innerWidth, window.innerHeight);
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
        drawingShape = new Circle(mouseX, mouseY, 0);
        shapes.push(drawingShape);
        actionChanged = true;
    } else if (currentTool === 'line' || currentTool === 'dotted') {
        drawingShape = new LineSeg(mouseX, mouseY, mouseX, mouseY, currentTool === 'dotted');
        shapes.push(drawingShape);
        actionChanged = true;
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
    for (const s of shapes) s.draw();
    drawIntersections();
}

class Circle {
    constructor(x,y,r,color='black',clickable=false){
        this.x=x; this.y=y; this.r=r; this.color=color;
        this.clickable=clickable; this.clicked=false;
    }
    draw(){
        push();
        stroke(this.color);
        if(this.clickable||this.clicked){
            fill(this.clicked? 'lightgreen' : this.color);
        }else{
            noFill();
        }
        ellipse(this.x,this.y,this.r*2,this.r*2);
        pop();
        if (selectedShape===this){
            push();
            stroke('orange');
            strokeWeight(2);
            noFill();
            ellipse(this.x,this.y,this.r*2+6,this.r*2+6);
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
    draw(){
        push();
        fill(this.color);
        noStroke();
        ellipse(this.x, this.y, this.r * 2, this.r * 2);
        pop();
        if (selectedShape === this) {
            push();
            stroke('orange');
            strokeWeight(2);
            noFill();
            ellipse(this.x, this.y, this.r * 2 + 6, this.r * 2 + 6);
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
    constructor(x1,y1,x2,y2,dotted=false){
        this.x1=x1; this.y1=y1; this.x2=x2; this.y2=y2; this.dotted=dotted;
    }
    get x(){ return this.x1; }
    get y(){ return this.y1; }
    draw(){
        push();
        if(this.dotted){ drawingContext.setLineDash([5,5]); }
        line(this.x1,this.y1,this.x2,this.y2);
        drawingContext.setLineDash([]);
        pop();
        if(selectedShape===this){
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
            prompt: 'Connect the 3 magenta dots to form a triangle. Can you make two sides equal?',
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
            prompt: 'Use a dotted line to complete the base of the triangle.',
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
            prompt: 'Click each corner of the square to find the right angles.',
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
        }
    ];
}

function loadKidsActivity(i){
    currentActivity = i;
    shapes = [];
    symmetryDemo = null;
    const act = kidsActivities[i];
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
