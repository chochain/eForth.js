///
/// Module - eForth Virtual Machine
/// Note: supported interface
///   > let vm = new ForthVM(), or
///   > let vm = ForthVM()
///
import { INT, ZERO, Code, run } from './core.js'

const NA = (s)=>s+" not found! "           ///< exception handler

export class VM {
    /// @defgroup Virtual Machine instance variables
    /// @{
    log    = console.log                   ///< output stream
    tok    = null                          ///< next token
    tib    = null                          ///< set tib buffer
    xtib   = null                          ///< clear tib buffer
    
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
        /// IO method facade
        this.log   = io.log                /// * logging 
        this.tok   = io.nxtok              /// * tokenizer
        this.tib   = io.set_tib            /// * set input buffer
        this.xtib  = io.clear              /// * clear input buffer
        /// reset VM states
        this.reset()
    }
    reset() {
        this.rs.length = this.ss.length = 0
        this.compi = this.ucase = false
        this.base = 10
    }
    add(s)    { this.dict.push(new Code(s, null, true)) }       ///< add a word to dictionary
    extend(d) { d.forEach(c=>this.dict.push(c)) }               ///< extending dictionary
    comma(w)  { this.dict[this.dict.length - 1].pf.push(w) }    ///< add w into pf[] 
    compile(s, xt=null, v=false) {                              ///< compile a word
        let w = new Code(s, xt!=null ? xt : this.find(s).xt, v)
        this.comma(w)
    }
    nvar(xt, v) {
        this.compile("dovar", xt, v)
        let t   = this.dict[this.dict.length - 1]
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
    tok2w() {                              ///< convert token to word
        let w = this.find(this.tok())      /// * search thru dictionary
        if (w==null) throw NA(s);          /// * error: if token not found
        return w
    }
	tail(i=1)  { return this.dict[this.dict.length - i] }    ///< last entry
	last()     { return this.tail(2).pf.tail() }             ///< pf of last word created
    /// @defgroup Outer Interpreter
    /// @{
    outer(tok) {                           ///< outer interperter
        let w  = this.find(tok)            /// * search throug dictionary
        let cc = this.compi                /// * compile mode
        if (w != null) {                   /// * word found?
            if(!cc || w.immd) {            /// * in interpret mode?
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
            this.compile("dolit", null, n) ///>> compile the number
        }
        else this.ss.push(n)               ///>> or, push number onto stack top
    }
}
