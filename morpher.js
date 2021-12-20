'use strict';

const Interpolation = {
    LINEAR: 'LINEAR',
    COSINE: 'COSINE'
};

class Color {
    constructor(r, g, b, a) {
        this._r = r;
        this._g = g;
        this._b = b;
        this._a = a;
    }
    get r() { return this._r; } set r(r) { this._r = r; }
    get g() { return this._g; } set g(g) { this._g = g; }
    get b() { return this._b; } set b(b) { this._b = b; }
    get a() { return this._a; } set a(a) { this._a = a; }

    multicolor(){            
        if (this.r == 1 && this.g == 0 && this.b == 0) {
            this.r = 0; this.g = 1;
        } else if (this.r == 0 && this.g == 1 && this.b == 0) {
            this.g = 0; this.b = 1;
        } else if (this.r == 0 && this.g == 0 && this.b == 1) {
            this.b = 0; this.r = 1; this.g = 1;
        } else if (this.r == 1 && this.g == 1 && this.b == 0) {
            this.b = 1; this.r = 1; this.g = 0;
        } else if (this.r == 1 && this.g == 0 && this.b == 1) {
            this.b = 1; this.r = 0; this.g = 1;
        } else if (this.r == 0 && this.g == 1 && this.b == 1) {
            this.b = 1; this.r = 1; this.g = 1;
        } else if (this.r == 1 && this.g == 1 && this.b == 1) {
            this.b = 0; this.r = 1; this.g = 0;
        } else {
            this.r = 1; this.g = 0; this.b = 0;
        }
    }
}

class Vertex {
    constructor(x, y, alias){
        this._x = x;
        this._y = y;
        this._z = 0.0;
        this._alias = ""; 
        return this;
    }
    get x(){return this._x;} set x(xVal){this._x = xVal;}
    get y(){return this._y;} set y(yVal){this._y = yVal;}
    get z(){return this._z;} set z(zVal){this._z = zVal;}
    get alias(){return this._alias;} set(n){this._alias = n;}
}

function calculateVertexDistance(vertex1, vertex2){
    return Math.sqrt((vertex1.x-vertex2.x)*(vertex1.x-vertex2.x) + (vertex1.y-vertex2.y)*(vertex1.y-vertex2.y));
}

class Polygon {
    constructor(n_divisions, verticesPositions, color){
        this._n_divisions = n_divisions;
        this._verticesPositions = verticesPositions;
        this._color = color;
        return this;
    }
    get n_divisions(){return this._n_divisions;} set n_divisions(n){this._n_divisions = n;}
    get verticesPositions(){return this._verticesPositions;}
    get color(){return this._color;} set color(color){this._color=color;}

    loadPolygon(vertices, indexes, color, multicolor){
        var i = 0; var indexOffset = indexes.length/2;
        for(; i < this.n_divisions; i++){
            var x = this.verticesPositions[i].x;
            vertices.push(x);

            var y = this.verticesPositions[i].y;
            vertices.push(y);

            var z = this.verticesPositions[i].z;
            vertices.push(z);
            
            if(multicolor) this.color.multicolor();

            color.push(this.color.r);
            color.push(this.color.g);
            color.push(this.color.b);
        }

        for(i = 0; i < this.n_divisions; i++){
            indexes.push(indexOffset+i);
            indexes.push(indexOffset + ((i+1)%this.n_divisions) );
        }
    }
}

class Interpolator {
    constructor(polyOrigin, polyDest, color, nSteps){
        this._polyOrigin = polyOrigin;
        this._polyDest = polyDest;
        this._color = color;
        this._nSteps = nSteps;
    } 
    get polyOrigin(){return this._polyOrigin;} set polyOrigin(poly){this._polyOrigin = poly;}
    get polyDest(){return this._polyDest;} set polyDest(poly){this._polyDest = poly;}
    get color(){return this._color;} set color(color){this._color = color;}
    get nSteps(){return this._nSteps;} set nSteps(n){this._nSteps = n;}

