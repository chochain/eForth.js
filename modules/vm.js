/// @file
/// @brief Module - eForth Virtual Machine
/// Note: supported interface
///   > let vm = new ForthVM(), or
///   > let vm = ForthVM()
///
import { Code } from './core.js'

const NA = (s)=>s+' not found! '           ///< exception handler

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
        this.word  = io.word               /// * tokenizer
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
    tail(i=1) { return this.dict.at(-(i | 0)) }   ///< last entry
    last()    { return this.tail(2).pf.tail() }   ///< pf of last word created
    colon(s)  {                                   ///< add a colon word to dictionary
        if (this.find(s) != null) this.log(s + ' reDef? ')
        this.dict.push(new Code(s, null, true))
    }
    compile(w)  { this.tail().pf.push(w) }        ///< add w into pf[] 
    nvar(xt, v) {
        let t   = this.tail()              ///< last colon word 
        let w   = new Code('', xt, v)      ///< new var node
        t.val   = w.q                      /// * create a softlink func
        w.token = t.token                  /// * copy token
        this.compile(w)
    }
    extend(d) { this.dict.push(...d); d.length=0 } ///< extend dictionary
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
        let s = this.word()
        if (s==null) { this.log('name? '); throw 'need name' }
        let w = this.find(s)               /// * search thru dictionary
        if (w==null) throw NA(s);          /// * error: if token not found
        return w
    }
    isNum(s) {
        const mx = (c)=>c+'-'+String.fromCharCode(c.charCodeAt() + (this.base - 11))
        const st = this.base > 10
              ? '^-?[0-9|'+mx('a')+'|'+mx('A')+']+$'
              : '^-?([0-'+(this.base-1).toString()+']*[.])?[0-'+(this.base-1).toString()+']+$'
        return new RegExp(st).test(s)
    }
    /// @defgroup Outer Interpreter
    /// @{
    outer(tok) {                           ///< outer interperter
        const dolit = c=>{ this.ss.push(c.q[0]) }
        let w = this.find(tok)             /// * search throug dictionar
        if (w != null) {                   /// * word found?
            if(!this.compi || w.immd) {    /// * in interpret mode?
                try       { w.exec(this) } ///> execute word
                catch (e) { this.log(e) }
            }
            else this.compile(w)           ///> or compile word
            return
        }
        let n = this.base!=10              ///> not word, try as number
            ? parseInt(tok, this.base)
            : parseFloat(tok)
        if (isNaN(n) || !this.isNum(tok)) {///> * is a number?
            this.log(tok + '? ')           ///>> display prompt
            this.compi=false               ///>> restore interpret mode
        }
        else if (this.compi) {             ///> in compile mode?
            this.compile(new Code('', dolit, n))  ///>> compile the number
        }
        else this.ss.push(n)               ///>> or, push number onto stack top
    }
}
