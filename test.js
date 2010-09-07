var sys = require('sys') ;
    fftw3 = require('./build/default/fftw3') ;

// Setup the bounds for the iterations
const ITERS = 1, MIN = 10, MAX = 11 ;

// Iterate through some FFTs now
var i, x, j, tone, design ;
for(j=0;j<ITERS;j++) {
    var f = (j+30) ;
    for(i=MIN;i<MAX;i++) {
        tone = new Array(Math.pow(2,i)) ;
        sys.puts( "Tone" ) ;
        for(x=0;x<tone.length;x+=2) {
            tone[x]   = Math.cos(2*Math.PI*i*3*x/tone.length) ;
            tone[x+1] = Math.sin(2*Math.PI*i*3*x/tone.length) ;
            var pm = tone[x+1] < 0 ? '' : '+' ;
            sys.puts( '' + tone[x] + pm + tone[x+1] + 'i' ) ;
        }
        fftplan = new fftw3.plan(Math.pow(2,i-1)) ;
        fftplan.execute(tone, function(x) {
            //sys.puts( "Completed " + x.length/2 ) ;
            sys.puts( "FFT result" ) ;
            for(yy=0;yy<x.length;yy+=2) {
                var pm = x[yy+1] < 0 ? '' : '+' ;
                sys.puts( '' + x[yy] + pm + x[yy+1] + 'i') ;
            }
        } ) ;
    }
}