    calculateFrames(){
        let step = 1/this.nSteps;
        var frames = {}, minimal_distant_vertices = {}, alocated = {};
        var i, j;
        for(i = 0; i < this.polyDest.n_divisions; i++) alocated[i] = false;
        for(i = 0; i < this.polyOrigin.n_divisions; i++){
            let minDist =  1000, prevIndex = -1;
            for(j = 0; j < this.polyDest.n_divisions; j++){
                if(
                    calculateVertexDistance(this.polyOrigin.verticesPositions[i], this.polyDest.verticesPositions[j]) < minDist 
                    && alocated[j] == false
                ){ 
                        if(prevIndex > -1) alocated[prevIndex] = false; 
                        prevIndex = j;
                        minDist = calculateVertexDistance(this.polyOrigin.verticesPositions[i], this.polyDest.verticesPositions[j]);
                        minimal_distant_vertices[i] = new Vertex(this.polyDest.verticesPositions[j].x, this.polyDest.verticesPositions[j].y, this.polyDest.verticesPositions[j].z, this.polyDest.verticesPositions[j].alias); 
                        alocated[j] = true;
                }
            }
        }
        for(i = 0; i < this.nSteps; i++){
            var verticesInterpolated = [];
            for(j = 0; j < this.polyOrigin.n_divisions; j++){
                let vertex = new Vertex( this.polyOrigin.verticesPositions[j].x*(1 - i*step) + minimal_distant_vertices[j].x*(i*step),
                                         this.polyOrigin.verticesPositions[j].y*(1 - i*step) + minimal_distant_vertices[j].y*(i*step), 
                                         this.polyOrigin.verticesPositions[j].z*(1 - i*step) + minimal_distant_vertices[j].z*(i*step) );
                verticesInterpolated.push(vertex);

            }
            frames[i] = new Polygon(this.polyOrigin.n_divisions, verticesInterpolated, this.color);
        }
        return frames;
    }
}

let gl,
    canvas,
    program,
    indices_edges = [],
    colors = [],
    vertices = [],
    pointsVAO,
    pointsVertexBuffer,
    pointsColorBuffer,
    pointsIndexBuffer,
    pointList,
    displacementX = 0,
    displacementY = 0,
    //strokeControl = 8,
    control,
    date = new Date(),
    speed = 10,
    gui;

//renderingMode = 'POINTS';

