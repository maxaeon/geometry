let shapes = [];
let currentTool = 'select';
let mode = null; // 'kids' or 'advanced'
let kidsActivities = [];
const firstStepIds = new Set([
    'intro-plane',
    'place-point',
    'connect-red-points',
    'draw-square',
    'triangle-equal',
    'identify-right-angles',
    'circle-basics',
    'equilateral-point-a',
    'right-angle-legs',
    'identify-centers',
    'rectangle-from-triangles',
    'triangle-vertices',
    'draw-diameter',
    'acute-angle',
    'obtuse-angle',
    'shape-identify-sequence',
    'compose-house',
    'shape-attributes',
    'square-add-points',
    'polygon-add-points',
    'fraction-square-quarters',
    'polygon-perimeter',
    'circle-circumference',
    'shape-area',
    'parallel-through-point'
]);
let currentActivity = 0;
let drawingShape = null;
let selectedShapes = [];
let selectedShape = null;
let dragOffset = {x:0, y:0};
let resizeMode = null; // 'start','end','radius'
let feedbackElem;
let symmetryDemo = null;
let undoStack = [];
let redoStack = [];
const HISTORY_LIMIT = 50;
let actionChanged = false;
let currentColor = '#000000';
let currentWeight = 1;
let lineDashed = false;
let dimensionInterval = null;
let fillLayer;
let showGrid = true;
let currentDictPage = 0;
let triangleGuide = {};
let introGuide = {};
let rightTriangleGuide = {};
let pythGuide = {};
let similarityGuide = {};
let circleGuide = {};
let similarityDemo = null;
let identifyCenterStep = 0;
let identifyCenterCircles = [];
let shapeIdentify = {};
let squareGuide = {};
let parallelGuide = {};
let snapshotStart = null;
let selectionRect = null;
let groupOffsets = null;
let instructionIntroPlayed = false;


const CANVAS_PADDING_PCT = 0;
let paletteColors = ['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', 'transparent'];
let currentExample = null;
let exampleShapes = [];
let advancedExamples = {};
let currentExampleStep = 0;
let currentAutoNext = false;
let triangleAGroup = null;
let triangleBGroup = null;
let advancedInfo = {
    'intro-plane': {
        formula: '<strong>Dimensions:</strong> a line is 1D and our canvas is 2D.',
        explanation: 'In 3D you add height to length and width. Time or another axis can create 4D and beyond.'
    },
    'draw-diameter': {
        formula: 'Circle circumference = 2πr, area = πr² → sphere volume = 4/3πr³',
        explanation: 'Cutting the circle in half highlights diameter and radius. The 3‑D analogue is a sphere where volume depends on r³.'
    },
    'fraction-square-quarters': {
        formula: 'Each quarter area = (side/2)²',
        explanation: 'Think of a square pizza cut by two crossing lines. Each slice represents 1/4 of the pizza, showing how fractions divide a whole.'
    },
    'connect-red-points': {
        formula: "Euclid's First Postulate",
        explanation: 'Any two distinct points can be joined by a straight line.'
    },
    'circle-basics': {
        formula: "Euclid's Third Postulate",
        explanation: 'Given any segment as a radius, a circle can be drawn with one endpoint as its center.'
    },
    'identify-right-angles': {
        formula: "Euclid's Fourth Postulate",
        explanation: 'All right angles are congruent. They are fundamental for rectangles and squares and lead to the Pythagorean theorem.'
    },
    'parallel-through-point': {
        formula: "Euclid's Fifth Postulate",
        explanation: 'Through a point not on a line, exactly one line can be drawn parallel to the given line.'
    },
    'parallel-lines': {
        formula: "Euclid's Fifth Postulate",
        explanation: 'Corresponding and alternate interior angles prove the constructed line is parallel.'
    },
    'pythagorean': {
        formula: 'c² = a² + b²',
        explanation: 'In a right triangle, the square on the hypotenuse equals the sum of the squares on the other two sides.'
    },
    'place-point': {
        formula: 'Point = (x, y)',
        explanation: 'A point is named by its coordinates along the horizontal x and vertical y axes.'
    },
    'stretch-to-segment': {
        formula: 'Length = √((x₂−x₁)² + (y₂−y₁)²)',
        explanation: 'The distance formula finds how long your line segment is.'
    },
    'draw-square': {
        formula: 'Square perimeter = 4×side, area = side²',
        explanation: 'A square lives in flat 2‑D space. Stacking squares forms a cube in 3‑D, and repeating that idea hints at a 4‑D hypercube.'
    },
    'cube-dotted': {
        formula: 'Dotted lines show hidden or imaginary edges.',
        explanation: 'They are used when a side is not physically present but helpful for reasoning.'
    },
    'triangle-equal': {
        formula: 'Isosceles triangle → at least two equal sides',
        explanation: 'When two sides match, the angles opposite them are also equal.'
    },
    'equilateral-point-a': {
        formula: 'Equilateral △ → all sides equal, all angles 60°',
        explanation: 'Using equal-radius circles marks off points so each triangle side matches.'
    },
    'equilateral-circle-a': {
        formula: 'Equilateral △ → all sides equal, all angles 60°',
        explanation: 'Using equal-radius circles marks off points so each triangle side matches.'
    },
    'equilateral-point-b': {
        formula: 'Equilateral △ → all sides equal, all angles 60°',
        explanation: 'Using equal-radius circles marks off points so each triangle side matches.'
    },
    'equilateral-circle-b': {
        formula: 'Equilateral △ → all sides equal, all angles 60°',
        explanation: 'Using equal-radius circles marks off points so each triangle side matches.'
    },
    'equilateral-connect': {
        formula: 'Equilateral △ → all sides equal, all angles 60°',
        explanation: 'Using equal-radius circles marks off points so each triangle side matches.'
    },
    'right-angle-legs': {
        formula: 'Right triangle → one angle = 90°',
        explanation: 'The two legs meet at a right angle, forming the corner of the triangle.'
    },
    'right-angle-hypotenuse': {
        formula: 'c² = a² + b²',
        explanation: 'The hypotenuse is opposite the right angle and relates to the legs through the Pythagorean theorem.'
    },
    'identify-centers': {
        formula: 'Centers lie where diagonals cross',
        explanation: 'The center of a circle or polygon is equally far from key edges or vertices.'
    },
    'rectangle-from-triangles': {
        formula: 'Rectangle area = base × height',
        explanation: 'Two congruent right triangles can combine to form a rectangle.'
    },
    'triangle-vertices': {
        formula: 'Angles in a triangle sum to 180°',
        explanation: 'A triangle has three vertices whose interior angles always add up to 180°.'
    },
    'triangle-scalene': {
        formula: 'Scalene triangle → no equal sides',
        explanation: 'All three sides are different lengths so each angle is unique.'
    },
    'triangle-angle-classify': {
        formula: 'Acute < 90°; Right = 90°; Obtuse > 90°',
        explanation: 'Triangles are named by their largest angle as acute, right, or obtuse.'
    },
    'acute-angle': {
        formula: 'Acute angle < 90°',
        explanation: 'Angles smaller than a right angle are called acute.'
    },
    'obtuse-angle': {
        formula: 'Obtuse angle > 90° and < 180°',
        explanation: 'Angles bigger than a right angle but less than a straight line are obtuse. If the angle continues past 180° it becomes a reflex angle.'
    },
    'shape-identify-sequence': {
        formula: 'Circle=0 sides, triangle=3, square=4',
        explanation: 'Shapes are named by how many sides or curves they have.'
    },
    'compose-house': {
        formula: 'Composite area = sum of parts',
        explanation: 'Complex figures like a house can be built from simpler shapes.'
    },
    'shape-attributes': {
        formula: 'Triangle=3 sides, square=4, pentagon=5',
        explanation: 'Counting sides lets us identify different polygons.'
    },
    'polygon-perimeter': {
        formula: 'Perimeter = sum of all sides',
        explanation: 'Add the length of each side of a polygon to find its perimeter.'
    },
    'circle-circumference': {
        formula: 'Circumference = 2πr',
        explanation: 'The distance around a circle grows with its radius.'
    },
    'shape-area': {
        formula: 'Circle area = πr²',
        explanation: 'Close a polygon or draw a circle and the area will appear in square grid units. Use πr² for circles.'
    },
    'triangle-congruency': {
        formula: 'SSS / SAS / ASA',
        explanation: 'If all three sides, two sides and the included angle, or two angles and a side match, the triangles are congruent.'
    },
    'triangle-similarity': {
        formula: 'AA ⇒ proportional sides',
        explanation: 'Two equal angles guarantee triangles have the same shape. Their corresponding sides scale by a constant ratio.'
    },
    'square-add-points': {
        formula: '4 vertices → 4 edges',
        explanation: 'Place a point at each corner. These vertices mark where the square\'s edges will meet.'
    },
    'square-connect': {
        formula: 'Edges join vertices',
        explanation: 'Connect the corner points so each edge links two vertices at right angles, completing the square.'
    },
    'polygon-add-points': {
        formula: 'More vertices create more sides',
        explanation: 'Extra points become vertices. When connected in order they form the edges of a new polygon.'
    },
    'polygon-connect': {
        formula: 'Closed shape = polygon',
        explanation: 'A polygon forms when every vertex connects to two edges, creating a loop of straight segments.'
    },
    'circle-theorem': {
        formula: '∠AOB = 2∠ACB',
        explanation: 'An inscribed angle measures half the central angle subtending the same arc, as shown with points A, B, C and center O.'
    }
};

let flashcardDefinitions = {
    'point': 'A single spot showing a location.',
    'line': 'A straight path that goes on forever in both directions.',
    'plane': 'A flat surface that extends forever.',
    'angle': 'Two rays sharing the same starting point.',
    'right angle': 'An angle that forms a perfect square corner. Right angles make rectangles possible and are key to the Pythagorean theorem.',
    'radius': 'The distance from the center of a circle to its edge.',
    'circle': 'A round shape where every point is the same distance from the center.',
    'triangle': 'A shape made of three straight sides.',
    'tangent': 'A line that touches a circle at one point.',
    'hexagon': 'A polygon with six sides and six angles.',
    'pentagon': 'A polygon with five sides and five angles.',
    'polygon': 'A closed shape made from straight line segments.',
    'similarity': 'When two shapes have the same angles and matching side ratios.',
    'circumference': 'The distance all the way around a circle.',
    'diameter': 'A line passing through the center of a circle from side to side.',
    'perimeter': 'The distance around a two-dimensional shape.',
    'area': 'The amount of space inside a shape.',
    'hypotenuse': 'The longest side of a right triangle.',
    'square': 'A shape with four equal sides and four right angles.',
    'cube': 'A solid figure with six equal square faces.',
    'dimension': 'A measurable extent like length, width, or height.',
    'congruent triangles': 'Triangles that are identical in size and shape.',
    'SSS criterion': 'If all three sides of one triangle match those of another, the triangles are congruent.',
    'corresponding sides': 'Matching sides in congruent triangles.',
    'scalene triangle': 'A triangle with no equal sides.',
    'right triangle': 'A triangle containing a 90\u00b0 angle.',
    'acute triangle': 'A triangle where all angles are less than 90\u00b0.',
    'obtuse triangle': 'A triangle with one angle greater than 90\u00b0.',
    'isosceles': 'A triangle with two sides the same length.',
    'scalene': 'A triangle with no equal sides.',
    'vertex': 'The point where two sides meet.',
    'edge': 'A straight side where two surfaces meet.',
    'parallel': 'Lines in a plane that never meet.',
    'perpendicular': 'Lines that meet to form right angles.'
};

function updateBrainButton(){
    const brainBtn = document.getElementById('brain-btn');
    if(!brainBtn) return;
    let info = null;
    if(mode === 'kids'){
        const act = kidsActivities[currentActivity];
        info = act ? advancedInfo[act.id] : null;
    } else if(mode === 'advanced'){
        info = advancedInfo[currentExample];
    }
    if(info){
        brainBtn.style.display = 'inline-block';
    } else {
        brainBtn.style.display = 'none';
    }
}

function positionInstructionPanel(){
    const panel = document.getElementById('instruction-panel');
    const toolbar = document.getElementById('toolbar');
    if(panel && toolbar){
        const offset = toolbar.offsetHeight + 10;
        panel.style.top = offset + 'px';
    }
}

function playInstructionIntro(){
    if(instructionIntroPlayed) return;
    const panel = document.getElementById('instruction-panel');
    if(!panel) return;
    instructionIntroPlayed = true;
    panel.classList.add('intro');
    requestAnimationFrame(() => panel.classList.add('show'));
    setTimeout(() => {
        panel.classList.remove('intro');
        panel.classList.remove('show');
        positionInstructionPanel();
    }, 2000);
}

function showTutorial(){
    const box = document.getElementById('info-box');
    if(!box) return;
    box.style.display = box.style.display === 'block' ? 'none' : 'block';
}

function fadeInElements(...els){
    els.forEach(el => {
        if(el){
            el.style.opacity = 0;
            requestAnimationFrame(() => {
                el.style.opacity = 1;
            });
        }
    });
}

function setTool(tool){
    currentTool = tool;
    lineDashed = tool === 'dotted';
    selectedShapes = [];
    selectedShape = null;
    snapshotStart = null;
    selectionRect = null;
    groupOffsets = null;
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
            return new Point(s.x, s.y, s.color, s.label);
        }
        if(s instanceof LineSeg){
            return new LineSeg(s.x1, s.y1, s.x2, s.y2, s.dotted, s.color, s.weight, s.label);
        }
        if(s instanceof ArcSeg){
            return new ArcSeg(s.cx, s.cy, s.r, s.a1, s.a2, s.color, s.weight, s.dashed);
        }
        if(s instanceof AngleSnapshot){
            const v = {x: s.x, y: s.y};
            const p1 = s.getP1();
            const p2 = s.getP2();
            const a = new AngleSnapshot(v, p1, p2, s.color, s.weight);
            a.rotation = s.rotation;
            return a;
        }
        return null;
    });
}

