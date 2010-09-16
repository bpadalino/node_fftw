require.paths.unshift(__dirname + '/../lib/fftw3/build/default') ;
require.paths.unshift(__dirname + '/../lib/fftw3') ;

var sys = require('sys'),
    fftw3 = require('fftw3'),
    complex = require('complex') ;

// Setup the bounds for the iterations
const ITERS = 1, MIN = 22, MAX = 23 ;

// Iterate through some FFTs now
var i, x, j, tone, design ;
for(j=0;j<ITERS;j++) {
    var f = (j+30) ;
    var dang, ang = 0 ;
    for(i=MIN;i<MAX;i++) {
        tone = [] ;
        sys.puts( "Tone" ) ;
        dang = 2.0*Math.PI/Math.pow(2,i-1) ;
        for(x=0;x<Math.pow(2,i-1);x++) {
            tone.push( complex.fromPolar(ang) ) ;
            ang += dang ;
            //sys.puts( tone[tone.length-1] ) ;
        }
        
        // // Perform the FFT
        // fftplan = new fftw3.plan(Math.pow(2,i-1)) ;
        // fftplan.execute(complex.flatten(tone), function(x) {
        //     var result = complex.inflate(x) ;
        //     sys.puts( "FFT power result" ) ;
        //     //sys.puts( sys.inspect(complex.dB(result)) ) ;
        // } ) ;
        
    }
}