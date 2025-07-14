let shapes = [];
let currentTool = 'move';
let drawingShape = null;
let selectedShape = null;
let dragOffset = {x:0, y:0};
let resizeMode = null; // 'start','end','radius'
let feedbackElem;

function setup() {
    const container = document.getElementById('canvas-container');
    const canvas = createCanvas(container.clientWidth, container.clientHeight);
    canvas.parent('canvas-container');
    feedbackElem = document.getElementById('feedback');
    document.getElementById('tool-select').addEventListener('change', e => {
        currentTool = e.target.value;
        selectedShape = null;
    });
    document.getElementById('clear-btn').addEventListener('click', () => {
        shapes = [];
        selectedShape = null;
        feedbackElem.textContent = '';
    });
    document.getElementById('example-select').addEventListener('change', e => {
        loadExample(e.target.value);
        e.target.value = '';
    });
}

function windowResized() {
    const container = document.getElementById('canvas-container');
    resizeCanvas(container.clientWidth, container.clientHeight);
}

function mousePressed() {
    if (mouseButton !== LEFT) return;
    if (currentTool === 'circle') {
        drawingShape = new Circle(mouseX, mouseY, 0);
        shapes.push(drawingShape);
    } else if (currentTool === 'line' || currentTool === 'dotted') {
        drawingShape = new LineSeg(mouseX, mouseY, mouseX, mouseY, currentTool === 'dotted');
        shapes.push(drawingShape);
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
        } else if (drawingShape instanceof LineSeg) {
            drawingShape.x2 = mouseX;
            drawingShape.y2 = mouseY;
        }
    } else if (selectedShape) {
        if (resizeMode) {
            selectedShape.resize(resizeMode, mouseX, mouseY);
        } else {
            selectedShape.move(mouseX - dragOffset.x, mouseY - dragOffset.y);
        }
    }
}

function mouseReleased() {
    drawingShape = null;
    resizeMode = null;
}

function keyPressed() {
    if ((keyCode === DELETE || keyCode === BACKSPACE) && selectedShape) {
        const idx = shapes.indexOf(selectedShape);
        if (idx !== -1) shapes.splice(idx,1);
        selectedShape = null;
    }
}

function draw() {
    background(255);
    for (const s of shapes) s.draw();
    drawIntersections();
}

class Circle {
    constructor(x,y,r){
        this.x=x; this.y=y; this.r=r;
    }
    draw(){
        push();
        noFill();
        stroke(0);
        ellipse(this.x,this.y,this.r*2,this.r*2);
        pop();
        if (selectedShape===this){
            push();
            stroke('blue');
            noFill();
            ellipse(this.x,this.y,this.r*2+4,this.r*2+4);
            pop();
        }
    }
    hitTest(px,py){
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
            stroke('blue');
            line(this.x1,this.y1,this.x2,this.y2);
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
    } else if(name==='triangle-inequality'){
        const a=new LineSeg(200,200,400,200,false);
        const b=new LineSeg(400,200,550,250,false);
        const c=new LineSeg(550,250,200,200,false);
        shapes.push(a,b,c);
        feedbackElem.textContent='Triangle inequality illustrated';
    } else if(name==='circle-midpoint'){
        const c1=new Circle(width/2-100,height/2,100);
        const c2=new Circle(width/2+100,height/2,100);
        shapes.push(c1,c2);
        feedbackElem.textContent='Intersecting circles create midpoint';
    } else {
        feedbackElem.textContent='';
    }
}