function cloneShape(s){
    return cloneShapeList([s])[0];
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

function updateExampleVisibility(){
    if(!currentExample) return;
    const still = exampleShapes.every(s => shapes.includes(s));
    if(!still){
        currentExample = null;
        exampleShapes = [];
        feedbackElem.textContent = '';
    }
}

function saveState(){
    undoStack.push(cloneState());
    if(undoStack.length > HISTORY_LIMIT) undoStack.shift();
    redoStack = [];
}

function undo(){
    if(undoStack.length > 1){
        const current = undoStack.pop();
        redoStack.push(current);
        restoreState(undoStack[undoStack.length-1]);
        updateExampleVisibility();
        selectedShapes = [];
        selectedShape = null;
        drawingShape = null;
    }
}

function redo(){
    if(redoStack.length){
        const state = redoStack.pop();
        restoreState(state);
        undoStack.push(cloneState());
        updateExampleVisibility();
        selectedShapes = [];
        selectedShape = null;
        drawingShape = null;
    }
}
function deleteSelectedShape(){
    if(selectedShapes.length){
        selectedShapes.forEach(s => {
            const idx = shapes.indexOf(s);
            if(idx !== -1) shapes.splice(idx,1);
        });
        selectedShapes = [];
        selectedShape = null;
        saveState();
        updateExampleVisibility();
        actionChanged = false;
    } else if(feedbackElem){
        feedbackElem.textContent = 'Select a shape to delete.';
    }
}

function duplicateSelectedShapes(){
    if(selectedShapes.length){
        saveState();
        const clones = selectedShapes.map(s => {
            const c = cloneShape(s);
            if(c){
                c.move(s.x + 10, s.y + 10);
            }
            return c;
        }).filter(Boolean);
        shapes.push(...clones);
        selectedShapes = clones;
        selectedShape = clones[0] || null;
        updateExampleVisibility();
    } else if(feedbackElem){
        feedbackElem.textContent = 'Select shape(s) to duplicate.';
    }
}


function animatePageTurn(dir){
    const c = document.getElementById('canvas-container');
    const cls = dir === 'next' ? 'turn-forward' : 'turn-back';
    c.classList.add(cls);
    setTimeout(() => c.classList.remove(cls), 500);
}

function calcCanvasSize(){
    let width = window.innerWidth * (1 - CANVAS_PADDING_PCT * 2);
    let height = window.innerHeight * (1 - CANVAS_PADDING_PCT * 2);
    width -= width % 25;
    height -= height % 25;
    return {width, height};
}

function setup() {
    const container = document.getElementById('canvas-container');
    const size = calcCanvasSize();
    const canvas = createCanvas(size.width, size.height);
    canvas.parent('canvas-container');
    fillLayer = createGraphics(size.width, size.height);
    fillLayer.pixelDensity(1);
    feedbackElem = document.getElementById('instruction-panel');
    document.getElementById('tool-select').addEventListener('change', e => {
        setTool(e.target.value);
    });
    document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
        btn.addEventListener('click', () => setTool(btn.dataset.tool));
    });
    const colorInput = document.getElementById('color-input');
    const paletteEl = document.getElementById('color-palette');
    colorInput.addEventListener('input', e => {
        currentColor = e.target.value;
    });
    colorInput.addEventListener('click', () => {
        if(window.innerWidth <= 600 && paletteEl){
            paletteEl.classList.toggle('show');
        }
    });
    document.getElementById('thickness-input').addEventListener('input', e => {
        currentWeight = parseInt(e.target.value, 10) || 1;
    });
    document.getElementById('grid-toggle').addEventListener('change', e => {
        showGrid = e.target.checked;
    });
    document.getElementById('clear-btn').addEventListener('click', () => {
        shapes = [];
        selectedShapes = [];
        selectedShape = null;
        if(mode === 'kids'){
            loadKidsActivity(currentActivity);
            // loadKidsActivity already saves state
        } else {
            feedbackElem.textContent = '';
            saveState();
        }
        currentExample = null;
        exampleShapes = [];
    });
    document.getElementById('activity-select').addEventListener('change', e => {
        const val = e.target.value;
        if(!val) return;
        if(val.startsWith('kid-')){
            const idx = parseInt(val.slice(4),10);
            if(!isNaN(idx)){
                if(mode!=='kids') startKidsMode();
                loadKidsActivity(idx);
            }
        } else {
            loadExample(val);
        }
    });

    document.getElementById('undo-btn').addEventListener('click', undo);
    document.getElementById('redo-btn').addEventListener('click', redo);
    document.getElementById('delete-btn').addEventListener('click', deleteSelectedShape);
    document.getElementById('add-color-btn').addEventListener('click', () => {
        const color = prompt('Enter color hex code (#RRGGBB):', '#000000');
        if(color && /^#([0-9a-fA-F]{6})$/.test(color)){
            paletteColors.push(color);
            createColorPalette();
        }
    });

    document.addEventListener('keydown', e => {
        if(e.key === 'Escape'){
            closeDictionary();
            closeActivities();
            const adv = document.getElementById('advanced-overlay');
            if(adv) adv.style.display = 'none';
        } else if((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z'){
            undo();
            e.preventDefault();
        } else if((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))){
            redo();
            e.preventDefault();
        }
    });

    document.getElementById('next-activity').addEventListener('click', () => {
        if(mode === 'kids'){
            if(currentActivity < kidsActivities.length - 1){
                animatePageTurn('next');
                loadKidsActivity(currentActivity + 1);
            }
        } else if(mode === 'advanced' && currentExample){
            const steps = advancedExamples[currentExample];
            if(currentExampleStep < steps.length - 1){
                animatePageTurn('next');
                loadAdvancedStep(currentExampleStep + 1);
            }
        }
    });
    document.getElementById('skip-activity').addEventListener('click', () => {
        if(mode === 'kids'){
            const currCat = kidsActivities[currentActivity].category;
            let nextIdx = -1;
            for(let j = currentActivity + 1; j < kidsActivities.length; j++){
                if(kidsActivities[j].category === currCat){
                    nextIdx = j;
                    break;
                }
            }
            if(nextIdx !== -1){
                animatePageTurn('next');
                loadKidsActivity(nextIdx);
            } else {
                const skipBtn = document.getElementById('skip-activity');
                if(skipBtn) skipBtn.disabled = true;
            }
        } else if(mode === 'advanced' && currentExample){
            const steps = advancedExamples[currentExample];
            if(currentExampleStep < steps.length - 1){
                animatePageTurn('next');
                loadAdvancedStep(currentExampleStep + 1);
            }
        }
    });
    document.getElementById('prev-activity').addEventListener('click', () => {
        if(mode === 'kids'){
            if(currentActivity > 0){
                animatePageTurn('prev');
                loadKidsActivity(currentActivity - 1);
            }
        } else if(mode === 'advanced' && currentExample){
            if(currentExampleStep > 0){
                animatePageTurn('prev');
                loadAdvancedStep(currentExampleStep - 1);
            }
        }
    });

    const infoBtn = document.getElementById('info-btn');
    if(infoBtn){
        infoBtn.addEventListener('click', showTutorial);
    }

    document.getElementById('start-btn').addEventListener('click', () => transitionToMode('kids'));
    const dictBtnStart = document.getElementById('dictionary-btn');
    if(dictBtnStart){
        dictBtnStart.addEventListener('click', openDictionary);
    }
    const dictBtnCanvas = document.getElementById('dictionary-btn-canvas');
    if(dictBtnCanvas){
        dictBtnCanvas.addEventListener('click', openDictionary);
    }
    const closeBtn = document.getElementById('dict-close');
    if(closeBtn){
        closeBtn.addEventListener('click', closeDictionary);
    }
    const backBtn = document.getElementById('back-to-dictionary');
    if(backBtn){
        backBtn.addEventListener('click', showCategories);
    }
    const prevPage = document.getElementById('dict-prev');
    if(prevPage){
        prevPage.addEventListener('click', () => showBookPage(currentDictPage-1));
    }
    const nextPage = document.getElementById('dict-next');
    if(nextPage){
        nextPage.addEventListener('click', () => showBookPage(currentDictPage+1));
    }
    document.querySelectorAll('.flash-btn').forEach(btn => {
        btn.addEventListener('click', () => showFlashcard(btn.dataset.term));
    });
    const brainBtn = document.getElementById('brain-btn');
    if(brainBtn){
        brainBtn.addEventListener('click', showAdvancedInfo);
    }
    const exBtn = document.getElementById('activities-btn');
    if(exBtn){
        exBtn.addEventListener('click', openActivities);
    }
    const exClose = document.getElementById('activities-close');
    if(exClose){
        exClose.addEventListener('click', closeActivities);
    }
    const advClose = document.getElementById('advanced-close');
    if(advClose){
        advClose.addEventListener('click', () => {
            document.getElementById('advanced-overlay').style.display = 'none';
        });
    }
    const explainBtn = document.getElementById('explain-btn');
    if(explainBtn){
        explainBtn.addEventListener('click', () => {
            const expl = document.getElementById('advanced-explanation');
            if(expl.style.display === 'block'){
                expl.style.display = 'none';
            } else {
                expl.style.display = 'block';
            }
        });
    }

    createColorPalette();
    setTool('select');
    saveState();
    positionInstructionPanel();
}

function windowResized() {
    const size = calcCanvasSize();
    resizeCanvas(size.width, size.height);
    if(fillLayer){
        fillLayer.resizeCanvas(size.width, size.height);
    }
    positionInstructionPanel();
}

function mousePressed() {
    if(!isMouseOnCanvas()) return;
    if (mouseButton !== LEFT) return;
    if(mode==='kids' || mode === 'advanced'){
        const act = kidsActivities[currentActivity];
        if(act && act.id === 'identify-centers'){
            for(const s of shapes){
                if(s instanceof Circle && s.clickable){
                    if(dist(mouseX,mouseY,s.x,s.y) <= s.r + 5){
                        const expected = identifyCenterCircles[identifyCenterStep];
                        if(s === expected){
                            s.clicked = true;
                            checkKidsActivity();
                            checkAdvancedStep();
                        }
                        return;
                    }
                }
            }
        } else {
            for(const s of shapes){
                if(s instanceof Circle && s.clickable){
                    if(dist(mouseX,mouseY,s.x,s.y) <= s.r + 5){
                        s.clicked = true;
                        checkKidsActivity();
                        checkAdvancedStep();
                        return;
                    }
                }
            }
        }
    }
    if(currentTool === 'snapshot') {
        snapshotStart = {x: mouseX, y: mouseY};
    } else if (currentTool === 'point') {
        saveState();
        shapes.push(new Point(mouseX, mouseY));
        actionChanged = true;
    } else if (currentTool === 'circle') {
        saveState();
        drawingShape = new Circle(mouseX, mouseY, 0, currentColor, false, currentWeight);
        shapes.push(drawingShape);
        actionChanged = true;
    } else if (currentTool === 'line' || currentTool === 'dotted') {
        saveState();
        drawingShape = new LineSeg(mouseX, mouseY, mouseX, mouseY, lineDashed, currentColor, currentWeight);
        shapes.push(drawingShape);
        actionChanged = true;
    } else if (currentTool === 'fill') {
        bucketFill(mouseX, mouseY, currentColor);
        saveState();
    } else if (currentTool === 'select') {
        const shape = findShape(mouseX, mouseY);
        if(shape){
            if(!selectedShapes.includes(shape)){
                selectedShapes = [shape];
            }
            selectedShape = shape;
            saveState();
            const hit = shape.hitTest(mouseX, mouseY);
            if(hit){
                resizeMode = hit;
            } else if(selectedShapes.length > 1){
                groupOffsets = selectedShapes.map(s => ({dx: mouseX - s.x, dy: mouseY - s.y}));
            } else {
                dragOffset.x = mouseX - shape.x;
                dragOffset.y = mouseY - shape.y;
            }
        } else {
            selectedShapes = [];
            selectedShape = null;
            selectionRect = {x1: mouseX, y1: mouseY, x2: mouseX, y2: mouseY};
        }
    }
}

function mouseDragged() {
    if(!isMouseOnCanvas()) return;
    if (drawingShape) {
        if (drawingShape instanceof Circle) {
            drawingShape.r = dist(drawingShape.x, drawingShape.y, mouseX, mouseY);
            actionChanged = true;
        } else if (drawingShape instanceof LineSeg) {
            const snap = snapToPoint(mouseX, mouseY);
            drawingShape.x2 = snap.x;
            drawingShape.y2 = snap.y;
            actionChanged = true;
        }
    } else if (selectionRect) {
        selectionRect.x2 = mouseX;
        selectionRect.y2 = mouseY;
    } else if (groupOffsets) {
        selectedShapes.forEach((s,i) => {
            s.move(mouseX - groupOffsets[i].dx, mouseY - groupOffsets[i].dy);
        });
        actionChanged = true;
    } else if (selectedShape) {
        if (resizeMode) {
            if(selectedShape instanceof LineSeg && (resizeMode === 'start' || resizeMode === 'end')){
                const snap = snapToPoint(mouseX, mouseY);
                selectedShape.resize(resizeMode, snap.x, snap.y);
            } else {
                selectedShape.resize(resizeMode, mouseX, mouseY);
            }
            actionChanged = true;
        } else {
            selectedShape.move(mouseX - dragOffset.x, mouseY - dragOffset.y);
            actionChanged = true;
            if(symmetryDemo && selectedShape === symmetryDemo.moveDot){
                const dx = selectedShape.x - symmetryDemo.centerX;
                symmetryDemo.mirrorDot.move(symmetryDemo.centerX - dx, selectedShape.y);
            }
            if(similarityDemo && selectedShape === similarityDemo.scaleDot){
                const dx = similarityDemo.scaleDot.x - similarityDemo.anchor.x;
                const dy = similarityDemo.scaleDot.y - similarityDemo.anchor.y;
                const baseLen = Math.hypot(similarityDemo.baseVec1.x, similarityDemo.baseVec1.y);
                const scale = Math.hypot(dx, dy) / baseLen;
                similarityDemo.group.pts[1].x = similarityDemo.anchor.x + similarityDemo.baseVec1.x * scale;
                similarityDemo.group.pts[1].y = similarityDemo.anchor.y + similarityDemo.baseVec1.y * scale;
                similarityDemo.group.pts[2].x = similarityDemo.anchor.x + similarityDemo.baseVec2.x * scale;
                similarityDemo.group.pts[2].y = similarityDemo.anchor.y + similarityDemo.baseVec2.y * scale;
                similarityDemo.scaleDot.move(similarityDemo.group.pts[1].x, similarityDemo.group.pts[1].y);
            }
        }
    }
}

function mouseReleased() {
    if(!isMouseOnCanvas()) return;
    if(snapshotStart && currentTool === 'snapshot'){
        captureSnapshot(snapshotStart.x, snapshotStart.y, mouseX, mouseY);
        snapshotStart = null;
        actionChanged = true;
    }
    if(drawingShape && drawingShape instanceof LineSeg){
        let snap = snapToPoint(drawingShape.x1, drawingShape.y1);
        drawingShape.x1 = snap.x;
        drawingShape.y1 = snap.y;
        snap = snapToPoint(drawingShape.x2, drawingShape.y2);
        drawingShape.x2 = snap.x;
        drawingShape.y2 = snap.y;
        actionChanged = true;
    }
    if(selectedShape && selectedShape instanceof LineSeg && resizeMode && (resizeMode === 'start' || resizeMode === 'end')){
        const snap = snapToPoint(mouseX, mouseY);
        selectedShape.resize(resizeMode, snap.x, snap.y);
        actionChanged = true;
    }
    if(selectionRect){
        const rect = {
            x1: Math.min(selectionRect.x1, selectionRect.x2),
            y1: Math.min(selectionRect.y1, selectionRect.y2),
            x2: Math.max(selectionRect.x1, selectionRect.x2),
            y2: Math.max(selectionRect.y1, selectionRect.y2)
        };
        selectedShapes = shapes.filter(s => shapeInRect(s, rect));
        selectedShape = selectedShapes[0] || null;
        selectionRect = null;
    }
    if(groupOffsets){
        actionChanged = true;
        groupOffsets = null;
    }
    if(actionChanged){
        saveState();
        actionChanged = false;
    }
    drawingShape = null;
    resizeMode = null;
    checkKidsActivity();
    checkAdvancedStep();
}

function keyPressed() {
    if ((keyCode === DELETE || keyCode === BACKSPACE)) {
        // deleteSelectedShape already handles history tracking
        deleteSelectedShape();
    }
}

function draw() {
    clear();
    if(showGrid) drawGrid();
    image(fillLayer, 0, 0);
    updateCursor();
    for (const s of shapes) s.draw();
    if(selectionRect){
        push();
        noFill();
        stroke('blue');
        rectMode(CORNERS);
        rect(selectionRect.x1, selectionRect.y1, selectionRect.x2, selectionRect.y2);
        pop();
    }
    if(snapshotStart && currentTool === 'snapshot'){
        push();
        noFill();
        stroke('green');
        const x2 = constrain(mouseX, snapshotStart.x - 50, snapshotStart.x + 50);
        const y2 = constrain(mouseY, snapshotStart.y - 50, snapshotStart.y + 50);
        rectMode(CORNERS);
        rect(snapshotStart.x, snapshotStart.y, x2, y2);
        pop();
    }
    drawIntersections();
}

