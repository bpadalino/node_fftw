require.paths.unshift(__dirname + '/../lib/fftw3/build/default') ;
require.paths.unshift(__dirname + '/../lib/fftw3') ;
require.paths.unshift(__dirname + '/deps/express') ;

var sys = require('sys'),
    complex = require('complex'),
    fftw3 = require('fftw3'),
    exec = require('child_process').exec,
    express = require('express') ;

// Setup the server as well as some extras
var analysis = express.createServer();

var tone = [] ;
var fft = [] ;
var numPoints = 64 ;
var design = new fftw3.plan(numPoints) ;

function createTone(dang, num) {
    tone = [] ;
    var ang = 0.0, len = num || numPoints ;
    for(i=0;i<len;i++) {
        tone[i] = complex.fromPolar(ang) ;
        ang += dang ;
    }
} ;

analysis.use(express.bodyDecoder());
analysis.use(express.methodOverride());
analysis.use(express.cookieDecoder());
analysis.use(express.session());

// Initialize some values
createTone(Math.PI/10,numPoints) ;
design.execute( complex.flatten(tone), function(x) {
    fft = complex.inflate(x) ;
}) ;

analysis.post( '/', function(req, res) {
    if( req.body.dang ) {
        createTone( parseFloat(req.body.dang), parseFloat(req.body.points) ) ;
        design = new fftw3.plan(parseFloat(req.body.points)) ;
        design.execute(complex.flatten(tone), function(x) {
            fft = complex.inflate(x) ;
            res.redirect('/') ;
        }) ;
    }
    else {
        res.redirect('/') ;
    }
}) ;

analysis.get( '/', function(req, res) {
    res.render( 'index.jade', {
        locals: {
            title: 'index',
            fftpoints: complex.dB(fft)
        }
    }) ;
}) ;

analysis.listen(3030) ;
console.log( "analysis running at http://localhost:3030") ;

// Automatically start up a browser instance to the app
var child = exec('open http://localhost:3030/', function(error) {
    if( error != null ) {
        console.log( 'exec error: ' + error ) ;
    }
}) ;