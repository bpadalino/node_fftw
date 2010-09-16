// Model a complex value as (x,y) cartesian coordinates
var Complex = exports.Complex = function(x, y) {
    this.x = x ;
    this.y = y ;
}

// Calculate magnitude in dB
Complex.prototype.dB = function() {
    return Math.log(this.magSquared())/Math.log(10) ;
}

// Calculate magnitude
Complex.prototype.mag = function() {
    return Math.sqrt(this.x*this.x + this.y*this.y) ;
}

// Calculate the angle
Complex.prototype.angle = function() {
    return Math.atan2(this.y,this.x) ;
}

// Convert to an array of polar coordinates
Complex.prototype.toPolar = function() {
    return { angle: this.angle(), mag: this.mag() } ;
}

// Calculate magnitude squared
Complex.prototype.magSquared = function() {
    return this.x*this.x + this.y*this.y ;
}

// Create an array from a complex number
Complex.prototype.toArray = function() {
    return [this.x, this.y] ;
}

// Create an array of complex values from a flattened array
Complex.inflate = exports.inflate = function(arr) {
    var i, retval = [] ;
    for(i=0;i<arr.length;i+=2) {
        retval.push(new Complex(arr[i],arr[i+1])) ;
    }
    return retval ;
}

// Create a flat array from an array of complex values
Complex.flatten = exports.flatten = function(arr) {
    var i, retval = [] ;
    for(i=0;i<arr.length;i++) {
        retval = retval.concat(arr[i].toArray()) ;
    }
    return retval ;
}

// String representation of complex value in the form x+yi
Complex.prototype.toString = function() {
    var retval = '' + this.x ;
    if( this.y >= 0 ) retval += '+' ;
    retval += this.y + 'i' ;
    return retval ;
}

// Calculate the magnitudes of an array of complex values
Complex.mag = exports.mag = function(arr) {
    var i, retval = [] ;
    for(i=0;i<arr.length;i++) {
        retval.push(arr[i].mag()) ;
    }
    return retval ;
}

// Calculate the angle of an array of complex values
Complex.angle = exports.angle = function(arr) {
    var i, retval = [] ;
    for(i=0;i<arr.length;i++) {
        retval.push(arr[i].angle()) ;
    }
    return retval ;
}

// Convert an array of complex values in cartesian coordinates to an array of polar coordinates
Complex.toPolar = exports.toPolar = function(arr) {
    var i, retval = [] ;
    for(i=0;i<arr.length;i++) {
        retval.push(arr[i].toPolar()) ;
    }
    return retval ;
}

// Calculate the magnitude squared of an array of complex values
Complex.magSquared = exports.magSquared = function(arr) {
    var i, retval = [] ;
    for(i=0;i<arr.length;i++) {
        retval.push(arr[i].magSquared()) ;
    }
    return retval ;
}

Complex.dB = exports.dB = function(arr) {
    var i, retval = [] ;
    for(i=0;i<arr.length;i++) {
        retval.push(arr[i].dB()) ;
    }
    return retval ;
}

// Create a complex value from an angle and [optional magnitude] or json object with angle/mag
Complex.fromPolar = exports.fromPolar = function(ang,mag) {
    var angle, scale ;
    if( ang.angle ) {
        angle = ang.angle ;
        scale = ang.scale || 1.0 ;
    }
    else {
        angle = ang ;
        scale = mag || 1.0 ;
    }
    var retval = new Complex(scale*Math.cos(angle),scale*Math.sin(angle)) ;
    return retval ;
}