function drawGrid(){
    const step = 25;
    stroke(230, 150);
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
        if(!pg && selectedShapes.includes(this)){
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
    constructor(x, y, color = 'black', label = '') {
        this.x = x;
        this.y = y;
        this.color = color;
        this.label = label;
        this.r = 4;
    }
    draw(pg){
        const g = pg || window;
        g.push();
        g.fill(this.color);
        g.noStroke();
        g.ellipse(this.x, this.y, this.r * 2, this.r * 2);
        g.pop();
        if(this.label){
            g.push();
            g.fill(this.color);
            g.noStroke();
            g.textSize(16);
            g.textAlign(g.LEFT, g.TOP);
            g.text(this.label, this.x + this.r + 4, this.y - this.r - 4);
            g.pop();
        }
        if(!pg && selectedShapes.includes(this)) {
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
    constructor(x1,y1,x2,y2,dotted=false,color='black',weight=1,label=''){
        this.x1=x1; this.y1=y1; this.x2=x2; this.y2=y2; this.dotted=dotted;
        this.color=color; this.weight=weight; this.label=label;
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
        if(!pg && this.label){
            const midX=(this.x1+this.x2)/2;
            const midY=(this.y1+this.y2)/2 - 10;
            const len=(dist(this.x1,this.y1,this.x2,this.y2)/25).toFixed(1);
            push();
            fill('blue');
            noStroke();
            textSize(16);
            textAlign(CENTER,CENTER);
            text(`${this.label}: ${len}`,midX,midY);
            pop();
        }
        if(!pg && selectedShapes.includes(this)){
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

class ArcSeg {
    constructor(cx, cy, r, a1, a2, color='black', weight=1, dashed=false){
        this.cx = cx; this.cy = cy; this.r = r;
        this.a1 = a1; this.a2 = a2;
        this.color = color; this.weight = weight;
        this.dashed = dashed;
    }
    draw(pg){
        const g = pg || window;
        g.push();
        g.noFill();
        g.stroke(this.color);
        g.strokeWeight(this.weight);
        if(this.dashed) g.drawingContext.setLineDash([5,5]);
        g.arc(this.cx, this.cy, this.r*2, this.r*2, this.a1, this.a2);
        g.drawingContext.setLineDash([]);
        g.pop();
    }
    hitTest(){ return null; }
    move(nx, ny){ this.cx = nx; this.cy = ny; }
    resize(){}
}

class TextLabel {
    constructor(x, y, text, color = 'black'){
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
    }
    draw(pg){
        const g = pg || window;
        g.push();
        g.fill(this.color);
        g.noStroke();
        g.textSize(16);
        g.textAlign(g.CENTER, g.CENTER);
        g.text(this.text, this.x, this.y);
        g.pop();
    }
    hitTest(){ return null; }
    move(nx, ny){ this.x = nx; this.y = ny; }
    resize(){}
}

class TriangleGroup {
    constructor(A,B,C,color='black'){
        this.pts=[{x:A.x,y:A.y},{x:B.x,y:B.y},{x:C.x,y:C.y}];
        this.color=color;
        this.weight=1;
        this.highlight=false;
        this.labels=null;
    }
    get x(){ return this.pts[0].x; }
    get y(){ return this.pts[0].y; }
    draw(pg){
        const g = pg || window;
        for(let i=0;i<3;i++){
            const p1=this.pts[i];
            const p2=this.pts[(i+1)%3];
            const seg=new LineSeg(p1.x,p1.y,p2.x,p2.y,false,
                this.highlight? 'green' : this.color,this.weight,
                this.labels?this.labels[i]:''
            );
            seg.draw(pg);
        }
    }
    hitTest(px,py){
        const d1 = pointSegDist(px,py,this.pts[0],this.pts[1]);
        const d2 = pointSegDist(px,py,this.pts[1],this.pts[2]);
        const d3 = pointSegDist(px,py,this.pts[2],this.pts[0]);
        if(Math.min(d1,d2,d3) < 6) return 'body';
        return null;
    }
    move(nx,ny){
        const dx = nx - this.pts[0].x;
        const dy = ny - this.pts[0].y;
        this.pts.forEach(p=>{p.x += dx; p.y += dy;});
    }
    resize(){}
}

class AngleSnapshot {
    constructor(vertex, p1, p2, color = 'black', weight = 1){
        this.x = vertex.x;
        this.y = vertex.y;
        this.a1 = Math.atan2(p1.y - vertex.y, p1.x - vertex.x);
        this.a2 = Math.atan2(p2.y - vertex.y, p2.x - vertex.x);
        this.len1 = dist(vertex.x, vertex.y, p1.x, p1.y);
        this.len2 = dist(vertex.x, vertex.y, p2.x, p2.y);
        this.color = color;
        this.weight = weight;
        this.rotation = 0;
        const maxLen = Math.max(this.len1, this.len2) + 10;
        this.pg = createGraphics(maxLen*2, maxLen*2);
        this.pg.stroke(color);
        this.pg.strokeWeight(weight);
        this.pg.noFill();
        const ox = maxLen;
        const oy = maxLen;
        this.pg.line(ox, oy, ox + this.len1 * Math.cos(this.a1), oy + this.len1 * Math.sin(this.a1));
        this.pg.line(ox, oy, ox + this.len2 * Math.cos(this.a2), oy + this.len2 * Math.sin(this.a2));
        this.offset = {x: maxLen, y: maxLen};
    }
    getP1(){
        const ang = this.a1 + this.rotation;
        return {
            x: this.x + this.len1 * Math.cos(ang),
            y: this.y + this.len1 * Math.sin(ang)
        };
    }
    getP2(){
        const ang = this.a2 + this.rotation;
        return {
            x: this.x + this.len2 * Math.cos(ang),
            y: this.y + this.len2 * Math.sin(ang)
        };
    }
    draw(pg){
        const g = pg || window;
        g.push();
        g.translate(this.x, this.y);
        g.rotate(this.rotation);
        g.imageMode(CENTER);
        g.image(this.pg, 0, 0);
        g.pop();
        if(!pg && selectedShapes.includes(this)){
            const p1 = this.getP1();
            const p2 = this.getP2();
            push();
            stroke('orange');
            strokeWeight(2);
            line(this.x, this.y, p1.x, p1.y);
            line(this.x, this.y, p2.x, p2.y);
            fill('yellow');
            noStroke();
            rectMode(CENTER);
            rect(this.x, this.y, 6, 6);
            rect(p1.x, p1.y, 6, 6);
            rect(p2.x, p2.y, 6, 6);
            pop();
        }
    }
    hitTest(px,py){
        const p1 = this.getP1();
        const p2 = this.getP2();
        if(dist(px,py,this.x,this.y) < 6) return 'center';
        if(dist(px,py,p1.x,p1.y) < 6) return 'start';
        if(dist(px,py,p2.x,p2.y) < 6) return 'end';
        const d1 = pointSegDist(px,py,{x:this.x,y:this.y},p1);
        const d2 = pointSegDist(px,py,{x:this.x,y:this.y},p2);
        if(Math.min(d1,d2) < 3) return 'center';
        return null;
    }
    move(nx,ny){
        this.x = nx;
        this.y = ny;
    }
    resize(mode,px,py){
        if(mode==='center') this.move(px,py);
        if(mode==='start'){
            const ang = Math.atan2(py - this.y, px - this.x);
            this.rotation = ang - this.a1;
        }
        if(mode==='end'){
            const ang = Math.atan2(py - this.y, px - this.x);
            this.rotation = ang - this.a2;
        }
    }
}

function findShape(px,py){
    for(let i=shapes.length-1;i>=0;i--){
        if(shapes[i].hitTest && shapes[i].hitTest(px,py)) return shapes[i];
    }
    return null;
}

function snapToPoint(x, y, threshold = 10){
    let closest = null;
    let bestDist = threshold;
    for(const s of shapes){
        if(s instanceof Point || s instanceof Circle){
            const d = dist(x, y, s.x, s.y);
            if(d < bestDist){
                closest = {x: s.x, y: s.y};
                bestDist = d;
            }
        }
    }
    return closest || {x, y};
}

function isMouseOnCanvas(){
    return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
}

function updateCursor(){
    if(resizeMode){
        cursor('nwse-resize');
        return;
    }
    if(currentTool !== 'select'){
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

function createColorPalette(){
    const palette = document.getElementById('color-palette');
    if(!palette) return;
    palette.innerHTML = '';
    paletteColors.forEach(color => {
        const btn = document.createElement('button');
        btn.className = 'color-swatch';
        if(color === 'transparent'){
            btn.classList.add('transparent');
        }else{
            btn.style.background = color;
        }
        btn.title = color;
        btn.addEventListener('click', () => {
            currentColor = color;
            if(color !== 'transparent'){
                document.getElementById('color-input').value = color;
            }
            if(window.innerWidth <= 600 && palette){
                palette.classList.remove('show');
            }
        });
        palette.appendChild(btn);
    });
}

function populateActivitySelect(){
    const select = document.getElementById('activity-select');
    if(!select) return;
    select.innerHTML = '';
    const def = document.createElement('option');
    def.value = '';
    def.textContent = 'Activities';
    select.appendChild(def);
    if(Array.isArray(kidsActivities)){
        const groups = {};
        kidsActivities.forEach((act, i) => {
            if(!firstStepIds.has(act.id)) return;
            const cat = act.category || 'Other';
            if(!groups[cat]){
                const og = document.createElement('optgroup');
                og.label = cat;
                select.appendChild(og);
                groups[cat] = og;
            }
            const opt = document.createElement('option');
            opt.value = 'kid-' + i;
            opt.textContent = act.title || ('Activity ' + (i + 1));
            groups[cat].appendChild(opt);
        });
    }
    if(typeof advancedExamples === 'object'){
        const og = document.createElement('optgroup');
        og.label = 'Advanced';
        Object.keys(advancedExamples).sort().forEach(key => {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            og.appendChild(opt);
        });
        select.appendChild(og);
    }
}

function populateActivitiesOverlay(){
    const container = document.querySelector('#activities-overlay #activities-list');
    if(!container) return;
    container.innerHTML = '';
    const cats = {};
    if(Array.isArray(kidsActivities)){
        kidsActivities.forEach((act, i) => {
            if(!firstStepIds.has(act.id)) return;
            const cat = act.category || 'Other';
            if(!cats[cat]){
                const h = document.createElement('h3');
                h.textContent = cat;
                container.appendChild(h);
                const ul = document.createElement('ul');
                container.appendChild(ul);
                cats[cat] = ul;
            }
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.className = 'example-link';
            a.dataset.kid = i;
            a.textContent = act.title || ('Activity ' + (i + 1));
            li.appendChild(a);
            cats[cat].appendChild(li);
        });
    }
    if(typeof advancedExamples === 'object'){
        const cat = 'Advanced';
        const h = document.createElement('h3');
        h.textContent = cat;
        container.appendChild(h);
        const ul = document.createElement('ul');
        container.appendChild(ul);
        Object.keys(advancedExamples).sort().forEach(key => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.className = 'example-link';
            a.dataset.example = key;
            a.textContent = key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            li.appendChild(a);
            ul.appendChild(li);
        });
    }
    container.querySelectorAll('.example-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const kid = link.dataset.kid;
            const example = link.dataset.example;
            closeActivities();
            if(kid !== undefined){
                if(mode !== 'kids') startKidsMode();
                loadKidsActivity(parseInt(kid,10));
            } else if(example){
                if(mode !== 'advanced') startAdvancedMode();
                loadExample(example);
            }
        });
    });
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
    let fc;
    if(color === 'transparent'){
        fc = {r:0,g:0,b:0,a:0};
    }else{
        const rgb = hexToRgb(color);
        fc = {r: rgb.r, g: rgb.g, b: rgb.b, a:255};
    }
    if(target.r===fc.r && target.g===fc.g && target.b===fc.b && target.a===fc.a) {
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
            temp.pixels[pidx+3]=fc.a;
            fillLayer.pixels[pidx]=fc.r;
            fillLayer.pixels[pidx+1]=fc.g;
            fillLayer.pixels[pidx+2]=fc.b;
            fillLayer.pixels[pidx+3]=fc.a;
            stack.push([cx+1,cy]);
            stack.push([cx-1,cy]);
            stack.push([cx,cy+1]);
            stack.push([cx,cy-1]);
        }
    }
    temp.updatePixels();
    fillLayer.updatePixels();
}

function shapeInRect(shape, rect){
    if(shape instanceof Point){
        return shape.x >= rect.x1 && shape.x <= rect.x2 && shape.y >= rect.y1 && shape.y <= rect.y2;
    }
    if(shape instanceof Circle){
        return shape.x + shape.r >= rect.x1 && shape.x - shape.r <= rect.x2 &&
               shape.y + shape.r >= rect.y1 && shape.y - shape.r <= rect.y2;
    }
    if(shape instanceof LineSeg){
        const minX = Math.min(shape.x1, shape.x2);
        const maxX = Math.max(shape.x1, shape.x2);
        const minY = Math.min(shape.y1, shape.y2);
        const maxY = Math.max(shape.y1, shape.y2);
        return rect.x2 >= minX && rect.x1 <= maxX && rect.y2 >= minY && rect.y1 <= maxY;
    }
    if(shape instanceof ArcSeg){
        return rect.x2 >= shape.cx - shape.r && rect.x1 <= shape.cx + shape.r &&
               rect.y2 >= shape.cy - shape.r && rect.y1 <= shape.cy + shape.r;
    }
    if(shape instanceof TriangleGroup){
        const xs = shape.pts.map(p=>p.x);
        const ys = shape.pts.map(p=>p.y);
        return rect.x2 >= Math.min(...xs) && rect.x1 <= Math.max(...xs) &&
               rect.y2 >= Math.min(...ys) && rect.y1 <= Math.max(...ys);
    }
    if(shape instanceof AngleSnapshot){
        const p1 = shape.getP1();
        const p2 = shape.getP2();
        const xs = [shape.x, p1.x, p2.x];
        const ys = [shape.y, p1.y, p2.y];
        return rect.x2 >= Math.min(...xs) && rect.x1 <= Math.max(...xs) &&
               rect.y2 >= Math.min(...ys) && rect.y1 <= Math.max(...ys);
    }
    return false;
}

function captureSnapshot(x1,y1,x2,y2){
    const step = 25 * 2;
    if(Math.abs(x2 - x1) > step) x2 = x1 + Math.sign(x2 - x1) * step;
    if(Math.abs(y2 - y1) > step) y2 = y1 + Math.sign(y2 - y1) * step;
    const rect = {
        x1: Math.min(x1,x2),
        y1: Math.min(y1,y2),
        x2: Math.max(x1,x2),
        y2: Math.max(y1,y2)
    };
    const captured = shapes.filter(s => shapeInRect(s, rect));
    const clones = cloneShapeList(captured);
    clones.forEach(c => c.move(c.x + 10, c.y + 10));
    shapes.push(...clones);
}

function loadExample(name){
    if(name==='equilateral'){
        if(mode!=='kids') startKidsMode();
        loadKidsActivity(14);
        return;
    }
    shapes = [];
    currentExample = null;
    exampleShapes = [];
    if(advancedExamples[name]){
        currentExample = name;
        const select = document.getElementById('activity-select');
        if(select) select.value = name;
        document.getElementById('prev-activity').style.display = 'inline-block';
        document.getElementById('next-activity').style.display = 'inline-block';
        document.getElementById('skip-activity').style.display = 'inline-block';
        loadAdvancedStep(0);
        return;
    }
    feedbackElem.textContent='';
    saveState();
}

function transitionToMode(target){
    const mc = document.getElementById('mode-content');
    if(mc){
        mc.classList.remove('show');
        setTimeout(() => {
            if(target === 'kids') startKidsMode();
            else startAdvancedMode();
        }, 1000);
    } else {
        if(target === 'kids') startKidsMode();
        else startAdvancedMode();
    }
}

// ----- Mode Switching -----
function startKidsMode(){
    mode = 'kids';
    currentExample = null;
    exampleShapes = [];
    document.body.classList.add('kids');
    document.getElementById('mode-selector').style.display = 'none';
    const tb = document.getElementById('toolbar');
    const cc = document.getElementById('canvas-container');
    tb.style.display = 'flex';
    cc.style.display = 'block';
    fadeInElements(tb, cc);
    document.getElementById('prev-activity').style.display = 'inline-block';
    document.getElementById('next-activity').style.display = 'inline-block';
    document.getElementById('skip-activity').style.display = 'inline-block';
    const size = calcCanvasSize();
    resizeCanvas(size.width, size.height);
    if(fillLayer){
        fillLayer.resizeCanvas(size.width, size.height);
    }
    triangleGuide = {};
    introGuide = {};
    rightTriangleGuide = {};
    setupKidsActivities();
    populateActivitySelect();
    populateActivitiesOverlay();
    loadKidsActivity(0);
    updateBrainButton();
    positionInstructionPanel();
}

function startAdvancedMode(){
    mode = 'advanced';
    currentExample = null;
    exampleShapes = [];
    // Ensure kids activities are loaded so they appear in the activity lists
    // even before entering kids mode
    if(!kidsActivities.length){
        setupKidsActivities();
    }
    document.body.classList.remove('kids');
    document.getElementById('mode-selector').style.display = 'none';
    const tb = document.getElementById('toolbar');
    const cc = document.getElementById('canvas-container');
    tb.style.display = 'flex';
    cc.style.display = 'block';
    fadeInElements(tb, cc);
    document.getElementById('prev-activity').style.display = 'none';
    document.getElementById('next-activity').style.display = 'none';
    document.getElementById('skip-activity').style.display = 'none';
    const size = calcCanvasSize();
    resizeCanvas(size.width, size.height);
    if(fillLayer){
        fillLayer.resizeCanvas(size.width, size.height);
    }
    feedbackElem.textContent = '';
    updateBrainButton();
    setupAdvancedExamples();
    populateActivitySelect();
    populateActivitiesOverlay();
    positionInstructionPanel();
}

function setupKidsActivities(){
    kidsActivities = [
        {
            id: 'intro-plane',
            category: 'Basics',
            title: 'Welcome to the Plane',
            prompt: 'This grid is our plane—a flat surface that goes on forever in every direction.',
            autoNext: true,
            setup: function(){
                showGrid = true;
            },
            check: function(){
                return true;
            }
        },
        {
            id: 'place-point',
            category: 'Basics',
            title: 'Placing a Point',
            prompt: 'Place a point anywhere on the plane. A point marks an exact location with no size.',
            setup: function(){
                // nothing pre-drawn
            },
            check: function(){
                for(const s of shapes){
                    if(s instanceof Point){
                        introGuide.point = {x:s.x, y:s.y};
                        return true;
                    }
                }
                return false;
            }
        },
        {
            id: 'stretch-to-segment',
            category: 'Basics',
            title: 'Make a Line Segment',
            prompt: 'Draw a line segment starting from your point and extending away. A line segment is a straight path with two endpoints.',
            keepShapes: true,
            setup: function(){
                if(introGuide.point){
                    shapes.push(new Point(introGuide.point.x, introGuide.point.y, 'magenta'));
                }
            },
            check: function(){
                if(!introGuide.point) return false;
                for(const s of shapes){
                    if(s instanceof LineSeg){
                        const near1 = dist(s.x1,s.y1,introGuide.point.x,introGuide.point.y) < 10;
                        const near2 = dist(s.x2,s.y2,introGuide.point.x,introGuide.point.y) < 10;
                        if((near1 || near2) && dist(s.x1,s.y1,s.x2,s.y2) > 20){
                            return true;
                        }
                    }
                }
                return false;
            }
        },
        {
            id: 'connect-red-points',
            category: 'Basics',
            title: 'Connect Two Points',
            prompt: 'Draw a line segment connecting the two red points. A line segment is a straight 1D path between points.',
            setup: function(){
                const x1 = width/2 - 60;
                const x2 = width/2 + 60;
                const y = height/2;
                shapes.push(new Point(x1, y, 'magenta'));
                shapes.push(new Point(x2, y, 'magenta'));
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
            id: 'shape-identify-sequence',
            category: 'Basics',
            title: 'Shape Identification',
            prompt: 'Click the circle.',
            setup: function(){
                const cx = width/2;
                const cy = height/2;
                const gap = 150;
                this.step = 0;
                this.shapes = {};
                const circ = new Circle(cx - gap, cy, 40, 'gray', true);
                shapes.push(circ);
                this.shapes.circle = circ;
                const s = 80;
                shapes.push(new LineSeg(cx - s/2, cy - s/2, cx + s/2, cy - s/2, false, 'gray'));
                shapes.push(new LineSeg(cx + s/2, cy - s/2, cx + s/2, cy + s/2, false, 'gray'));
                shapes.push(new LineSeg(cx + s/2, cy + s/2, cx - s/2, cy + s/2, false, 'gray'));
                shapes.push(new LineSeg(cx - s/2, cy + s/2, cx - s/2, cy - s/2, false, 'gray'));
                const squareDot = new Circle(cx, cy, 8, 'gray', true);
                shapes.push(squareDot);
                this.shapes.square = squareDot;
                const tx = cx + gap;
                const pts = [
                    {x: tx - 40, y: cy + 40},
                    {x: tx + 40, y: cy + 40},
                    {x: tx, y: cy - 40}
                ];
                shapes.push(new LineSeg(pts[0].x, pts[0].y, pts[1].x, pts[1].y, false, 'gray'));
                shapes.push(new LineSeg(pts[1].x, pts[1].y, pts[2].x, pts[2].y, false, 'gray'));
                shapes.push(new LineSeg(pts[2].x, pts[2].y, pts[0].x, pts[0].y, false, 'gray'));
                const triDot = new Circle(tx, cy, 8, 'gray', true);
                shapes.push(triDot);
                this.shapes.triangle = triDot;
                feedbackElem.textContent = 'Click the circle.';
            },
            check: function(){
                const order = ['circle', 'square', 'triangle'];
                if(this.step < order.length){
                    const name = order[this.step];
                    if(this.shapes[name].clicked){
                        this.step++;
                        if(this.step < order.length){
                            feedbackElem.textContent = 'Now click the ' + order[this.step] + '.';
                        }
                    }
                }
                return this.step >= order.length;
            }
        },
        {
            id: 'draw-square',
            category: 'Basics',
            title: 'Construct a Square',
            prompt: 'Connect the 4 red points to make a square. This 2-D shape sets up the next cube step and even hints at a 4-D version.',
            setup: function(){
                placeSquareDots();
            },
            check: function(){
                const pts = [
                    {x: width/2 - 60, y: height/2 - 60},
                    {x: width/2 + 60, y: height/2 - 60},
                    {x: width/2 + 60, y: height/2 + 60},
                    {x: width/2 - 60, y: height/2 + 60}
                ];
                let count = 0;
                function connected(p1, p2, seg){
                    const c1 = dist(seg.x1, seg.y1, p1.x, p1.y) < 10 && dist(seg.x2, seg.y2, p2.x, p2.y) < 10;
                    const c2 = dist(seg.x1, seg.y1, p2.x, p2.y) < 10 && dist(seg.x2, seg.y2, p1.x, p1.y) < 10;
                    return c1 || c2;
                }
                for(const s of shapes){
                    if(s instanceof LineSeg){
                        for(let i=0;i<4;i++){
                            const j=(i+1)%4;
                            if(connected(pts[i],pts[j],s)){
                                count++;
                                break;
                            }
                        }
                    }
                }
                return count>=4;
            }
        },
        {
            id: 'cube-dotted',
            category: 'More About Shapes',
            title: 'Sketch a Cube',
            prompt: 'Use dotted line segments from each corner so the square looks like a 3-D cube.',
            keepShapes: true,
            setup: function(){
                // square from previous step remains
            },
            check: function(){
                const corners = [
                    {x: width/2 - 60, y: height/2 - 60},
                    {x: width/2 + 60, y: height/2 - 60},
                    {x: width/2 + 60, y: height/2 + 60},
                    {x: width/2 - 60, y: height/2 + 60}
                ];
                let lineCount = 0;
                const cornerHits = new Set();
                function near(px, py, pt){
                    return dist(px, py, pt.x, pt.y) < 10;
                }
                for(const s of shapes){
                    if(s instanceof LineSeg){
                        lineCount++;
                        for(let i=0;i<4;i++){
                            if(near(s.x1,s.y1,corners[i])||near(s.x2,s.y2,corners[i])){
                                const next=(i+1)%4;
                                const prev=(i+3)%4;
                                const other={x: near(s.x1,s.y1,corners[i])? s.x2:s.x1,
                                             y: near(s.x1,s.y1,corners[i])? s.y2:s.y1};
                                if(!near(other.x,other.y,corners[next]) && !near(other.x,other.y,corners[prev])){
                                    cornerHits.add(i);
                                }
                                break;
                            }
                        }
                    }
                }
                return lineCount>=8 && cornerHits.size===4;
            }
        },
        {
            id: 'triangle-equal',
            category: 'Basics',
            title: 'Equal Sides Triangle',
            prompt: 'Use line segments to connect the 3 red points into a triangle. A triangle is a polygon, a closed shape made from line segments. Can you make two line segments equal?',
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
            id: 'identify-right-angles',
            category: 'Basics',
            title: 'Identify Right Angles',
            prompt: 'Click each corner point of the square to find the right angles. An angle is the space between two lines that meet.',
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
            id: 'acute-angle',
            category: 'Basics',
            title: 'Acute Angle',
            prompt: 'Click the acute angle (<90\u00b0).',
            setup: function(){
                const len = 80;
                const leftX = width/2 - 80;
                const y = height/2;
                // acute angle on left (70°)
                shapes.push(new LineSeg(leftX, y, leftX + len, y));
                const acuteAngle = -70 * Math.PI / 180;
                shapes.push(new LineSeg(leftX, y, leftX + len * Math.cos(acuteAngle), y + len * Math.sin(acuteAngle)));
                shapes.push(new Circle(leftX, y, 8, 'gray', true));
                // obtuse example on right (not clickable)
                const rightX = width/2 + 80;
                const obtuseExample = 110 * Math.PI / 180;
                shapes.push(new LineSeg(rightX, y, rightX + len, y));
                shapes.push(new LineSeg(rightX, y, rightX + len * Math.cos(obtuseExample), y + len * Math.sin(obtuseExample)));
                shapes.push(new Circle(rightX, y, 8, 'gray'));
            },
            check: function(){
                for(const s of shapes){
                    if(s instanceof Circle && s.clickable && s.clicked){
                        return true;
                    }
                }
                return false;
            }
        },
        {
            id: 'obtuse-angle',
            category: 'Basics',
            title: 'Obtuse Angle',
            prompt: 'Click the obtuse angle (>90\u00b0 and <180\u00b0).',
            setup: function(){
                const len = 80;
                const leftX = width/2 - 80;
                const y = height/2;
                // acute example on left (not clickable)
                shapes.push(new LineSeg(leftX, y, leftX + len, y));
                const acuteExample = -70 * Math.PI / 180;
                shapes.push(new LineSeg(leftX, y, leftX + len * Math.cos(acuteExample), y + len * Math.sin(acuteExample)));
                shapes.push(new Circle(leftX, y, 8, 'gray'));
                // obtuse angle on right (110°)
                const rightX = width/2 + 80;
                const obtuseAngle = 110 * Math.PI / 180;
                shapes.push(new LineSeg(rightX, y, rightX + len, y));
                shapes.push(new LineSeg(
                    rightX,
                    y,
                    rightX + len * Math.cos(obtuseAngle),
                    y + len * Math.sin(obtuseAngle)
                ));
                shapes.push(new Circle(rightX, y, 8, 'gray', true));
            },
            check: function(){
                for(const s of shapes){
                    if(s instanceof Circle && s.clickable && s.clicked){
                        return true;
                    }
                }
                return false;
            }
        },
        {
            id: 'triangle-vertices',
            category: 'Basics',
            title: 'Triangle Vertices',
            prompt: 'Click each vertex of the triangle to count its corners.',
            setup: function(){
                const p = [
                    {x: width/2, y: height/2 - 80},
                    {x: width/2 - 70, y: height/2 + 60},
                    {x: width/2 + 70, y: height/2 + 60}
                ];
                shapes.push(new LineSeg(p[0].x,p[0].y,p[1].x,p[1].y));
                shapes.push(new LineSeg(p[1].x,p[1].y,p[2].x,p[2].y));
                shapes.push(new LineSeg(p[2].x,p[2].y,p[0].x,p[0].y));
                for(const pt of p){
                    shapes.push(new Circle(pt.x, pt.y, 8, 'gray', true));
                }
            },
            check: function(){
                for(const s of shapes){
                    if(s instanceof Circle && s.clickable && !s.clicked) return false;
                }
                return true;
            }
        },
        {
            id: 'parallel-through-point',
            category: 'Basics',
            title: 'Parallel Line Through a Point',
            prompt: 'Draw a line through the red point that stays parallel to the black line.',
            setup: function(){
                const y = height/2 + 50;
                const x1 = width/2 - 80;
                const x2 = width/2 + 80;
                this.base = new LineSeg(x1,y,x2,y,false);
                shapes.push(this.base);
                const px = width/2;
                const py = height/2 - 50;
                this.p = {x:px, y:py};
                shapes.push(new Circle(px,py,6,'magenta'));
            },
            check: function(){
                for(const s of shapes){
                    if(s instanceof LineSeg && s !== this.base){
                        if(lineThroughPoint(s,this.p) && areParallel(s,this.base)){
                            return true;
                        }
                    }
                }
                return false;
            }
        },
        {
            id: 'circle-basics',
            category: 'Basics',
            title: 'Draw a Circle',
            prompt: 'Step 1: Place a point anywhere on the canvas. Step 2: Draw a circle centered on that point. The radius is the distance from the center to the edge. The circumference is the distance all the way around the circle.',
            setup: function(){
                // nothing pre-drawn
            },
            check: function(){
                let pt=null;
                for(const s of shapes){
                    if(s instanceof Point){
                        pt = s;
                        break;
                    }
                }
                if(!pt) return false;
                for(const s of shapes){
                    if(s instanceof Circle){
                        if(dist(s.x,s.y,pt.x,pt.y) < 5 && s.r > 10){
                            return true;
                        }
                    }
                }
                return false;
            }
        },
        {
            id: 'right-angle-legs',
            category: 'Basics',
            title: 'Right Triangle Legs',
            prompt: 'Use the three red points to draw the two legs of a right angle. The small square marks a perfect 90\u00b0 corner.',
            keepShapes: false,
            setup: function(){
                rightTriangleGuide = {};
                const base = 160;
                const x = width/2 - base/2;
                const y = height/2 + base/2;
                rightTriangleGuide.A = {x:x, y:y};
                rightTriangleGuide.B = {x:x+base, y:y};
                rightTriangleGuide.C = {x:x+base, y:y-base};
                shapes.push(new Point(rightTriangleGuide.A.x, rightTriangleGuide.A.y, 'magenta'));
                shapes.push(new Point(rightTriangleGuide.B.x, rightTriangleGuide.B.y, 'magenta'));
                shapes.push(new Point(rightTriangleGuide.C.x, rightTriangleGuide.C.y, 'magenta'));
                const s = 20;
                shapes.push(new LineSeg(rightTriangleGuide.B.x, rightTriangleGuide.B.y, rightTriangleGuide.B.x + s, rightTriangleGuide.B.y));
                shapes.push(new LineSeg(rightTriangleGuide.B.x + s, rightTriangleGuide.B.y, rightTriangleGuide.B.x + s, rightTriangleGuide.B.y - s));
                shapes.push(new LineSeg(rightTriangleGuide.B.x + s, rightTriangleGuide.B.y - s, rightTriangleGuide.B.x, rightTriangleGuide.B.y - s));
                shapes.push(new LineSeg(rightTriangleGuide.B.x, rightTriangleGuide.B.y - s, rightTriangleGuide.B.x, rightTriangleGuide.B.y));
            },
            check: function(){
                function connected(p1,p2,seg){
                    const c1 = dist(seg.x1,seg.y1,p1.x,p1.y) < 10 && dist(seg.x2,seg.y2,p2.x,p2.y) < 10;
                    const c2 = dist(seg.x1,seg.y1,p2.x,p2.y) < 10 && dist(seg.x2,seg.y2,p1.x,p1.y) < 10;
                    return c1 || c2;
                }
                let ab = false, bc = false;
                for(const s of shapes){
                    if(s instanceof LineSeg){
                        if(connected(rightTriangleGuide.A, rightTriangleGuide.B, s)) ab = true;
                        if(connected(rightTriangleGuide.B, rightTriangleGuide.C, s)) bc = true;
                    }
                }
                return ab && bc;
            }
        },
        {
            id: 'right-angle-hypotenuse',
            category: 'Basics',
            title: 'Right Triangle Hypotenuse',
            prompt: 'Finish the right triangle by drawing the hypotenuse from point A to point C.',
            keepShapes: true,
            setup: function(){
                if(rightTriangleGuide.A){
                    shapes.push(new Point(rightTriangleGuide.A.x, rightTriangleGuide.A.y, 'magenta'));
                    shapes.push(new Point(rightTriangleGuide.B.x, rightTriangleGuide.B.y, 'magenta'));
                    shapes.push(new Point(rightTriangleGuide.C.x, rightTriangleGuide.C.y, 'magenta'));
                    const s = 20;
                    shapes.push(new LineSeg(rightTriangleGuide.B.x, rightTriangleGuide.B.y, rightTriangleGuide.B.x + s, rightTriangleGuide.B.y));
                    shapes.push(new LineSeg(rightTriangleGuide.B.x + s, rightTriangleGuide.B.y, rightTriangleGuide.B.x + s, rightTriangleGuide.B.y - s));
                    shapes.push(new LineSeg(rightTriangleGuide.B.x + s, rightTriangleGuide.B.y - s, rightTriangleGuide.B.x, rightTriangleGuide.B.y - s));
                    shapes.push(new LineSeg(rightTriangleGuide.B.x, rightTriangleGuide.B.y - s, rightTriangleGuide.B.x, rightTriangleGuide.B.y));
                }
            },
            check: function(){
                function connected(p1,p2,seg){
                    const c1 = dist(seg.x1,seg.y1,p1.x,p1.y) < 10 && dist(seg.x2,seg.y2,p2.x,p2.y) < 10;
                    const c2 = dist(seg.x1,seg.y1,p2.x,p2.y) < 10 && dist(seg.x2,seg.y2,p1.x,p1.y) < 10;
                    return c1 || c2;
                }
                for(const s of shapes){
                    if(s instanceof LineSeg){
                        if(connected(rightTriangleGuide.A, rightTriangleGuide.C, s)) return true;
                    }
                }
                return false;
            }
        },
        {
            id: 'identify-centers',
            category: 'Basics',
            title: 'Centers of Shapes',
            prompt: 'Click the center of the circle.',
            setup: function(){
                const cx = width/2;
                const cy = height/2;
                const gap = 150;
                identifyCenterStep = 0;
                identifyCenterCircles = [];
                // circle
                shapes.push(new Circle(cx - gap, cy, 40));
                const circleCenter = new Circle(cx - gap, cy, 8, 'magenta', true);
                shapes.push(circleCenter);
                // square
                const s = 80;
                shapes.push(new LineSeg(cx - s/2, cy - s/2, cx + s/2, cy - s/2, false, 'gray'));
                shapes.push(new LineSeg(cx + s/2, cy - s/2, cx + s/2, cy + s/2, false, 'gray'));
                shapes.push(new LineSeg(cx + s/2, cy + s/2, cx - s/2, cy + s/2, false, 'gray'));
                shapes.push(new LineSeg(cx - s/2, cy + s/2, cx - s/2, cy - s/2, false, 'gray'));
                const squareCenter = new Circle(cx, cy, 8, 'magenta', true);
                shapes.push(squareCenter);
                // triangle
                const tx = cx + gap;
                const pts = [
                    {x: tx - 40, y: cy + 40},
                    {x: tx + 40, y: cy + 40},
                    {x: tx, y: cy - 40}
                ];
                shapes.push(new LineSeg(pts[0].x, pts[0].y, pts[1].x, pts[1].y, false, 'gray'));
                shapes.push(new LineSeg(pts[1].x, pts[1].y, pts[2].x, pts[2].y, false, 'gray'));
                shapes.push(new LineSeg(pts[2].x, pts[2].y, pts[0].x, pts[0].y, false, 'gray'));
                const triangleCenter = new Circle(tx, cy, 8, 'magenta', true);
                shapes.push(triangleCenter);
                identifyCenterCircles.push(circleCenter, squareCenter, triangleCenter);
            },
            check: function(){
                const expected = identifyCenterCircles[identifyCenterStep];
                if(expected && expected.clicked){
                    identifyCenterStep++;
                    if(identifyCenterStep === 1){
                        feedbackElem.textContent = 'Now click the center of the square.';
                    } else if(identifyCenterStep === 2){
                        feedbackElem.textContent = 'Finally click the center of the triangle.';
                    }
                }
                return identifyCenterStep >= 3;
            }
        },
        {
            id: 'rectangle-from-triangles',
            category: 'More About Shapes',
            title: 'Rectangle from Triangles',
            prompt: 'Combine two triangles to form a rectangle using the four dots.',
            setup: function(){
                const cx = width/2;
                const cy = height/2;
                const h = 60;
                shapes.push(new Point(cx - h, cy - h, 'magenta'));
                shapes.push(new Point(cx + h, cy - h, 'magenta'));
                shapes.push(new Point(cx + h, cy + h, 'magenta'));
                shapes.push(new Point(cx - h, cy + h, 'magenta'));
            },
            check: function(){
                const pts = [
                    {x: width/2 - 60, y: height/2 - 60},
                    {x: width/2 + 60, y: height/2 - 60},
                    {x: width/2 + 60, y: height/2 + 60},
                    {x: width/2 - 60, y: height/2 + 60}
                ];
                let edges = 0;
                let diag = false;
                function connected(p1,p2,seg){
                    const c1 = dist(seg.x1,seg.y1,p1.x,p1.y) < 10 && dist(seg.x2,seg.y2,p2.x,p2.y) < 10;
                    const c2 = dist(seg.x1,seg.y1,p2.x,p2.y) < 10 && dist(seg.x2,seg.y2,p1.x,p1.y) < 10;
                    return c1 || c2;
                }
                for(const s of shapes){
                    if(s instanceof LineSeg){
                        for(let i=0;i<4;i++){
                            const j=(i+1)%4;
                            if(connected(pts[i],pts[j],s)) edges++;
                        }
                        if(connected(pts[0],pts[2],s) || connected(pts[1],pts[3],s)) diag = true;
                    }
                }
                return edges>=4 && diag;
            }
        },
        {
            id: 'triangle-scalene',
            category: 'Basics',
            title: 'Scalene Triangle',
            prompt: 'Connect the red points to form a triangle with all sides unequal.',
            setup: function(){
                this.pts = [
                    {x: width/2 - 100, y: height/2 + 80},
                    {x: width/2 + 60, y: height/2 + 40},
                    {x: width/2 + 20, y: height/2 - 90}
                ];
                for(const p of this.pts){
                    shapes.push(new Point(p.x, p.y, 'magenta'));
                }
            },
            check: function(){
                if(triangleLinesDrawn(this.pts)){
                    const [a,b,c] = this.pts;
                    const l1 = dist(a.x,a.y,b.x,b.y);
                    const l2 = dist(b.x,b.y,c.x,c.y);
                    const l3 = dist(c.x,c.y,a.x,a.y);
                    const tol = 10;
                    return Math.abs(l1-l2)>tol && Math.abs(l2-l3)>tol && Math.abs(l3-l1)>tol;
                }
                return false;
            }
        },
        {
            id: 'triangle-angle-classify',
            category: 'Basics',
            title: 'Triangle Angle Types',
            prompt: 'Click the acute triangle.',
            setup: function(){
                const cx = width/2;
                const cy = height/2;
                const gap = 150;
                this.step = 0;
                this.shapes = {};
                const aPts = [
                    {x: cx - gap - 40, y: cy + 50},
                    {x: cx - gap + 40, y: cy + 50},
                    {x: cx - gap, y: cy - 60}
                ];
                for(let i=0;i<3;i++) shapes.push(new LineSeg(aPts[i].x,aPts[i].y,aPts[(i+1)%3].x,aPts[(i+1)%3].y));
                const acuteDot = new Circle(cx - gap, cy, 8, 'gray', true);
                shapes.push(acuteDot);
                this.shapes.acute = acuteDot;

                const rPts = [
                    {x: cx - 40, y: cy + 60},
                    {x: cx + 40, y: cy + 60},
                    {x: cx + 40, y: cy - 20}
                ];
                for(let i=0;i<3;i++) shapes.push(new LineSeg(rPts[i].x,rPts[i].y,rPts[(i+1)%3].x,rPts[(i+1)%3].y));
                const rightDot = new Circle(cx, cy, 8, 'gray', true);
                shapes.push(rightDot);
                this.shapes.right = rightDot;

                const oPts = [
                    {x: cx + gap - 50, y: cy + 60},
                    {x: cx + gap + 50, y: cy + 60},
                    {x: cx + gap - 10, y: cy - 20}
                ];
                for(let i=0;i<3;i++) shapes.push(new LineSeg(oPts[i].x,oPts[i].y,oPts[(i+1)%3].x,oPts[(i+1)%3].y));
                const obtuseDot = new Circle(cx + gap, cy, 8, 'gray', true);
                shapes.push(obtuseDot);
                this.shapes.obtuse = obtuseDot;
                feedbackElem.textContent = 'Click the acute triangle.';
            },
            check: function(){
                const order = ['acute','right','obtuse'];
                if(this.step < order.length){
                    const name = order[this.step];
                    if(this.shapes[name].clicked){
                        this.step++;
                        if(this.step < order.length){
                            const nextMsg = this.step===1 ? 'Click the right triangle.' : 'Click the obtuse triangle.';
                            feedbackElem.textContent = nextMsg;
                        }
                    }
                }
                return this.step >= order.length;
            }
        },
        {
            id: 'draw-diameter',
            category: 'More About Shapes',
            title: 'Draw a Diameter',
            prompt: 'Draw a line across the circle using the red points to cut it in half.',
            setup: function(){
                const r = 80;
                const cx = width/2;
                const cy = height/2;
                shapes.push(new Circle(cx, cy, r));
                shapes.push(new Point(cx - r, cy, 'magenta'));
                shapes.push(new Point(cx + r, cy, 'magenta'));
            },
            check: function(){
                const p1 = {x: width/2 - 80, y: height/2};
                const p2 = {x: width/2 + 80, y: height/2};
                for(const s of shapes){
                    if(s instanceof LineSeg){
                        const c1 = dist(s.x1,s.y1,p1.x,p1.y) < 10 && dist(s.x2,s.y2,p2.x,p2.y) < 10;
                        const c2 = dist(s.x1,s.y1,p2.x,p2.y) < 10 && dist(s.x2,s.y2,p1.x,p1.y) < 10;
                        if(c1 || c2) return true;
                    }
                }
                return false;
            }
        },
        {
            id: 'compose-house',
            category: 'More About Shapes',
            title: 'Compose Shapes',
            prompt: 'Use the dots to build a house shape.',
            setup: function(){
                const cx = width/2;
                const cy = height/2;
                const size = 80;
                const roof = 60;
                this.points = {
                    bl: {x: cx - size/2, y: cy + size/2},
                    br: {x: cx + size/2, y: cy + size/2},
                    tr: {x: cx + size/2, y: cy - size/2},
                    tl: {x: cx - size/2, y: cy - size/2},
                    roof: {x: cx, y: cy - size/2 - roof}
                };
                for(const p of Object.values(this.points)){
                    shapes.push(new Point(p.x, p.y, 'magenta'));
                }
            },
            check: function(){
                const p = this.points;
                return hasLineBetween(p.bl,p.br) && hasLineBetween(p.br,p.tr) &&
                       hasLineBetween(p.tr,p.tl) && hasLineBetween(p.tl,p.bl) &&
                       hasLineBetween(p.tr,p.roof) && hasLineBetween(p.tl,p.roof);
            }
        },
        {
            id: 'shape-attributes',
            category: 'More About Shapes',
            title: 'Shape Attributes',
            prompt: 'Click the shape with 3 sides.',
            setup: function(){
                this.step = 0;
                this.shapes = {};
                const cx = width/2;
                const cy = height/2;
                const gap = 150;
                const tpts = [
                    {x: cx - gap - 30, y: cy + 40},
                    {x: cx - gap + 30, y: cy + 40},
                    {x: cx - gap, y: cy - 40}
                ];
                shapes.push(new LineSeg(tpts[0].x,tpts[0].y,tpts[1].x,tpts[1].y));
                shapes.push(new LineSeg(tpts[1].x,tpts[1].y,tpts[2].x,tpts[2].y));
                shapes.push(new LineSeg(tpts[2].x,tpts[2].y,tpts[0].x,tpts[0].y));
                const tri = new Circle(cx - gap, cy, 8, 'gray', true);
                shapes.push(tri);
                this.shapes.triangle = tri;
                const s = 60;
                shapes.push(new LineSeg(cx - s/2, cy - s/2, cx + s/2, cy - s/2));
                shapes.push(new LineSeg(cx + s/2, cy - s/2, cx + s/2, cy + s/2));
                shapes.push(new LineSeg(cx + s/2, cy + s/2, cx - s/2, cy + s/2));
                shapes.push(new LineSeg(cx - s/2, cy + s/2, cx - s/2, cy - s/2));
                const squareDot = new Circle(cx, cy, 8, 'gray', true);
                shapes.push(squareDot);
                this.shapes.square = squareDot;
                const pr = 40;
                const angleStep = 2 * Math.PI / 5;
                const ptx = cx + gap;
                let pentPts = [];
                for(let i=0;i<5;i++){
                    const a = -Math.PI/2 + i * angleStep;
                    pentPts.push({x: ptx + pr*Math.cos(a), y: cy + pr*Math.sin(a)});
                }
                for(let i=0;i<5;i++){
                    const j=(i+1)%5;
                    shapes.push(new LineSeg(pentPts[i].x,pentPts[i].y,pentPts[j].x,pentPts[j].y));
                }
                const pent = new Circle(ptx, cy, 8, 'gray', true);
                shapes.push(pent);
                this.shapes.pentagon = pent;
                this.names = ['triangle','square','pentagon'];
                this.sides = [3,4,5];
                feedbackElem.textContent = 'Click the shape with 3 sides.';
            },
            check: function(){
                if(this.step < this.names.length){
                    const name = this.names[this.step];
                    if(this.shapes[name].clicked){
                        this.step++;
                        if(this.step < this.names.length){
                            feedbackElem.textContent = 'Now click the shape with ' + this.sides[this.step] + ' sides.';
                        }
                    }
                }
                return this.step >= this.names.length;
            }
        },
        {
            id: 'square-add-points',
            category: 'Basics',
            title: 'Add Square Points',
            prompt: 'Place four points at the corners of a square.',
            setup: function(){
                squareGuide = {
                    pts: [
                        {x: width/2 - 60, y: height/2 - 60},
                        {x: width/2 + 60, y: height/2 - 60},
                        {x: width/2 + 60, y: height/2 + 60},
                        {x: width/2 - 60, y: height/2 + 60}
                    ]
                };
            },
            check: function(){
                let count = 0;
                for(const s of shapes){
                    if(s instanceof Point){
                        for(const p of squareGuide.pts){
                            if(dist(s.x,s.y,p.x,p.y) < 10){
                                count++; break;
                            }
                        }
                    }
                }
                return count >= 4;
            }
        },
        {
            id: 'square-connect',
            category: 'Basics',
            title: 'Connect the Square',
            prompt: 'Connect the points to complete the square.',
            keepShapes: true,
            setup: function(){
                if(squareGuide.pts){
                    for(const p of squareGuide.pts){
                        shapes.push(new Circle(p.x,p.y,6,'magenta'));
                    }
                }
            },
            check: function(){
                if(!squareGuide.pts) return false;
                for(let i=0;i<4;i++){
                    const j=(i+1)%4;
                    if(!hasLineBetween(squareGuide.pts[i], squareGuide.pts[j])) return false;
                }
                return true;
            }
        },
        {
            id: 'polygon-add-points',
            category: 'Basics',
            title: 'Add More Points',
            prompt: 'Add extra points to make a new polygon.',
            keepShapes: true,
            setup: function(){
                if(squareGuide.pts){
                    for(const p of squareGuide.pts){
                        shapes.push(new Circle(p.x,p.y,6,'magenta'));
                    }
                }
            },
            check: function(){
                let pointCount = 0;
                for(const s of shapes){
                    if(s instanceof Point) pointCount++;
                }
                return pointCount >= 5;
            }
        },
        {
            id: 'polygon-connect',
            category: 'Basics',
            title: 'Connect the Polygon',
            prompt: 'Connect all the points to finish your polygon.',
            keepShapes: true,
            setup: function(){
                if(squareGuide.pts){
                    for(const p of squareGuide.pts){
                        shapes.push(new Circle(p.x,p.y,6,'magenta'));
                    }
                }
            },
            check: function(){
                const pts = shapes.filter(s => s instanceof Point);
                if(pts.length < 5) return false;
                const counts = new Map(pts.map(p => [p,0]));
                for(const seg of shapes){
                    if(seg instanceof LineSeg){
                        for(const p of pts){
                            if(dist(seg.x1,seg.y1,p.x,p.y) < 10 || dist(seg.x2,seg.y2,p.x,p.y) < 10){
                                counts.set(p, counts.get(p)+1);
                            }
                        }
                    }
                }
                for(const v of counts.values()){
                    if(v < 2) return false;
                }
                return true;
            }
        },
        {
            id: 'fraction-square-quarters',
            category: 'More About Shapes',
            title: 'Fractions with Shapes',
            prompt: 'Pretend the square is a pizza. Cut it into four equal slices by drawing two straight lines that cross in the middle. Each slice is 1/4 of the pizza.',
            setup: function(){
                const s = 120;
                const cx = width/2;
                const cy = height/2;
                const half = s/2;
                shapes.push(new LineSeg(cx-half,cy-half,cx+half,cy-half));
                shapes.push(new LineSeg(cx+half,cy-half,cx+half,cy+half));
                shapes.push(new LineSeg(cx+half,cy+half,cx-half,cy+half));
                shapes.push(new LineSeg(cx-half,cy+half,cx-half,cy-half));
                this.left = {x: cx - half, y: cy};
                this.right = {x: cx + half, y: cy};
                this.top = {x: cx, y: cy - half};
                this.bottom = {x: cx, y: cy + half};
                shapes.push(new Circle(this.left.x,this.left.y,6,'magenta'));
                shapes.push(new Circle(this.right.x,this.right.y,6,'magenta'));
                shapes.push(new Circle(this.top.x,this.top.y,6,'magenta'));
                shapes.push(new Circle(this.bottom.x,this.bottom.y,6,'magenta'));
            },
            check: function(){
                return hasLineBetween(this.left,this.right) && hasLineBetween(this.top,this.bottom);
            }
        },
        {
            id: 'polygon-perimeter',
            category: 'More About Shapes',
            title: 'Polygon Perimeter',
            prompt: 'Draw a closed polygon. Its perimeter shows up by adding all the side lengths.',
            preserveFeedback: true,
            setup: function(){
                showGrid = true;
            },
            check: function(){
                const pts = shapes.filter(s => s instanceof Point);
                const segs = shapes.filter(s => s instanceof LineSeg);
                const p = calculatePolygonPerimeter(pts, segs);
                if(p === null){
                    feedbackElem.textContent = '';
                    return false;
                }
                const units = (p/25).toFixed(1);
                feedbackElem.textContent = 'Perimeter \u2248 ' + units + ' units';
                return true;
            }
        },
        {
            id: 'circle-circumference',
            category: 'More About Shapes',
            title: 'Circle Circumference',
            prompt: 'Draw a circle to automatically see its 2\u03C0r circumference in units.',
            preserveFeedback: true,
            setup: function(){
                showGrid = true;
            },
            check: function(){
                for(const s of shapes){
                    if(s instanceof Circle && s.r > 5){
                        const rUnits = (s.r/25).toFixed(1);
                        const cUnits = (calculateCircleCircumference(s.r)/25).toFixed(1);
                        feedbackElem.textContent = 'Radius \u2248 ' + rUnits + ' units, circumference \u2248 ' + cUnits + ' units';
                        return true;
                    }
                }
                feedbackElem.textContent = '';
                return false;
            }
        },
        {
            id: 'equilateral-point-a',
            category: 'More About Shapes',
            title: 'Equilateral Triangle',
            prompt: 'Place the first point (point A) anywhere on the canvas.',
            keepShapes: false,
            setup: function(){
                triangleGuide = {};
            },
            check: function(){
                for(const s of shapes){
                    if(s instanceof Point){
                        triangleGuide.A = {x:s.x, y:s.y};
                        if(!s.label) s.label = 'A';
                        return true;
                    }
                }
                return false;
            }
        },
        {
            id: 'equilateral-circle-a',
            category: 'More About Shapes',
            title: 'Equilateral: Circle A',
            prompt: 'Draw a circle centered at point A.',
            keepShapes: true,
            setup: function(){
                if(triangleGuide.A){
                    shapes.push(new Point(triangleGuide.A.x, triangleGuide.A.y, 'magenta'));
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
            id: 'equilateral-point-b',
            category: 'More About Shapes',
            title: 'Equilateral: Point B',
            prompt: 'Place a second point (point B) on the circle\u2019s circumference.',
            keepShapes: true,
            setup: function(){
                if(triangleGuide.A){
                    shapes.push(new Point(triangleGuide.A.x, triangleGuide.A.y, 'magenta'));
                }
            },
            check: function(){
                if(!triangleGuide.A || !triangleGuide.radius) return false;
                for(const s of shapes){
                    if(s instanceof Point){
                        const d = dist(s.x,s.y,triangleGuide.A.x,triangleGuide.A.y);
                        if(abs(d - triangleGuide.radius) < 5){
                            triangleGuide.B = {x:s.x, y:s.y};
                            if(!s.label) s.label = 'B';
                            return true;
                        }
                    }
                }
                return false;
            }
        },
        {
            id: 'equilateral-circle-b',
            category: 'More About Shapes',
            title: 'Equilateral: Circle B',
            prompt: 'Draw a second circle centered at B with the same radius as the first.',
            keepShapes: true,
            setup: function(){
                if(triangleGuide.B){
                    shapes.push(new Point(triangleGuide.B.x, triangleGuide.B.y, 'magenta'));
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
            id: 'equilateral-connect',
            category: 'More About Shapes',
            title: 'Equilateral: Connect Points',
            prompt: 'Mark the intersection of both circles as point C and connect A-B-C with line segments.',
            keepShapes: true,
            setup: function(){
                if(triangleGuide.A && triangleGuide.B && triangleGuide.radius){
                    shapes.push(new Point(triangleGuide.A.x, triangleGuide.A.y, 'magenta'));
                    shapes.push(new Point(triangleGuide.B.x, triangleGuide.B.y, 'magenta'));
                    const c1 = new Circle(triangleGuide.A.x, triangleGuide.A.y, triangleGuide.radius);
                    const c2 = new Circle(triangleGuide.B.x, triangleGuide.B.y, triangleGuide.radius);
                    triangleGuide.COptions = circleCircleIntersection(c1,c2) || [];
                }
            },
            check: function(){
                if(!triangleGuide.COptions || !triangleGuide.COptions.length) return false;
                let cShape = null;
                for(const s of shapes){
                    if(s instanceof Point){
                        for(const p of triangleGuide.COptions){
                            if(dist(s.x,s.y,p.x,p.y) < 5){
                                cShape = s;
                                triangleGuide.C = {x:s.x, y:s.y};
                                break;
                            }
                        }
                    }
                    if(cShape) break;
                }
                if(!cShape) return false;
                cShape.label = 'C';
                let cPoint = {x:cShape.x, y:cShape.y};
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
        },
        {
            id: 'shape-area',
            category: 'More About Shapes',
            title: 'Shape Area',
            prompt: 'Draw a closed polygon or circle. The area appears in square units—count squares or use πr² for a circle.',
            preserveFeedback: true,
            keepShapes: true,
            setup: function(){
                showGrid = true;
            },
            check: function(){
                for(const s of shapes){
                    if(s instanceof Circle && s.r > 5){
                        const areaUnits = (Math.PI*s.r*s.r/(25*25)).toFixed(1);
                        feedbackElem.textContent = 'Area \u2248 ' + areaUnits + ' square units';
                        return true;
                    }
                }
                const pts = shapes.filter(p => p instanceof Point);
                const segs = shapes.filter(s => s instanceof LineSeg);
                const area = calculatePolygonArea(pts, segs);
                if(area === null) return false;
                const units = (area/(25*25)).toFixed(1);
                feedbackElem.textContent = 'Area \u2248 ' + units + ' square units';
                return true;
            }
        },
    ];
}

function setupAdvancedExamples(){
    advancedExamples = {
        'triangle-congruency': [
            {
                prompt: 'Place triangle ABC on grid intersections and connect the sides.',
                setup: function(){
                    showGrid = true;
                    const snap=v=>Math.round(v/25)*25;
                    const cx = snap(width/2 - 125);
                    const cy = snap(height/2 + 75);
                    const base = 200;
                    this.pts=[
                        {x:cx, y:cy},
                        {x:cx+base/2, y:cy-150},
                        {x:cx+base, y:cy}
                    ];
                    for(const p of this.pts){
                        shapes.push(new Circle(p.x,p.y,6,'magenta'));
                    }
                },
                check: function(){
                    const done=triangleLinesDrawn(this.pts) && this.pts.every(p=>p.x%25===0 && p.y%25===0);
                    if(done && !triangleAGroup){
                        triangleAGroup = new TriangleGroup(this.pts[0],this.pts[1],this.pts[2]);
                        removeLineBetween(this.pts[0],this.pts[1]);
                        removeLineBetween(this.pts[1],this.pts[2]);
                        removeLineBetween(this.pts[2],this.pts[0]);
                        triangleAGroup.labels=['AB','BC','CA'];
                        shapes.push(triangleAGroup);
                    }
                    return done;
                }
            },
            {
                prompt: 'Replicate those side lengths with a second triangle using the new points.',
                keepShapes: true,
                setup: function(){
                    showGrid = true;
                    const snap=v=>Math.round(v/25)*25;
                    const cx = snap(width/2 + 125);
                    const cy = snap(height/2 + 75);
                    const base = 200;
                    this.pts=[
                        {x:cx, y:cy},
                        {x:cx+base/2, y:cy-150},
                        {x:cx+base, y:cy}
                    ];
                    for(const p of this.pts){
                        shapes.push(new Circle(p.x,p.y,6,'magenta'));
                    }
                },
                check: function(){
                    const done=triangleLinesDrawn(this.pts) && this.pts.every(p=>p.x%25===0 && p.y%25===0);
                    if(done && !triangleBGroup){
                        triangleBGroup = new TriangleGroup(this.pts[0],this.pts[1],this.pts[2]);
                        removeLineBetween(this.pts[0],this.pts[1]);
                        removeLineBetween(this.pts[1],this.pts[2]);
                        removeLineBetween(this.pts[2],this.pts[0]);
                        triangleBGroup.labels=['AB','BC','CA'];
                        shapes.push(triangleBGroup);
                    }
                    return done;
                }
            },
            {
                prompt: 'Drag the right triangle over the left. Matching sides highlight when they align.',
                keepShapes: true,
                setup: function(){
                    showGrid = true;
                    currentTool = 'select';
                },
                check: function(){
                    if(triangleAGroup && triangleBGroup){
                        const match=trianglesCoincide(triangleAGroup,triangleBGroup);
                        triangleAGroup.highlight=match;
                        triangleBGroup.highlight=match;
                        return match;
                    }
                    return false;
                }
            },
            {
                prompt: 'Great! The triangles are congruent by SSS.',
                keepShapes: true,
                setup: function(){showGrid = true;},
                check: function(){return true;}
            },
            {
                prompt: 'Use the points to form two triangles showing SAS.',
                keepShapes: false,
                setup: function(){
                    const cx = width/2 - 160;
                    const cy = height/2 - 100;
                    const base = 180;
                    this.pts = [
                        {x: cx, y: cy},
                        {x: cx + base, y: cy},
                        {x: cx + base/2, y: cy - 120}
                    ];
                    for(const p of this.pts){
                        shapes.push(new Circle(p.x,p.y,6,'magenta'));
                    }
                },
                check: function(){
                    return triangleLinesDrawn(this.pts);
                }
            },
            {
                prompt: 'Great! Those triangles are congruent by SAS.',
                keepShapes: true,
                setup: function(){},
                check: function(){return true;}
            },
            {
                prompt: 'Finally, connect these points for ASA.',
                keepShapes: false,
                setup: function(){
                    const cx = width/2 + 160;
                    const cy = height/2 - 100;
                    const base = 180;
                    this.pts = [
                        {x: cx, y: cy},
                        {x: cx + base/2, y: cy - 120},
                        {x: cx + base, y: cy}
                    ];
                    for(const p of this.pts){
                        shapes.push(new Circle(p.x,p.y,6,'magenta'));
                    }
                },
                check: function(){
                    return triangleLinesDrawn(this.pts);
                }
            },
            {
                prompt: 'Excellent! Triangles are congruent by ASA.',
                keepShapes: true,
                setup: function(){},
                check: function(){return true;}
            }
        ],
        'circle-theorem': [
            {
                prompt: 'Draw a circle with a center point. The center will be labelled O automatically.',
                setup: function(){
                    circleGuide = {};
                    showGrid = true;
                },
                check: function(){
                    for(const s of shapes){
                        if(s instanceof Circle && s.r > 10){
                            for(const p of shapes){
                                if(p instanceof Point && dist(p.x,p.y,s.x,s.y) < 6){
                                    if(!p.label) p.label = 'O';
                                    circleGuide.center = {x:s.x,y:s.y};
                                    circleGuide.radius = s.r;
                                    return true;
                                }
                            }
                        }
                    }
                    return false;
                }
            },
            {
                prompt: 'Mark arc AB on the circumference.',
                keepShapes: true,
                setup: function(){
                    const c = circleGuide.center;
                    const r = circleGuide.radius;
                    circleGuide.A = {x: c.x + Math.cos(Math.PI/6)*r, y: c.y + Math.sin(Math.PI/6)*r};
                    circleGuide.B = {x: c.x + Math.cos(-Math.PI/6)*r, y: c.y + Math.sin(-Math.PI/6)*r};
                    circleGuide.arcAB = new ArcSeg(c.x, c.y, r, -Math.PI/6, Math.PI/6, 'magenta');
                    shapes.push(circleGuide.arcAB);
                    shapes.push(new Point(circleGuide.A.x, circleGuide.A.y, 'magenta', 'A'));
                    shapes.push(new Point(circleGuide.B.x, circleGuide.B.y, 'magenta', 'B'));
                },
                check: function(){ return true; }
            },
            {
                prompt: 'Measure \u2220AOB.',
                keepShapes: true,
                setup: function(){},
                check: function(){
                    const ok = hasLineBetween(circleGuide.center,circleGuide.A) &&
                               hasLineBetween(circleGuide.center,circleGuide.B);
                    if(ok){
                        const ang = angleAt(circleGuide.A, circleGuide.center, circleGuide.B);
                        circleGuide.central = ang;
                        feedbackElem.textContent = `\u2220AOB = ${Math.round(toDegrees(ang))}\u00B0`;
                    }
                    return ok;
                }
            },
            {
                prompt: 'Measure \u2220ACB.',
                keepShapes: true,
                setup: function(){
                    const c = circleGuide.center;
                    const r = circleGuide.radius;
                    circleGuide.C = {x: c.x + Math.cos(Math.PI/2)*r, y: c.y + Math.sin(Math.PI/2)*r};
                    shapes.push(new Point(circleGuide.C.x, circleGuide.C.y, 'magenta', 'C'));
                },
                check: function(){
                    const ok = hasLineBetween(circleGuide.A,circleGuide.C) &&
                               hasLineBetween(circleGuide.C,circleGuide.B);
                    if(ok){
                        const ang = angleAt(circleGuide.A, circleGuide.C, circleGuide.B);
                        circleGuide.inscribed = ang;
                        feedbackElem.textContent = `\u2220ACB = ${Math.round(toDegrees(ang))}\u00B0`;
                    }
                    return ok;
                }
            },
            {
                prompt: 'Compare the measures to confirm \u2220AOB is twice \u2220ACB.',
                keepShapes: true,
                setup: function(){},
                check: function(){
                    const central = angleAt(circleGuide.A, circleGuide.center, circleGuide.B);
                    const inscribed = angleAt(circleGuide.A, circleGuide.C, circleGuide.B);
                    const cenDeg = Math.round(toDegrees(central));
                    const insDeg = Math.round(toDegrees(inscribed));
                    feedbackElem.textContent = `\u2220AOB = ${cenDeg}\u00B0, \u2220ACB = ${insDeg}\u00B0. ` +
                        `\u2220AOB is exactly twice \u2220ACB.`;
                    return Math.abs(central - 2*inscribed) < 0.1;
                }
            }
        ],
        'pythagorean': [
            {
                prompt: 'Connect the magenta points to form a right triangle.',
                autoNext: true,
                setup: function(){
                    pythGuide = {};
                    const base = 160;
                    const x = width/2 - base/2;
                    const y = height/2 + base/2;
                    pythGuide.A = {x:x, y:y};
                    pythGuide.B = {x:x+base, y:y};
                    pythGuide.C = {x:x+base, y:y-base};
                    pythGuide.pts = [pythGuide.A, pythGuide.B, pythGuide.C];
                    for(const p of pythGuide.pts){
                        shapes.push(new Circle(p.x,p.y,6,'magenta'));
                    }
                },
                check: function(){return triangleLinesDrawn(pythGuide.pts);}
            },
            {
                prompt: 'Sides are automatically labelled a, b and c.',
                autoNext: true,
                keepShapes: true,
                setup: function(){
                    const A = pythGuide.A, B = pythGuide.B, C = pythGuide.C;
                    pythGuide.labels = [
                        new Point((B.x+C.x)/2, (B.y+C.y)/2, 'blue', 'a'),
                        new Point((A.x+B.x)/2, (A.y+B.y)/2, 'blue', 'b'),
                        new Point((A.x+C.x)/2, (A.y+C.y)/2, 'blue', 'c')
                    ];
                    shapes.push(...pythGuide.labels);
                },
                check: function(){return true;}
            },
            {
                prompt: 'Construct squares on each side of the triangle.',
                autoNext: true,
                keepShapes: true,
                setup: function(){
                    const {A,B,C} = pythGuide;
                    pythGuide.squares = drawSquaresOnTriangle(A,B,C);
                },
                check: function(){return true;}
            },
            {
                prompt: 'Draw a matching triangle inside each square.',
                autoNext: true,
                keepShapes: true,
                setup: function(){},
                check: function(){
                    const {A,B,C,squares} = pythGuide;
                    if(!squares) return false;
                    return trianglesInSquaresDrawn(A,B,C,squares);
                }
            },
            {
                prompt: 'Calculate to see that a^2 + b^2 equals c^2.',
                autoNext: true,
                keepShapes: true,
                setup: function(){
                    const {A,B,C} = pythGuide;
                    pythGuide.a = dist(B.x,B.y,C.x,C.y);
                    pythGuide.b = dist(A.x,A.y,B.x,B.y);
                    pythGuide.c = dist(A.x,A.y,C.x,C.y);
                    feedbackElem.textContent =
                        `a² = ${Math.round(pythGuide.a**2)}, b² = ${Math.round(pythGuide.b**2)}, c² = ${Math.round(pythGuide.c**2)}`;
                    drawInnerTrianglesOnSquares(A,B,C,pythGuide.squares);
                },
                check: function(){return true;}
            },
            {
                prompt: 'Move the points to explore how the areas stay equal.',
                keepShapes: true,
                setup: function(){},
                check: function(){return true;}
            }
        ],
        'triangle-similarity': [
            {
                prompt: 'Construct triangle XYZ using the magenta points.',
                setup: function(){
                    showGrid = true;
                    const cx = width/2 - 160;
                    const cy = height/2 + 80;
                    const base = 180;
                    similarityGuide.src = [
                        {x: cx, y: cy},
                        {x: cx + base, y: cy},
                        {x: cx + base/2, y: cy - 130}
                    ];
                    for(const p of similarityGuide.src){
                        shapes.push(new Circle(p.x,p.y,6,'magenta'));
                    }
                },
                check: function(){
                    if(triangleLinesDrawn(similarityGuide.src)){
                        similarityGuide.angles = triangleAngles(similarityGuide.src);
                        return true;
                    }
                    return false;
                }
            },
            {
                prompt: 'Copy two angles for X\'Y\'Z\' with the new points.',
                keepShapes: true,
                setup: function(){
                    showGrid = true;
                    const cx = width/2 + 160;
                    const cy = height/2 + 80;
                    const base = 120;
                    similarityGuide.dst = [
                        {x: cx, y: cy},
                        {x: cx + base, y: cy},
                        {x: cx + base/2, y: cy - 90}
                    ];
                    for(const p of similarityGuide.dst){
                        shapes.push(new Circle(p.x,p.y,6,'magenta'));
                    }
                },
                check: function(){
                    if(triangleLinesDrawn(similarityGuide.dst)){
                        const ang = triangleAngles(similarityGuide.dst);
                        const match = Math.abs(ang[0]-similarityGuide.angles[0])<0.1 &&
                                     Math.abs(ang[1]-similarityGuide.angles[1])<0.1;
                        if(match && !similarityGuide.tri){
                            similarityGuide.tri = new TriangleGroup(similarityGuide.dst[0], similarityGuide.dst[1], similarityGuide.dst[2]);
                            similarityGuide.base1 = {x: similarityGuide.dst[1].x - similarityGuide.dst[0].x,
                                                     y: similarityGuide.dst[1].y - similarityGuide.dst[0].y};
                            similarityGuide.base2 = {x: similarityGuide.dst[2].x - similarityGuide.dst[0].x,
                                                     y: similarityGuide.dst[2].y - similarityGuide.dst[0].y};
                            removeLineBetween(similarityGuide.dst[0], similarityGuide.dst[1]);
                            removeLineBetween(similarityGuide.dst[1], similarityGuide.dst[2]);
                            removeLineBetween(similarityGuide.dst[2], similarityGuide.dst[0]);
                            shapes.push(similarityGuide.tri);
                        }
                        return match;
                    }
                    return false;
                }
            },
            {
                prompt: 'Drag the blue point to scale X\'Y\'Z\'.',
                keepShapes: true,
                setup: function(){
                    showGrid = true;
                    currentTool = 'select';
                    const p = similarityGuide.tri.pts[1];
                    const dot = new Circle(p.x, p.y, 6, 'blue');
                    shapes.push(dot);
                    similarityDemo = {
                        anchor: similarityGuide.tri.pts[0],
                        scaleDot: dot,
                        baseVec1: similarityGuide.base1,
                        baseVec2: similarityGuide.base2,
                        group: similarityGuide.tri
                    };
                },
                check: function(){return true;}
            },
            {
                prompt: 'These triangles are similar with two matching angles.',
                keepShapes: true,
                setup: function(){},
                check: function(){return true;}
            }
        ],
        'parallel-lines': [
            {
                prompt: 'Use the line tool to draw a horizontal line through points A and B.',
                setup: function(){
                    const y = height/2 + 40;
                    const x1 = width/2 - 120, x2 = width/2 + 120;
                    parallelGuide = {};
                    parallelGuide.A = {x:x1, y:y};
                    parallelGuide.B = {x:x2, y:y};
                    parallelGuide.base = {x1:x1, y1:y, x2:x2, y2:y};
                    shapes.push(new Point(x1, y, 'magenta', 'A'));
                    shapes.push(new Point(x2, y, 'magenta', 'B'));
                },
                check: function(){
                    return hasLineBetween(parallelGuide.A, parallelGuide.B);
                }
            },
            {
                prompt: 'Place point C above line AB.',
                keepShapes: true,
                setup: function(){
                    const x = width/2 - 40;
                    const y = parallelGuide.A.y - 80;
                    parallelGuide.C = {x:x, y:y};
                    shapes.push(new Circle(x, y, 6, 'magenta', 'C'));
                },
                check: function(){
                    for(const s of shapes){
                        if(s instanceof Point && dist(s.x,s.y,parallelGuide.C.x,parallelGuide.C.y) < 10){
                            return true;
                        }
                    }
                    return false;
                }
            },
            {
                prompt: 'Draw a line through C intersecting AB at point D.',
                keepShapes: true,
                setup: function(){
                    const x = width/2 + 40;
                    const y = parallelGuide.A.y;
                    parallelGuide.D = {x:x, y:y};
                    shapes.push(new Circle(x, y, 6, 'magenta', 'D'));
                },
                check: function(){
                    return hasLineBetween(parallelGuide.C, parallelGuide.D);
                }
            },
            {
                prompt: 'Use the copy shape tool to copy \u2220CDAB near point C.',
                keepShapes: true,
                setup: function(){},
                check: function(){return true;}
            },
            {
                prompt: 'Draw the new parallel line through C. It will be labelled EF automatically.',
                keepShapes: true,
                setup: function(){
                    const y = parallelGuide.C.y;
                    const x1 = width/2 - 120, x2 = width/2 + 120;
                    parallelGuide.E = {x:x1, y:y};
                    parallelGuide.F = {x:x2, y:y};
                    shapes.push(new Circle(x1, y, 6, 'magenta', 'E'));
                    shapes.push(new Circle(x2, y, 6, 'magenta', 'F'));
                },
                check: function(){
                    const line = findLineSegBetween(parallelGuide.E, parallelGuide.F);
                    if(line && lineThroughPoint(line, parallelGuide.C)){
                        if(!line.label) line.label = 'EF';
                        return true;
                    }
                    return false;
                }
            },
            {
                prompt: 'Lines AB and EF are parallel because corresponding and alternate interior angles are congruent.',
                keepShapes: true,
                setup: function(){
                    const d = parallelGuide.D;
                    const c = parallelGuide.C;
                    const off = 40;
                    shapes.push(new AngleSnapshot(d, {x:d.x-off, y:d.y}, c, 'orange', 2));
                    shapes.push(new AngleSnapshot(c, {x:c.x-off, y:c.y}, d, 'orange', 2));
                    shapes.push(new AngleSnapshot(d, c, {x:d.x+off, y:d.y}, 'green', 2));
                    shapes.push(new AngleSnapshot(c, d, {x:c.x+off, y:c.y}, 'green', 2));
                },
                check: function(){return true;}
            }
        ]
    };
}
function loadKidsActivity(i){
    currentActivity = i;
    const select = document.getElementById('activity-select');
    if(select) select.value = 'kid-' + i;
    const act = kidsActivities[i];
    if(!act.keepShapes){
        shapes = [];
    }
    currentExample = null;
    exampleShapes = [];
    symmetryDemo = null;
    act.setup();
    feedbackElem.textContent = act.prompt;
    playInstructionIntro();
    document.getElementById('prev-activity').disabled = i === 0;
    const nextBtn = document.getElementById('next-activity');
    const skipBtn = document.getElementById('skip-activity');
    nextBtn.disabled = !act.autoNext;
    const last = i === kidsActivities.length - 1;
    let hasNextSame = false;
    if(!last){
        const cat = act.category;
        for(let j = i + 1; j < kidsActivities.length; j++){
            if(kidsActivities[j].category === cat){
                hasNextSame = true;
                break;
            }
        }
    }
    if(skipBtn) skipBtn.disabled = last || !hasNextSame;
    if(last) nextBtn.disabled = true;
    saveState();
    updateBrainButton();
    if(!act.autoNext) checkKidsActivity();
}

function checkKidsActivity(){
    if(mode !== 'kids') return;
    const act = kidsActivities[currentActivity];
    if(act.check && act.check()){
        if(!act.preserveFeedback){
            feedbackElem.textContent = '\u2713';
        }
        const nextBtn = document.getElementById('next-activity');
        if(nextBtn && currentActivity < kidsActivities.length - 1){
            nextBtn.disabled = false;
        }
    }
}
function loadAdvancedStep(i){
    const steps = advancedExamples[currentExample];
    const step = steps[i];
    currentExampleStep = i;
    currentAutoNext = step.autoNext || false;
    if(!step.keepShapes){
        shapes = [];
    }
    step.setup();
    feedbackElem.textContent = step.prompt;
    playInstructionIntro();
    document.getElementById('prev-activity').disabled = i === 0;
    const nextBtn = document.getElementById('next-activity');
    nextBtn.disabled = true;
    saveState();
    checkAdvancedStep();
}

function checkAdvancedStep(){
    if(mode !== 'advanced' || !currentExample) return;
    const steps = advancedExamples[currentExample];
    const step = steps[currentExampleStep];
    if(step.check && step.check()){
        feedbackElem.textContent = '\u2713';
        const nextBtn = document.getElementById('next-activity');
        if(currentExampleStep < steps.length - 1){
            if(nextBtn) nextBtn.disabled = false;
            if(currentAutoNext){
                setTimeout(() => loadAdvancedStep(currentExampleStep + 1), 400);
            }
        }
    }
}

// ----- Additional Demonstrations -----
function placeTriangleDots(){
    const x1 = width/2 - 100;
    const x2 = width/2 + 100;
    const y1 = height/2 + 80;
    const x3 = width/2;
    const y3 = height/2 - 80;
    shapes.push(new Point(x1, y1, 'magenta'));
    shapes.push(new Point(x2, y1, 'magenta'));
    shapes.push(new Point(x3, y3, 'magenta'));
    feedbackElem.textContent = 'Connect the dots to form a triangle!';
}

function placeSquareDots(){
    const cx = width/2;
    const cy = height/2;
    const half = 60;
    const pts = [
        {x: cx - half, y: cy - half},
        {x: cx + half, y: cy - half},
        {x: cx + half, y: cy + half},
        {x: cx - half, y: cy + half}
    ];
    for(const p of pts){
        shapes.push(new Point(p.x, p.y, 'magenta'));
    }
    feedbackElem.textContent = 'Connect the dots to form a square!';
}

function drawSquareOnSide(p1, p2, opposite){
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy);
    const ux = dx / len;
    const uy = dy / len;
    const ox = opposite.x - p1.x;
    const oy = opposite.y - p1.y;
    const cross = dx * oy - dy * ox;
    const nx = cross > 0 ? -uy : uy;
    const ny = cross > 0 ? ux : -ux;
    const p3 = {x: p2.x + nx * len, y: p2.y + ny * len};
    const p4 = {x: p1.x + nx * len, y: p1.y + ny * len};
    shapes.push(new LineSeg(p1.x,p1.y,p2.x,p2.y));
    shapes.push(new LineSeg(p2.x,p2.y,p3.x,p3.y));
    shapes.push(new LineSeg(p3.x,p3.y,p4.x,p4.y));
    shapes.push(new LineSeg(p4.x,p4.y,p1.x,p1.y));
    return [p1,p2,p3,p4];
}

function drawSquaresOnTriangle(A,B,C){
    const sq1 = drawSquareOnSide(A,B,C);
    const sq2 = drawSquareOnSide(B,C,A);
    const sq3 = drawSquareOnSide(A,C,B);
    return {sq1, sq2, sq3};
}

function drawInnerTrianglesOnSquares(A,B,C,squares){
    const tris = [];
    const t1 = new TriangleGroup(A,B,squares.sq1[2],'purple');
    const t2 = new TriangleGroup(B,C,squares.sq2[2],'purple');
    const t3 = new TriangleGroup(A,C,squares.sq3[2],'purple');
    tris.push(t1,t2,t3);
    shapes.push(t1,t2,t3);
    return tris;
}

function trianglesInSquaresDrawn(A,B,C,squares){
    function triDone(sq,p1,p2){
        const [s1,s2,s3,s4] = sq;
        return (hasLineBetween(p1,s3)&&hasLineBetween(p2,s3)) ||
               (hasLineBetween(p1,s4)&&hasLineBetween(p2,s4));
    }
    return triDone(squares.sq1,A,B) && triDone(squares.sq2,B,C) && triDone(squares.sq3,A,C);
}

function drawCube(x, y, size){
    const o = size * 0.3;
    // back square
    shapes.push(new LineSeg(x + o, y - o, x + size + o, y - o));
    shapes.push(new LineSeg(x + size + o, y - o, x + size + o, y + size - o));
    shapes.push(new LineSeg(x + size + o, y + size - o, x + o, y + size - o));
    shapes.push(new LineSeg(x + o, y + size - o, x + o, y - o));
    // front square
    shapes.push(new LineSeg(x, y, x + size, y));
    shapes.push(new LineSeg(x + size, y, x + size, y + size));
    shapes.push(new LineSeg(x + size, y + size, x, y + size));
    shapes.push(new LineSeg(x, y + size, x, y));
    // connectors
    shapes.push(new LineSeg(x, y, x + o, y - o));
    shapes.push(new LineSeg(x + size, y, x + size + o, y - o));
    shapes.push(new LineSeg(x + size, y + size, x + size + o, y + size - o));
    shapes.push(new LineSeg(x, y + size, x + o, y + size - o));
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

// ----- Utility buttons on start screen -----
function hasLineBetween(p1,p2){
    const tol = 12;
    for(const s of shapes){
        if(s instanceof LineSeg){
            const c1 = dist(s.x1,s.y1,p1.x,p1.y) < tol && dist(s.x2,s.y2,p2.x,p2.y) < tol;
            const c2 = dist(s.x1,s.y1,p2.x,p2.y) < tol && dist(s.x2,s.y2,p1.x,p1.y) < tol;
            if(c1 || c2) return true;
        } else if(s instanceof TriangleGroup){
            for(let i=0;i<3;i++){
                const a=s.pts[i], b=s.pts[(i+1)%3];
                const c1 = dist(a.x,a.y,p1.x,p1.y) < tol && dist(b.x,b.y,p2.x,p2.y) < tol;
                const c2 = dist(a.x,a.y,p2.x,p2.y) < tol && dist(b.x,b.y,p1.x,p1.y) < tol;
                if(c1 || c2) return true;
            }
        }
    }
    return false;
}

function findLineSegBetween(p1,p2,tol=12){
    for(const s of shapes){
        if(s instanceof LineSeg){
            const c1 = dist(s.x1,s.y1,p1.x,p1.y) < tol && dist(s.x2,s.y2,p2.x,p2.y) < tol;
            const c2 = dist(s.x1,s.y1,p2.x,p2.y) < tol && dist(s.x2,s.y2,p1.x,p1.y) < tol;
            if(c1 || c2) return s;
        }
    }
    return null;
}

function triangleLinesDrawn(pts){
    return hasLineBetween(pts[0],pts[1]) && hasLineBetween(pts[1],pts[2]) && hasLineBetween(pts[2],pts[0]);
}

function angleAt(a, b, c){
    const ab = Math.atan2(a.y - b.y, a.x - b.x);
    const cb = Math.atan2(c.y - b.y, c.x - b.x);
    let diff = Math.abs(ab - cb);
    if(diff > Math.PI) diff = Math.PI * 2 - diff;
    return diff;
}

function toDegrees(rad){
    return rad * 180 / Math.PI;
}

function triangleAngles(pts){
    return [
        angleAt(pts[1], pts[0], pts[2]),
        angleAt(pts[0], pts[1], pts[2]),
        angleAt(pts[0], pts[2], pts[1])
    ];
}

function removeLineBetween(p1,p2){
    for(let i=shapes.length-1;i>=0;i--){
        const s=shapes[i];
        if(s instanceof LineSeg){
            const c1 = dist(s.x1,s.y1,p1.x,p1.y) < 10 && dist(s.x2,s.y2,p2.x,p2.y) < 10;
            const c2 = dist(s.x1,s.y1,p2.x,p2.y) < 10 && dist(s.x2,s.y2,p1.x,p1.y) < 10;
            if(c1 || c2){
                shapes.splice(i,1);
            }
        }
    }
}

function pointSegDist(px,py,a,b){
    const l2 = (a.x-b.x)*(a.x-b.x) + (a.y-b.y)*(a.y-b.y);
    if(l2===0) return dist(px,py,a.x,a.y);
    let t = ((px-a.x)*(b.x-a.x)+(py-a.y)*(b.y-a.y))/l2;
    t = Math.max(0,Math.min(1,t));
    const x = a.x + t*(b.x-a.x);
    const y = a.y + t*(b.y-a.y);
    return dist(px,py,x,y);
}


function trianglesCoincide(t1,t2){
    for(let i=0;i<3;i++){
        if(dist(t1.pts[i].x,t1.pts[i].y,t2.pts[i].x,t2.pts[i].y)>10) return false;
    }
    return true;
}

function lineThroughPoint(seg, pt){
    const area = abs((seg.x2 - seg.x1)*(seg.y1 - pt.y) - (seg.x1 - pt.x)*(seg.y2 - seg.y1));
    const len = dist(seg.x1, seg.y1, seg.x2, seg.y2);
    return area / len < 8;
}

function areParallel(l1, l2){
    const dx1 = l1.x2 - l1.x1;
    const dy1 = l1.y2 - l1.y1;
    const dx2 = l2.x2 - l2.x1;
    const dy2 = l2.y2 - l2.y1;
    if(dx1 === 0 && dx2 === 0) return true;
    if(dx1 === 0 || dx2 === 0) return false;
    return abs(dy1/dx1 - dy2/dx2) < 0.05;
}

function calculatePolygonPerimeter(points, segments){
    if(points.length === 0){
        const verts = [];
        const addVert = (x, y) => {
            let v = verts.find(p => dist(p.x, p.y, x, y) < 10);
            if(!v){
                v = {x, y};
                verts.push(v);
            }
        };
        for(const s of segments){
            if(s instanceof LineSeg){
                addVert(s.x1, s.y1);
                addVert(s.x2, s.y2);
            }
        }
        points = verts;
    }
    if(points.length < 3) return null;
    const near = (p, x, y) => dist(p.x, p.y, x, y) < 10;
    const adj = new Map(points.map(p => [p, []]));
    let perim = 0;
    for(const seg of segments){
        if(!(seg instanceof LineSeg)) continue;
        let p1 = null, p2 = null;
        for(const pt of points){
            if(!p1 && near(pt, seg.x1, seg.y1)) p1 = pt;
            if(!p2 && near(pt, seg.x2, seg.y2)) p2 = pt;
        }
        if(p1 && p2 && p1 !== p2){
            adj.get(p1).push(p2);
            adj.get(p2).push(p1);
            perim += dist(seg.x1, seg.y1, seg.x2, seg.y2);
        }
    }
    for(const ns of adj.values()) if(ns.length !== 2) return null;
    const start = points[0];
    let prev = null;
    let curr = start;
    const visited = new Set();
    while(true){
        visited.add(curr);
        const ns = adj.get(curr);
        const next = ns[0] === prev ? ns[1] : ns[0];
        if(!next) return null;
        prev = curr;
        curr = next;
        if(curr === start) break;
        if(visited.has(curr)) return null;
    }
    if(visited.size !== points.length) return null;
    return perim;
}

function calculatePolygonArea(points, segments){
    if(points.length === 0){
        const verts = [];
        const addVert = (x, y) => {
            let v = verts.find(p => dist(p.x, p.y, x, y) < 10);
            if(!v){
                v = {x, y};
                verts.push(v);
            }
        };
        for(const s of segments){
            if(s instanceof LineSeg){
                addVert(s.x1, s.y1);
                addVert(s.x2, s.y2);
            }
        }
        points = verts;
    }
    if(points.length < 3) return null;
    const near = (p, x, y) => dist(p.x, p.y, x, y) < 10;
    const counts = new Map(points.map(p => [p, 0]));
    for (const seg of segments) {
        if (!(seg instanceof LineSeg)) continue;
        let p1 = null, p2 = null;
        for (const pt of points) {
            if (!p1 && near(pt, seg.x1, seg.y1)) p1 = pt;
            if (!p2 && near(pt, seg.x2, seg.y2)) p2 = pt;
        }
        if (p1 && p2 && p1 !== p2) {
            counts.set(p1, counts.get(p1) + 1);
            counts.set(p2, counts.get(p2) + 1);
        }
    }
    for (const v of counts.values()) if (v < 2) return null;
    const arr = Array.from(counts.keys());
    const cx = arr.reduce((s, p) => s + p.x, 0) / arr.length;
    const cy = arr.reduce((s, p) => s + p.y, 0) / arr.length;
    arr.sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));
    let area = 0;
    for (let i = 0; i < arr.length; i++) {
        const j = (i + 1) % arr.length;
        area += arr[i].x * arr[j].y - arr[j].x * arr[i].y;
    }
    return Math.abs(area) / 2;
}

function calculateCircleCircumference(radius){
    return 2 * Math.PI * radius;
}
function openDictionary(){
    const overlay = document.getElementById('dictionary-overlay');
    if(overlay){
        overlay.style.display = 'flex';
        currentDictPage = 0;
        showCategories();
    }
}

function closeDictionary(){
    const overlay = document.getElementById('dictionary-overlay');
    if(overlay){
        overlay.style.display = 'none';
    }
    if(dimensionInterval){
        clearInterval(dimensionInterval);
        dimensionInterval = null;
    }
}

function openActivities(){
    populateActivitiesOverlay();
    if(window.innerWidth < 768){
        const overlay = document.getElementById('activities-overlay');
        if(overlay){
            overlay.style.display = 'flex';
        }
    }
}

function closeActivities(){
    const overlay = document.getElementById('activities-overlay');
    if(overlay){
        overlay.style.display = 'none';
    }
}

function showBookPage(idx){
    const pages = document.querySelectorAll('#dictionary-book .dict-page');
    if(!pages.length) return;
    if(idx < 0 || idx >= pages.length) return;
    pages.forEach((p,i)=>{p.style.display = i===idx ? 'block' : 'none';});
    currentDictPage = idx;
    const prev = document.getElementById('dict-prev');
    const next = document.getElementById('dict-next');
    if(prev) prev.style.display = idx===0 ? 'none' : 'inline-block';
    if(next) next.style.display = idx===pages.length-1 ? 'none' : 'inline-block';
}

function showCategories(){
    const book = document.getElementById('dictionary-book');
    if(book) book.style.display = 'block';
    showBookPage(currentDictPage);
    const card = document.getElementById('flashcard');
    if(dimensionInterval){
        clearInterval(dimensionInterval);
        dimensionInterval = null;
    }
    if(card) card.style.display = 'none';
}

function showFlashcard(term){
    const book = document.getElementById('dictionary-book');
    if(book) book.style.display = 'none';
    const card = document.getElementById('flashcard');
    if(!card) return;
    if(dimensionInterval){
        clearInterval(dimensionInterval);
        dimensionInterval = null;
    }
    card.style.display = 'block';
    document.getElementById('flashcard-title').textContent = term.charAt(0).toUpperCase() + term.slice(1);
    const defEl = document.getElementById('flashcard-definition');
    if(defEl){
        defEl.textContent = flashcardDefinitions[term] || '';
    }
    const canvas = document.getElementById('flashcard-canvas');
    if(canvas){
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        if(term === 'point'){
            ctx.beginPath();
            ctx.arc(canvas.width/2, canvas.height/2, 5, 0, Math.PI*2);
            ctx.fill();
        } else if(term === 'line'){
            ctx.beginPath();
            ctx.moveTo(20, canvas.height/2);
            ctx.lineTo(canvas.width-20, canvas.height/2);
            ctx.stroke();
        } else if(term === 'plane'){
            ctx.strokeRect(40, 40, canvas.width-80, canvas.height-80);
        } else if(term === 'angle' || term === 'right angle'){
            const vx = 60;
            const vy = canvas.height - 60;
            ctx.beginPath();
            ctx.moveTo(vx, vy);
            ctx.lineTo(vx, vy - 80);
            ctx.moveTo(vx, vy);
            ctx.lineTo(vx + 80, vy);
            ctx.stroke();
            if(term === 'right angle'){
                ctx.strokeRect(vx, vy - 20, 20, 20);
            }
        } else if(term === 'radius'){
            ctx.beginPath();
            ctx.arc(canvas.width/2, canvas.height/2, 60, 0, Math.PI*2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(canvas.width/2, canvas.height/2);
            ctx.lineTo(canvas.width/2 + 60, canvas.height/2);
            ctx.stroke();
        } else if(term === 'circle' || term === 'circumference'){
            ctx.beginPath();
            ctx.arc(canvas.width/2, canvas.height/2, 60, 0, Math.PI*2);
            ctx.stroke();
        } else if(term === 'triangle' || term === 'similarity'){
            ctx.beginPath();
            ctx.moveTo(canvas.width/2, 40);
            ctx.lineTo(canvas.width-40, canvas.height-40);
            ctx.lineTo(40, canvas.height-40);
            ctx.closePath();
            ctx.stroke();
            if(term === 'similarity'){
                ctx.strokeStyle = 'blue';
                ctx.beginPath();
                ctx.moveTo(canvas.width/2 - 40, 80);
                ctx.lineTo(canvas.width-80, canvas.height-80);
                ctx.lineTo(80, canvas.height-80);
                ctx.closePath();
                ctx.stroke();
            }
        } else if(term === 'hypotenuse'){
            ctx.beginPath();
            ctx.moveTo(40, canvas.height-40);
            ctx.lineTo(canvas.width-40, canvas.height-40);
            ctx.lineTo(40, 40);
            ctx.closePath();
            ctx.stroke();
            ctx.strokeStyle = 'red';
            ctx.beginPath();
            ctx.moveTo(canvas.width-40, canvas.height-40);
            ctx.lineTo(40, 40);
            ctx.stroke();
            ctx.strokeStyle = '#000';
            ctx.strokeRect(40, canvas.height-60, 20, 20);
        } else if(term === 'square'){
            const size = canvas.width-100;
            ctx.strokeRect(50, 50, size, size);
        } else if(term === 'pentagon'){
            const cx = canvas.width/2;
            const cy = canvas.height/2;
            const r = 60;
            ctx.beginPath();
            for(let i=0;i<5;i++){
                const angle = Math.PI*2*i/5 - Math.PI/2;
                const x = cx + r*Math.cos(angle);
                const y = cy + r*Math.sin(angle);
                if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
            }
            ctx.closePath();
            ctx.stroke();
        } else if(term === 'hexagon'){
            const cx = canvas.width/2;
            const cy = canvas.height/2;
            const r = 60;
            ctx.beginPath();
            for(let i=0;i<6;i++){
                const angle = Math.PI/3*i - Math.PI/6;
                const x = cx + r*Math.cos(angle);
                const y = cy + r*Math.sin(angle);
                if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
            }
            ctx.closePath();
            ctx.stroke();
        } else if(term === 'cube'){
            const size = 70;
            // front square in solid lines
            ctx.strokeRect(50, 70, size, size);
            // back square and connecting edges with dashed lines
            ctx.setLineDash([5,5]);
            ctx.strokeRect(80, 40, size, size);
            ctx.beginPath();
            ctx.moveTo(50, 70);
            ctx.lineTo(80, 40);
            ctx.moveTo(50 + size, 70);
            ctx.lineTo(80 + size, 40);
            ctx.moveTo(50, 70 + size);
            ctx.lineTo(80, 40 + size);
            ctx.moveTo(50 + size, 70 + size);
            ctx.lineTo(80 + size, 40 + size);
            ctx.stroke();
            ctx.setLineDash([]);
        } else if(term === 'polygon'){
            const cx = canvas.width/2;
            const cy = canvas.height/2;
            const r = 60;
            ctx.beginPath();
            for(let i=0;i<4;i++){
                const angle = Math.PI*2*i/4 - Math.PI/4;
                const x = cx + r*Math.cos(angle);
                const y = cy + r*Math.sin(angle);
                if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
            }
            ctx.closePath();
            ctx.stroke();
        } else if(term === 'congruent triangles' || term === 'SSS criterion' || term === 'corresponding sides'){
            ctx.beginPath();
            ctx.moveTo(40, canvas.height-40);
            ctx.lineTo(80, 40);
            ctx.lineTo(120, canvas.height-40);
            ctx.closePath();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(130, canvas.height-40);
            ctx.lineTo(170, 40);
            ctx.lineTo(canvas.width-40, canvas.height-40);
            ctx.closePath();
            ctx.stroke();
        } else if(term === 'diameter'){
            ctx.beginPath();
            ctx.arc(canvas.width/2, canvas.height/2, 60, 0, Math.PI*2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(canvas.width/2 - 60, canvas.height/2);
            ctx.lineTo(canvas.width/2 + 60, canvas.height/2);
            ctx.stroke();
        } else if(term === 'perimeter'){
            ctx.strokeRect(40, 40, canvas.width-80, canvas.height-80);
            ctx.setLineDash([5,5]);
            ctx.strokeRect(50, 50, canvas.width-100, canvas.height-100);
            ctx.setLineDash([]);
        } else if(term === 'area'){
            ctx.strokeRect(40, 40, canvas.width-80, canvas.height-80);
            ctx.fillStyle = 'rgba(0,0,255,0.2)';
            ctx.fillRect(40, 40, canvas.width-80, canvas.height-80);
        } else if(term === 'dimension'){
            let step = 0;
            const drawSteps = [
                () => drawDimension1(ctx, canvas),
                () => drawDimension2(ctx, canvas),
                () => drawDimension3(ctx, canvas)
            ];
            drawSteps[step]();
            dimensionInterval = setInterval(() => {
                step = (step + 1) % drawSteps.length;
                ctx.clearRect(0,0,canvas.width,canvas.height);
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                drawSteps[step]();
            }, 1000);
        } else if(term === 'tangent'){
            ctx.beginPath();
            ctx.arc(canvas.width/2, canvas.height/2, 50, 0, Math.PI*2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(canvas.width/2-60, canvas.height/2+50);
            ctx.lineTo(canvas.width/2+60, canvas.height/2+50);
            ctx.stroke();
        }
    }
}

function showAdvancedInfo(){
    const overlay = document.getElementById('advanced-overlay');
    const formulaEl = document.getElementById('advanced-formula');
    const explEl = document.getElementById('advanced-explanation');
    const canvas = document.getElementById('advanced-canvas');
    const image = document.getElementById('advanced-image');
    if(!overlay || !formulaEl || !explEl || !canvas || !image) return;
    explEl.style.display = 'none';
    let act = null;
    let info = null;
    if(mode === 'kids'){
        act = kidsActivities[currentActivity];
        info = act ? advancedInfo[act.id] : null;
    } else if(mode === 'advanced'){
        info = advancedInfo[currentExample];
    }
    if(info){
        formulaEl.innerHTML = info.formula;
        explEl.textContent = info.explanation;
        if(mode === 'kids'){
            if(act.id === 'intro-plane'){
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0,0,canvas.width,canvas.height);
                drawCubeImage(ctx);
                canvas.style.display = 'block';
                image.style.display = 'none';
            } else if(act.id === 'obtuse-angle'){
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0,0,canvas.width,canvas.height);
                drawReflexAngleImage(ctx);
                canvas.style.display = 'block';
                image.style.display = 'none';
            } else if(act.id === 'draw-square' || act.id === 'enhanced-square'){
                image.src = '4d.png';
                image.alt = 'illustration of a 4D human shape.';
                image.style.display = 'block';
                canvas.style.display = 'none';
            } else {
                canvas.style.display = 'none';
                image.style.display = 'none';
            }
        } else {
            canvas.style.display = 'none';
            image.style.display = 'none';
        }
    } else {
        formulaEl.textContent = 'No additional information for this step.';
        explEl.textContent = '';
        canvas.style.display = 'none';
        image.style.display = 'none';
    }
    overlay.style.display = 'flex';
}

function drawCubeImage(ctx){
    const size = 70;
    ctx.strokeRect(50, 70, size, size);
    ctx.setLineDash([5,5]);
    ctx.strokeRect(80, 40, size, size);
    ctx.beginPath();
    ctx.moveTo(50, 70);
    ctx.lineTo(80, 40);
    ctx.moveTo(50 + size, 70);
    ctx.lineTo(80 + size, 40);
    ctx.moveTo(50, 70 + size);
    ctx.lineTo(80, 40 + size);
    ctx.moveTo(50 + size, 70 + size);
    ctx.lineTo(80 + size, 40 + size);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawReflexAngleImage(ctx){
    const cx = 100;
    const cy = 100;
    const len = 60;
    const angle = 4 * Math.PI / 3; // 240°
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + len, cy);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + len * Math.cos(angle), cy + len * Math.sin(angle));
    ctx.stroke();
    ctx.setLineDash([5,3]);
    ctx.beginPath();
    ctx.arc(cx, cy, 40, 0, angle, false);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawArrowhead(ctx, x, y, x0, y0){
    const headlen = 8;
    const angle = Math.atan2(y - y0, x - x0);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - headlen * Math.cos(angle - Math.PI / 6),
               y - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x - headlen * Math.cos(angle + Math.PI / 6),
               y - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
}

function drawArrowLine(ctx, x1, y1, x2, y2){
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    drawArrowhead(ctx, x2, y2, x1, y1);
    drawArrowhead(ctx, x1, y1, x2, y2);
}



function drawDimension1(ctx, canvas){
    const y = canvas.height / 2;
    drawArrowLine(ctx, 20, y, canvas.width - 20, y);
}

function drawDimension2(ctx, canvas){
    const midX = canvas.width / 2;
    const midY = canvas.height / 2;
    drawArrowLine(ctx, 20, midY, canvas.width - 20, midY);
    drawArrowLine(ctx, midX, canvas.height - 20, midX, 20);
}

function drawDimension3(ctx, canvas){
    const midX = canvas.width / 2;
    const midY = canvas.height / 2;
    drawArrowLine(ctx, 20, midY, canvas.width - 20, midY);
    drawArrowLine(ctx, midX, canvas.height - 20, midX, 20);
    drawArrowLine(ctx, midX - 40, midY + 40, midX + 40, midY - 40);
}

