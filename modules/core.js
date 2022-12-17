/// @file
/// @brief eForth - Core classes
///
let _fence = 0                                   ///< dict length control
/// @defgroup Data conversion functions
/// @{
export const EPS    = 1.0e-6                     ///< comparison epsilon
export const INT    = v=>(v | 0)                 ///< OR takes 32-bit integer
export const BOOL   = t=>(t ? -1 : 0)            ///< Forth true = -1
export const ZERO   = v=>BOOL(Math.abs(v) < EPS) ///< zero floating point
/// @}
///=========================================================================
/// Primitive and Immediate word classes
///
export class Prim {
    constructor(name, xt) {
        this.name  = name                  ///< name of the word
        this.xt    = xt                    ///< function pointer
        this.immd  = false                 ///< immediate flag
        this.token = _fence++              ///< word
    }
    exec() { this.xt(this) }
}
export class Immd extends Prim {
    constructor(name, xt) { super(name, xt); this.immd=true }
}
///
/// Colon word class
///
export class Code {
    constructor(name, xt=null, v=false) {
        this.name  = name                 ///< name of the word
        this.xt    = xt                   ///< function pointer
        this.immd  = false                ///< immediate flag
        this.pf    = []                   ///< parameter field

        if (typeof(v)=='boolean' && v) this.token = _fence++  // new user defined word
        else if (typeof(v)=='string')  this.qf = [ v ]
        else if (typeof(v)=='number')  this.qf = [ v ]
        
        this.pf.tail = function() { return this[this.length-1] }
    }
    exec(vm) {                            ///< execute a word (recursively)
        if (this.xt == null) {            /// * user define word
            vm.rs.push(vm.wp)             /// * setup call frame
            vm.wp = this.token
            try {                         /// * inner interpreter
                this.pf.forEach(w=>w.exec(vm))
            }
            catch {}                      /// * catch 'does' and 'exit'
            vm.wp = vm.rs.pop()           /// * restore call frame
        }
        else this.xt(this);               /// * build-in words
    }
}
export const purge = (dict, w, b)=>{      ///< purge everything upto 'w'
    _fence=Math.max(w.token, b.token+1)   /// * set purge range
    dict.splice(_fence)                   /// * purge words from dictionary
}

