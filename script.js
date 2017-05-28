'use strict';

function Vec3(x, y, z) {
  this.x = x != null ? x : 0;
  this.y = y != null ? y : 0;
  this.z = z != null ? z : 0;
}

// load canvas
var canvas = document.createElement('canvas');
document.body.insertBefore(canvas, document.body.childNodes[0]);
//canvas.height = window.innerHeight;
//canvas.width = window.innerWidth;
canvas.width=500;
canvas.height=500;
var ctx = canvas.getContext('2d');
var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
var data = imageData.data;

// define raymarching/fractal variables
var power = 8,
maxRaySteps = 50,
minimumStepDistance = 0.001,
iterations = 8,
bailout = 8,
camera = new Vec3(0,-5,0),
up = new Vec3(0,0,1),
focus = new Vec3(0,0,0),
viewWidth = 6,
sample = 16,
viewHeight = viewWidth,
anim;

window.onload = function() {
  anim = requestAnimationFrame(render);
}

// given an upsample rate (1 is full res, 16 is 1/16th res), render the frame
var render = function() {
  if(sample>=1) {
    var stepX = sample;
    var stepY = sample; 
    var i=0;
    // iterate through each pixel on the canvas
    for(let x=0; x<canvas.width; x+=stepX) {
      for(let y=0; y<canvas.height; y+=stepY){
        // convert x,y to a direction vector - note, this will be improved heavily in the future
        var x0 = ( x - (canvas.width/2) ) * ( viewWidth/(2*canvas.width) );
        var y0 = ( (canvas.width/2) - y ) * ( viewHeight/(2*canvas.height ) );
        //var x0 = 
        //var y0 = 
        //var z0 = 

        var direction = normalize(new Vec3(x0, 5, y0));
        var color = march(camera, direction);

        /*data[i++] = color*255;
        data[i++] = color*255;
        data[i++] = color*255;   
        data[i++] = 255;*/
        //ctx.putImageData(imageData, 0, 0);
        ctx.beginPath();
        ctx.fillStyle = 'hsl(' + 255*color + ',' + 80 + '%,' + 80 + '%)';
        ctx.fillRect(x,y,stepX,stepY);
        ctx.stroke();
      }
    }
    sample/=4;
    requestAnimationFrame(render);
  }
  else {
    cancelAnimationFrame(anim);
  }
}

// given a 'from' vector and a direction vector, march along the resulting ray
var march = function(from, direction) {
  var totalDistance = 0.0;
  for (var steps=0; steps < maxRaySteps; steps++) {
    var position = new Vec3(from.x + (direction.x*totalDistance),
                            from.y + (direction.y*totalDistance),
                            from.z + (direction.z*totalDistance));
    var distance = DE(position);
    totalDistance += distance;
    if (distance < minimumStepDistance) break;
  }
  return 1-(steps/maxRaySteps);
}

// estimates the minimum distance from a given position to the mandelbulb
var DE = function(position) {
  var z = position;
  var dr = 1.0;
  var r = 0.0;
  for (let i = 0; i < iterations; i++) {
    r = norm(z);
    if (r>bailout) break;

    var theta = Math.atan2(Math.sqrt(Math.pow(z.x,2) + Math.pow(z.y,2)),z.z);
    var phi = Math.atan2(z.y,z.x);
    dr = ( Math.pow(r, power-1.0)*power*dr ) + 1.0;

    var zr = Math.pow(r, power);
    theta = theta*power;
    phi = phi*power;
    
    z = scalarMultiply(new Vec3(Math.sin(theta)*Math.cos(phi), Math.sin(phi)*Math.sin(theta), Math.cos(theta)), zr)
    z = vectorAdd(z, position);
  }
  return 0.5*Math.log(r)*r/dr;
}

// =================================
// = define some vector operations =
// =================================

var scalarMultiply = function(vec, scalar) {
  return new Vec3(vec.x*scalar,vec.y*scalar,vec.z*scalar);
}

var vectorAdd = function(vec1, vec2) {
  return new Vec3(vec1.x + vec2.x, vec1.y + vec2.y, vec1.z + vec2.z);
}

var normalize = function(vec) {
  var norm = Math.sqrt(Math.pow(vec.x,2) + Math.pow(vec.y,2) + Math.pow(vec.z,2));
  return scalarMultiply(vec,1/norm);
}

var norm = function(vec) {
  return Math.sqrt(Math.pow(vec.x,2) + Math.pow(vec.y,2) + Math.pow(vec.z,2))
}

var crossProduct = function(vec1,vec2) {

}