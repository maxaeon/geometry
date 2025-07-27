(function(global){
  class ConstraintGraph {
    constructor(){
      this.clear();
    }
    clear(){
      this.nextId = 1;
      this.nodes = new Map(); // shape -> node
      this.constraints = [];
    }
    registerShape(shape){
      if(this.nodes.has(shape)) return this.nodes.get(shape);
      let type = 'unknown';
      if(global.Point && shape instanceof global.Point) type = 'point';
      else if(global.LineSeg && shape instanceof global.LineSeg) type = 'line';
      else if(global.Circle && shape instanceof global.Circle) type = 'circle';
      const node = { id: this.nextId++, shape, type };
      this.nodes.set(shape, node);
      return node;
    }
    registerShapes(list){
      if(Array.isArray(list)) list.forEach(s => this.registerShape(s));
    }
    addConstraint(type, shapes){
      const nodes = shapes.map(s => this.nodes.get(s)).filter(Boolean);
      if(nodes.length === shapes.length){
        this.constraints.push({ type, nodes });
      }
    }
    addEquality(a,b){
      this.addConstraint('equality',[a,b]);
    }
    addIntersection(a,b,point){
      if(!this.nodes.has(point)) this.registerShape(point);
      this.addConstraint('intersection',[a,b,point]);
    }
  }
  global.ConstraintGraph = ConstraintGraph;
  global.constraintGraph = new ConstraintGraph();
})(window);
