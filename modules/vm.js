///
/// Module - eForth Virtual Machine
/// Note: supported interface
///   > let vm = new ForthVM(), or
///   > let vm = ForthVM()
///
import { Code, run } from './core.js'

/// @defgroup Data conversion functions
/// @{
const EPS    = 1.0e-6                     ///< comparison epsilon
const INT    = v=>(v | 0)                 ///< OR takes 32-bit integer
const BOOL   = t=>(t ? -1 : 0)            ///< Forth true = -1
const ZERO   = v=>BOOL(Math.abs(v) < EPS) ///< zero floating point
const NA     = (s)=>s+" not found! "      ///< exception handler
/// @}

export class VM {
    /// @defgroup Virtual Machine instance variables
    /// @{
    log    = console.log                   ///< output stream
    dict   = []                            ///< dictionary
    ss     = []                            ///< data stack
    rs     = []                            ///< return stack
    /// @}
    /// @defgroup VM states
    /// @{
    compi = false                          ///< compile flag
    ucase = false                          ///< case sensitive find
    base  = 10                             ///< numerical radix
    /// @}
    constructor(io) {
        this.log = io.log
        this.reset()
    }
    reset() {
        this.rs.length = this.ss.length = 0
        this.compi = this.ucase = false
        this.base = 10
    }
    add(s) {                               ///< 
        if (s==null) { this.compi=false; throw "more input" }
        this.dict.push(new Code(s, true))
    }
    comma(w) {                             ///< compile w into pf[]
        this.dict.tail().pf.push(w)
    }
    compile(s, v, xt=null) {               ///< compile a word
        let w = new Code(s, v, xt==null ? this.find(s).xt : xt)
        comma(w)
    }
    nvar(xt, v) {
        compile("dovar", v)
        let t   = this.dict[this.dict.length-i]
        let w   = t.pf[0]                  ///< last work and its pf
        t.val   = w.qf                     /// * create a val func
        w.xt    = xt                       /// * set internal func
        w.token = t.token                  /// * copy token
    }
    find(s) {                              ///< search through dictionary
        let d = this.dict
        for (let i=d.length-1; i>=0; --i) {/// * search reversely
            if (s.localeCompare(           /// * case insensitive
                d[i].name, undefined,
                { sensitivity: this.ucase ? 'case' : 'base' }
            )==0) {
                return d[i]                /// * return indexed word
            }
        }
        return null                        /// * not found
    }
    /// @defgroup Outer Interpreter
    /// @{
    outer(tok) {                           ///< outer interperter
        let w  = this.find(tok)            /// * search throug dictionary
        let cc = this.compi                /// * compile mode
        if (w != null) {                   /// * word found?
            if(!cc || w.immd) {            /// * in interpret mode?
                console.log(w)
                try       { w.exec() }     ///> execute word
                catch (e) { this.log(e) }
            }
            else this.comma(w)             ///> or compile word
            return
        }
        let n = this.base!=10              ///> not word, try as number
            ? parseInt(tok, this.base)
            : parseFloat(tok)
        if (isNaN(n)) {                    ///> * not a number?
            this.log(tok + "? ")           ///>> display prompt
            this.compi=false               ///>> restore interpret mode
        }
        else if (cc) {                     ///> in compile mode?
            this.compile("dolit", n)       ///>> compile the number
        }
        else this.ss.push(n)               ///>> or, push number onto stack top
    }
    /// @defgroup Built-in (branching, looping) functions
    /// @{
    _dec_i()  { this.rs[this.rs.length - 1] -= 1 }      ///< decrement I
    _bran(c)  { run(ZERO(pop()) ? c.pf1 : c.pf) }       ///< branch op
    _dofor(c) {                                         ///< for..loop op
        do { run(c.pf) }
        while (c.stage==0 && this._dec_i() >= 0)        ///< for.{pf}.next only
        while (c.stage>0) {                             /// * aft
            run(c.pf2)                                  /// * aft.{pf2}.next
            if (this._dec_i() < 0) break
            run(c.pf1)                                  /// * then.{pf1}.next
        }
        this.rs.pop()                                   /// * pop off I
    }
    _loop(c) {                                          ///< begin..util op
        while (true) {
            run(c.pf)                                   /// * begin.{pf}.
            if (c.stage==0 && INT(pop())!=0) break      /// * until
            if (c.stage==1) continue                    /// * again
            if (c.stage==2 && ZERO(pop())) break        /// * while
            run(c.pf1)                                  /// * .{pf1}.until
        }
    }
    /// @}
}
