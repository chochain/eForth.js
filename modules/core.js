///
/// Primitive and Immediate word classes (to simplify Dr. Ting's)
///
let _wp    = 0                                   ///< word pointer
let _fence = 0                                   ///< dict length control
let _xs    = []                                  ///< call frame

/// @defgroup Data conversion functions
/// @{
export const EPS    = 1.0e-6                     ///< comparison epsilon
export const INT    = v=>(v | 0)                 ///< OR takes 32-bit integer
export const BOOL   = t=>(t ? -1 : 0)            ///< Forth true = -1
export const ZERO   = v=>BOOL(Math.abs(v) < EPS) ///< zero floating point
/// @}
///=========================================================================
///
/// Forth Inner Interpreter (just one line)
///
export class Prim {
    constructor(name, cat, xt) {
        this.name  = name                  ///< name of the word
        this.cat   = cat                   ///< assign category
        this.xt    = xt                    ///< function pointer
        this.immd  = false                 ///< immediate flag
        this.token = _fence++              ///< word
    }
    exec() { this.xt(this) }
}
export class Immd extends Prim {
    constructor(name, cat, xt) { super(name, cat, xt); this.immd=true }
}
///
/// Colon word class
///
export class Code {
    constructor(name, v=false, xt=null) {
        this.name  = name                 ///< name of the word
        this.cat   = "User"               ///< user defined word
        this.xt    = xt                   ///< function pointer
        this.immd  = false                ///< immediate flag
        this.pf    = []                   ///< parameter field

        if (typeof(v)=="boolean" && v) this.token = _fence++  // new user defined word
        else if (typeof(v)=="string")  this.qf = [ v ]
        else if (typeof(v)=="number")  this.qf = [ v ]
        
        this.pf.tail = function() { return this[this.length-1] }
    }
    exec() {                              ///< execute a word (recursively)
        if (this.xt == null) {            /// * user define word
            _xs.push(_wp)                 /// * setup call frame
            _wp = this.token
            run(this.pf)
            _wp = _xs.pop()               /// * restore call frame
        }
        else this.xt(this);               /// * build-it words
    }
}
export const run   = (pf)=>{ try { pf.forEach(w=>w.exec()) } catch {} }
export const purge = (dict, w, b)=>{      ///< purge everything upto 'w'
    _fence=Math.max(w.token, b.token+1)
    dict.splice(_fence)
}
export const does = (dict)=>{             ///< handle CREATE...DOES...
    let w=dict.tail(), src=dict[_wp].pf
    for (var i=0; i < src.length; i++) {
        if (src[i].name=="does") w.pf.push(...src.slice(i+1))
    }
    throw "does"                          /// break from inner interpreter
}    