function getShader(id) {
    const script = document.getElementById(id);
    const shaderName = script.text.trim();

    let shader;
    if (script.type === 'x-shader/x-vertex') {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else if (script.type === 'x-shader/x-fragment') {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, shaderName);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initProgram() {
    const vertexShader = getShader('vertex-shader');
    const fragmentShader = getShader('fragment-shader');

    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Could not initialize shaders. Please, try harder.');
    }

    gl.useProgram(program);

    program.vertexPosition = gl.getAttribLocation(program, 'vertexPosition');
    program.vertexColor = gl.getAttribLocation(program, 'vertexColor');
}

const poly1vertices = new Array(new Vertex(0.0, 0.0, 1), 
                                new Vertex(0.0, 0.75, 2), 
                                new Vertex(0.85, 0.0, 3), 
                                new Vertex(0.0, -0.75, 4), 
                                new Vertex(-0.85, 0.0, 5)
                                );
var poly1 = new Polygon(poly1vertices.length, poly1vertices, new Color(1.0, 1.25, 0.25, 1.0));

const poly2vertices = new Array(new Vertex(0.90, 0.90, 1), 
                                new Vertex(0.75, 0.05, 2), 
                                new Vertex(0.90, -0.85, 3), 
                                new Vertex(-0.90, -0.85, 4), 
                                new Vertex(0.05, -0.30, 5)
                                );
var poly2 = new Polygon(poly2vertices.length, poly2vertices, new Color(0.25, 0.25, 1.0, 1.0));
var steps = 125;
var interpol = new Interpolator(poly1, poly2, new Color(1.0, 0.00, 0.25, 1.0), steps);
var frames = interpol.calculateFrames();
var i = 0;

var indices_edges_not_interpolated = [], vertices_not_interpolated = [], colors_not_interpolated = [];

function initBuffers() {
    
    poly1.loadPolygon(vertices, indices_edges, colors, false);
    poly2.loadPolygon(vertices, indices_edges, colors, false);

    vertices_not_interpolated = vertices; indices_edges_not_interpolated = indices_edges; colors_not_interpolated = colors;

    frames[i].loadPolygon(vertices, indices_edges, colors, false);
    
    //VAO stands for Vertex Array Object
    pointsVAO = gl.createVertexArray();
    gl.bindVertexArray(pointsVAO);

    pointsVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pointsVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    // Provide instructions to VAO
    gl.vertexAttribPointer(program.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.vertexPosition);

    pointsColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pointsColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(program.vertexColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.vertexColor);

    pointsIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pointsIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices_edges), gl.DYNAMIC_DRAW);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    
    const updatedVertices = [] /*vertices_not_interpolated*/, updatedIndices =[] /*indices_edges_not_interpolated*/, updatedColors = []/*colors_not_interpolated*/;
    frames[parseInt(i)].loadPolygon(updatedVertices, updatedIndices, updatedColors, false);
    if(playing==true) i+=1/speed; if(i>=steps)i = 0;

    gl.bindVertexArray(pointsVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, pointsVertexBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0/* vertices_not_interpolated.length*/, new Float32Array(updatedVertices), 0, updatedVertices.length /*- vertices_not_interpolated.length*/);
    gl.bindBuffer(gl.ARRAY_BUFFER, pointsColorBuffer);
    //gl.bufferSubData(gl.ARRAY_BUFFER, 0 /*colors_not_interpolated.length*/, new Float32Array(updatedColors), 0, updatedColors.length /*- colors_not_interpolated.length*/);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pointsIndexBuffer);
    gl.drawElements(gl.LINES, indices_edges.length, gl.UNSIGNED_SHORT, 0);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

var playing = false;    

function speedbutton() {
    this.speed = speed;
};

function createGUI(speedbutton) {
    var gui = new dat.GUI({ name: 'Controller!' });

    var playpausebutton = {
        add:function(){
            if(!playing)
                playing=true;
            else 
                playing=false;
            }
        }; 
    
    gui.add(playpausebutton, 'add').name("play/pause");
    gui.add(speedbutton, 'speed', 0.01, 10, 0.01).onChange(function(){speed = speedbutton.speed;});

    return gui;
}

var previous_timestamp, first_timestamp;

function render() {
    /*var new_date = new Date();
    var timestamp = new_date.getTime(), elapsed_time = timestamp - previous_timestamp;
    while(elapsed_time < speed){
        if((elapsed_time) > speed) {
            previous_timestamp = timestamp;
            i++;
            if(i == steps) i = 0;    
            console.log(updatedIndices.length);
            break;
        }
    }*/
    requestAnimationFrame(render);   
    draw();
}

function init() {

    first_timestamp = date.getTime();
    previous_timestamp = first_timestamp;

    canvas = document.getElementById("webgl-canvas");
    if (!canvas) {
        alert("No canvas was obtained");
    }
    gl = canvas.getContext('webgl2');
    if (!gl) {
        alert("No webgl-context was obtained");
    }

    gl.clearColor(0, 0, 0, 0.90);
    gl.enable(gl.DEPTH_TEST);

    //var polyControl = new createPolygonController(drawingOne.n_divisions);
    var speedControl = new speedbutton();
    gui = createGUI(speedControl);

    //var listeners = new create_listeners();

    initProgram();
    initBuffers(8);
    render();
}

window.onload = init;