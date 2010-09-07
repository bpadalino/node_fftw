var sys = require('sys') ;
    fftw3 = require('./build/default/fftw3') ;

// Setup the bounds for the iterations
const MIN = 20, MAX = 21 ;

// Iterate through some FFTs now
var i, x, tone, design ;
for(i=MIN;i<MAX;i++) {
    tone = new Array(Math.pow(2,i)) ;
    for(x=0;x<tone.length;x+=2) {
        tone[x]   = Math.cos(2*Math.PI*i*1/100) ;
        tone[x+1] = Math.sin(2*Math.PI*i*1/100) ;
    }
    design = new fftw3.plan(Math.pow(2,i-1)) ;
    design.execute(tone, function(x) {
        sys.puts( "Completed " + x.length ) ;
    } ) ;
}