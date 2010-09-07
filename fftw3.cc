#include <node.h>
#include <node_events.h>
#include <fftw3.h>
#include <stdlib.h>
#include <cstdio>

#define GET_ARG(ARGS,I,TYPE,VAR)                                        \
    if (ARGS.Length() <= (I) || !ARGS[I]->Is##TYPE())                   \
        return ThrowException(Exception::TypeError(                     \
            String::New("Argument " #I ": " #TYPE " required" ))) ;     \
    Local<TYPE> VAR = Local<TYPE>::Cast(args[I]) ;

using namespace v8;
using namespace node;

class fftw3 : ObjectWrap {
    
    private:
        int length ;
        int done ;
        fftw_plan plan ;
        fftw_complex *in ;
        fftw_complex *out ;
        
    public:
        
        // Function Templates
        static Persistent<FunctionTemplate> sft ;
        
        // Initialization
        static void Init(Handle<Object> target) {
            HandleScope scope ;
            
            Local<FunctionTemplate> t = FunctionTemplate::New(New) ;
            
            sft = Persistent<FunctionTemplate>::New(t) ;
            sft->InstanceTemplate()->SetInternalFieldCount(1) ;
            sft->SetClassName(String::NewSymbol("fftw3")) ;
            
            NODE_SET_PROTOTYPE_METHOD(sft, "execute", execute) ;
            
            target->Set(String::NewSymbol("plan"), sft->GetFunction()) ;
            
        }
        
        // State holding
        fftw3(int _length) {
            length = _length ;
            in = (fftw_complex*)fftw_malloc(sizeof(fftw_complex)*length) ;
            out = (fftw_complex*)fftw_malloc(sizeof(fftw_complex)*length) ;
            plan = fftw_plan_dft_1d(length, in, out, FFTW_FORWARD, FFTW_ESTIMATE);
        }
        
        // Any extra deletes
        ~fftw3() {
            fftw_destroy_plan(plan) ;
            fftw_free(in) ;
            fftw_free(out) ;
        }
        
        void execute() {
            fftw_execute(plan) ;
        }
        
        static Handle<Value> New(const Arguments &args) {
            HandleScope scope ;
            GET_ARG(args,0,Number,num) ;
            fftw3 *design = new fftw3((int)(num->NumberValue())) ;
            design->Wrap(args.This()) ;
            return args.This() ;
        }
        
        // The baton that we want to keep and pass around
        struct baton_t {
            fftw3 *design ;
            Persistent<Function> cb ;
        } ;
        
        // Setting up the event loop
        static Handle<Value> execute(const Arguments &args) {
            HandleScope scope ;
            
            GET_ARG(args,0,Array,array) ;
            GET_ARG(args,1,Function,cb) ;
            
            fftw3 *design = ObjectWrap::Unwrap<fftw3>(args.This()) ;
            
            // Save the baton for later
            baton_t *baton = new baton_t() ;
            baton->design = design ;
            
            // Make sure we're of the right size
            if( array->Length() != 2*(design->length) ) {
                return ThrowException(Exception::Error(String::New("Array length not equal to design length"))) ;
            } else {
                // Copy the array to the input
                for(int i=0; i< design->length ; i+=1 ) {
                    design->in[i][0] = array->Get(2*i)->NumberValue() ;
                    design->in[i][1] = array->Get(2*i+1)->NumberValue() ;
                }
            }
            
            // Get the callback persistent
            baton->cb = Persistent<Function>::New(cb) ;
            
            // Increment reference count for object
            design->Ref() ;
            
            // Setup the event structure, passing the baton
            eio_custom( EIO_execute, EIO_PRI_DEFAULT, EIO_callback, baton ) ;
            ev_ref(EV_DEFAULT_UC);
            
            return Undefined() ;
        }
        
        // The long operation
        static int EIO_execute(eio_req *req) {
            // Cast data to the baton that we're passing
            baton_t *baton = static_cast<baton_t *>(req->data) ;
            
            // Long operation
            baton->design->execute() ;
            
            // Done
            return 0 ;
        }
        
        // Callback after the long operation
        static int EIO_callback( eio_req *req ) {
            HandleScope scope ;
            baton_t *baton = static_cast<baton_t *>(req->data) ;
            
            // Create the return arguments
            Local<Value> argv[1] ;
            Local<Array> result = Array::New(baton->design->length*2) ;
            
            // Copy the output of the design into the new array
            for(int i = 0 ; i < baton->design->length ; i+=1 ) {
                result->Set(2*i, Number::New(baton->design->out[i][0]) ) ;
                result->Set(2*i+1, Number::New(baton->design->out[i][1]) ) ;
            }
            
            // We're now done with the object
            // Decrement reference count for object
            ev_unref(EV_DEFAULT_UC) ;
            baton->design->Unref() ;
            
            TryCatch try_catch ;
            
            argv[0] = result ;
            
            // Call the callback
            baton->cb->Call(Context::GetCurrent()->Global(), 1, argv ) ;
            
            // Any exceptions?
            if( try_catch.HasCaught() ) {
                FatalException(try_catch) ;
            }
            
            // Let it be known, we are done!
            baton->cb.Dispose() ;
            
            // Get rid of the baton since we're done with the race
            delete baton ;
            
            // Done!
            return 0 ;
        }
} ;

Persistent<FunctionTemplate> fftw3::sft;

extern "C" {
    void init (Handle<Object> target) 
    {
        fftw3::Init(target) ;
    }
    
    NODE_MODULE( fftw3, init ) ;
}