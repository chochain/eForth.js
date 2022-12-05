///
/// Module - eForth Virtual Machine
/// Note: supported interface
///   > let vm = new ForthVM(), or
///   > let vm = ForthVM()
///
import { Prim, Immd, Code, run, purge, does } from './core.js'
import * as io    from './io.js'
import * as os    from './os.js'
import * as mm    from './mem.js'
import * as debug from './debug.js'

/// @defgroup Data conversion functions
/// @{
const EPS    = 1.0e-6                     ///< comparison epsilon
const INT    = v=>(v | 0)                 ///< OR takes 32-bit integer
const BOOL   = t=>(t ? -1 : 0)            ///< Forth true = -1 
const ZERO   = v=>BOOL(Math.abs(v) < EPS) ///< zero floating point
const NA     = (s)=>s+" not found! "      ///< exception handler
/// @}

export default function ForthVM(output=console.log) {
    if (!(this instanceof ForthVM)) return new ForthVM(output);

    io.init(output)                       /// * initialize output stream
    ///
    /// @defgroup Virtual Machine instance variables
    /// @{
    let _ss    = []                       ///< data stack
    let _rs    = []                       ///< return stack
    ///
    /// VM control states
    ///
    let _compi = false                    ///< compile flag
    let _ucase = false                    ///< case sensitive find
    /// @}
    /// @defgroup Compiler functions
    /// @{
    const comma   = (w)=>dict.tail().pf.push(w)     ///< add word to pf[]
    const compile = (s, v, xt=null)=>{              ///< compile a word
        let w = new Code(s, v, xt==null ? find(s).xt : xt)
        comma(w)
    }
    const nvar   = (xt, v)=>{
        compile("dovar", v)
        let t = dict.tail(), w = t.pf[0]            ///< last work and its pf
        t.val   = w.qf                              /// * create a val func
        w.xt    = xt                                /// * set internal func
        w.token = t.token                           /// * copy token
    }
    const find   = (s)=>{                           ///< search through dictionary
        for (let i=dict.length-1; i>=0; --i) {      /// * search reversely
            if (s.localeCompare(                    /// * case insensitive
                dict[i].name, undefined,
                { sensitivity: _ucase ? 'case' : 'base' }
            )==0) {
                return dict[i]                      /// * return indexed word
            }
        }
        return null                                 /// * not found
    }
    const tok2w  = ()=>{                            ///< convert token to word
        let s=io.nxtok(), w=find(s)
        if (w==null) throw NA(s);
        return w
    }
    /// @}
    /// @defgroup Stack op short-hand functions (macros)
    /// @{
    const top    = (n=1)=>_ss[_ss.length - INT(n)]
    const push   = v    =>_ss.push(v)
    const pop    = ()   =>_ss.pop()
    const remove = n    =>{ let v=top(n); _ss.splice(length - n, 1); return v }
    const rtop   = (n=1)=>_rs[_rs.length - INT(n)]
    const dec_i  = ()   =>_rs[_rs.length - 1] -= 1
    /// @}
    /// @defgroup Built-in (branching, looping) functions
    /// @{
    const _docon = c=>push(c.qf[0])                     ///< constant op
    const _dovar = c=>push(c.token)                     ///< variable op
    const _bran  = c=>run(ZERO(pop()) ? c.pf1 : c.pf)   ///< branch op
    const _for   = c=>{                                 ///< for..loop op
        do { run(c.pf) }
        while (c.stage==0 && dec_i() >= 0)              ///< for.{pf}.next only
        while (c.stage>0) {                             /// * aft
            run(c.pf2)                                  /// * aft.{pf2}.next
            if (dec_i() < 0) break
            run(c.pf1)                                  /// * then.{pf1}.next
        }
        _rs.pop()                                       /// * pop off I
    }
    const _loop  = c=>{                                 ///< begin..util op
        while (true) {
            run(c.pf)                                   /// * begin.{pf}.
            if (c.stage==0 && INT(pop())!=0) break      /// * until
            if (c.stage==1) continue                    /// * again
            if (c.stage==2 && ZERO(pop())) break        /// * while
            run(c.pf1)                                  /// * .{pf1}.until
        }
    }
    /// @}
    ///======================================================================
    /// dictionary intialized with primitive words
    ///
    const _init = ()=>{                                 ///< dictionary constructor
        dict = [
        /// @defgroup Stack ops
        /// @{
        new Prim("dup",   "ss", c=>push(top())),
        new Prim("drop",  "ss", c=>pop()),
        new Prim("over",  "ss", c=>push(top(2))),
        new Prim("swap",  "ss", c=>push(remove(2))),
        new Prim("rot",   "ss", c=>push(remove(3))),
        new Prim("-rot",  "ss", c=>_ss.splice(-2, 0, pop())),
        new Prim("pick",  "ss", c=>{ let i=pop(), n=top(i+1); push(n) }),
        new Prim("roll",  "ss", c=>{ let i=pop(), n=remove(i+1); push(n) }),
        new Prim("nip",   "ss", c=>remove(2)),
        new Prim("2dup",  "ss", c=>{ push(top(2)); push(top(2)) }),
        new Prim("2drop", "ss", c=>_ss.splice(-2)),
        new Prim("2over", "ss", c=>{ push(top(4)); push(top(4)) }),
        new Prim("2swap", "ss", c=>{ push(remove(4)); push(remove(4)) }),
        /// @}
        /// @defgroup Arithmetic ops
        /// @{
        new Prim("+",     "au", c=>{ let n=pop(); push(pop() + n) }),
        new Prim("-",     "au", c=>{ let n=pop(); push(pop() - n) }),
        new Prim("*",     "au", c=>{ let n=pop(); push(pop() * n) }),
        new Prim("/",     "au", c=>{ let n=pop(); push(pop() / n) }),
        new Prim("mod",   "au", c=>{ let n=pop(); push(pop() % n) }),          // * note: 4.5 3 mod => 1.5
        new Prim("*/",    "au", c=>{ let n=pop(); push(pop() * pop() / n) }),
        new Prim("*/mod", "au", c=>{
            let n=pop(), m=pop() * pop();
            push(m % n); push(INT(m / n))
        }),
        /// @}
        /// @defgroup Bit-wise ops (auto convert to 32-bit by Javascript)
        /// @{
        new Prim("int",   "au", c=>push(INT(pop()))),                          // * convert float to integer
        new Prim("and",   "au", c=>push(pop() & pop())),
        new Prim("or",    "au", c=>push(pop() | pop())),
        new Prim("xor",   "au", c=>push(pop() ^ pop())),
        new Prim("negate","au", c=>push(-pop())),
        new Prim("abs",   "au", c=>push(Math.abs(pop()))),
        /// @}
        /// @defgroup Logic ops
        /// @{
        new Prim("0=",    "eq", c=>push(ZERO(pop()))),
        new Prim("0<",    "eq", c=>push(BOOL(pop() < -EPS))),
        new Prim("0>",    "eq", c=>push(BOOL(pop() >  EPS))),
        new Prim("=",     "eq", c=>{ let n=pop(); push(ZERO(pop() - n)) }),
        new Prim("<",     "eq", c=>{ let n=pop(); push(BOOL((pop() - n) < -EPS)) }),
        new Prim(">",     "eq", c=>{ let n=pop(); push(BOOL((pop() - n) >  EPS)) }),
        new Prim("<>",    "eq", c=>{ let n=pop(); push(BOOL(ZERO(pop() - n)==0)) }),
        /// @}
        /// @defgroup IO ops
        /// @{
        new Prim("ucase!","io", c=>_ucase=BOOL(ZERO(pop()))),
        new Prim("base@", "io", c=>push(io.get_base())),
        new Prim("base!", "io", c=>io.set_base(pop())),
        new Prim("hex",   "io", c=>io.set_base(16)),
        new Prim("decimal","io",c=>io.set_base(10)),
        new Prim("cr",    "io", c=>io.cr()),
        new Prim(".",     "io", c=>io.dot(pop())),
        new Prim(".r",    "io", c=>{ let n=pop(); io.dot_r(n, pop()) }),
        new Prim("u.r",   "io", c=>{ let n=pop(); io.dot_r(n, pop()&0x7fffffff) }),
        new Prim("key",   "io", c=>push(io.key())),
        new Prim("emit",  "io", c=>io.emit(pop())),
        new Prim("space", "io", c=>io.spaces(1)),
        new Prim("spaces","io", c=>io.spaces(pop())),
        /// @}
        /// @defgroup Literal ops
        /// @{
        new Prim("dolit", "li", c=>push(c.qf[0])),     /// * integer literal or string
        new Prim("dostr", "li", c=>push(c.token)),     /// * string literal token
        new Immd("[",     "li", c=>_compi=false ),
        new Prim("]",     "li", c=>_compi=true ),
        new Prim("'",     "li", c=>{ let w=tok2w(); push(w.token) }),
        new Immd("s\"",   "li", c=>{
            let s = io.nxtok('"')
            if (_compi) compile("dostr", s)
            else        push(s)                        /// * push string object
        }),
        new Immd(".\"",   "li", c=>compile("dolit", io.nxtok('"'))),
        new Immd("(",     "li", c=>io.nxtok(')')),
        new Immd(".(",    "li", c=>io.log(io.nxtok(')'))),
        new Immd("\\",    "li", c=>io.clear()),
        /// @}
        /// @defgroup Branching - if.{pf}.then, if.{pf}.else.{pf1}.then
        /// @{
        new Immd("if",    "br", c=>{
            compile("_bran", false, _bran)             /// * encode branch opcode
            dict.push(new Code("tmp"))                 /// * as dict.tail()
            let w = dict.last(); w.pf1=[]; w.stage=0   /// * stage for branching
        }),
        new Immd("else",  "br", c=>{
            let w=dict.last(), tmp=dict.tail()
            w.pf.push(...tmp.pf); w.stage=1
            tmp.pf.length = 0
        }),
        new Immd("then",  "br", c=>{
            let w=dict.last(), tmp=dict.tail()
            if (w.stage==0) {
                w.pf.push(...tmp.pf)                   /// * copy tmp.pf into branch
                dict.pop()                             /// * drop tmp
            }
            else {
                w.pf1.push(...tmp.pf)
                if (w.stage==1) dict.pop()             /// * drop tmp
                else tmp.pf.length=0                   /// * for...aft...then
            }
        }),
        /// @}
        /// @defgroup Loop ops
        /// @brief begin.{pf}.again, begin.{pf}.until, begin.{pf}.while.{pf1}.repeat
        /// @{
        new Immd("begin", "br", c=>{
            compile("_loop", false, _loop)             /// * encode _loop opcode
            dict.push(new Code("tmp"))                 /// * create a tmp holder
            let w = dict.last()
            w.pf1=[]; w.stage=0                        /// * create branching pf
        }),
        new Immd("while", "br", c=>{
            let w=dict.last(), tmp=dict.tail()
            w.pf.push(...tmp.pf); w.stage=2            /// * begin.{pf}.f.while
            tmp.pf.length = 0
        }),
        new Immd("repeat", "br", c=>{
            let w=dict.last(), tmp=dict.tail()
            w.pf1.push(...tmp.pf)                      /// * while.{pf1}.repeat
            dict.pop()
        }),
        new Immd("again", "br", c=>{
            let w=dict.last(), tmp=dict.tail()
            w.pf.push(...tmp.pf); w.stage=1            /// * begin.{pf}.again
            dict.pop()
        }),
        new Immd("until", "br", c=>{
            let w=dict.last(), tmp=dict.tail()
            w.pf.push(...tmp.pf)                       /// * begin.{pf}.f.until
            dict.pop()
        }),
        /// @}
        /// @defgroup Loop ops
        /// @brief for.{pf}.next, for.{pf}.aft.{pf1}.then.{pf2}.next
        /// @{
        new Immd("for",   "br", c=>{                   /// * for...next
            compile(">r", false)                       /// * push I onto rstack
            compile("_for", false, _for)               /// * encode _for opcode
            dict.push(new Code("tmp"))                 /// * create tmp holder
            let w=dict.last()
            w.stage=0; w.pf1=[]
        }),
        new Immd("aft",   "br", c=>{
            let w=dict.last(), tmp=dict.tail()
            w.pf.push(...tmp.pf); w.stage=3; w.pf2=[]  /// * for.{pf}.aft
            tmp.pf.length=0
        }),
        new Immd("next",  "br", c=>{
            let w=dict.last(), tmp=dict.tail()
            if (w.stage==0) w.pf.push(...tmp.pf)       /// * for.{pf}.next
            else            w.pf2.push(...tmp.pf)      /// * .then.{pf2}.next
            dict.pop()
        }),
        new Prim(">r",    "br", c=>_rs.push(pop())),   /// * push into rstack
        new Prim("r>",    "br", c=>push(_rs.pop())),   /// * pop from rstack
        new Prim("r@",    "br", c=>push(rtop())),      /// * fetch from rstack
        new Prim("i",     "br", c=>push(rtop())),      /// * same as r@
        new Prim("exit",  "br", c=>{ throw 'exit' }),  /// * exit inner interpreter
        /// @}
        /// @defgroup Memory Access ops
        /// @{
        new Prim("?",     "mm", c=>io.log(mm.at(dict[pop()]))),
        new Prim("@",     "mm", c=>push(mm.at(dict[pop()]))),                              // w -- n
        new Prim("!",     "mm", c=>{ let w=pop(); mm.store(dict[w], pop()) }),             // n w  --
        new Prim("+!",    "mm", c=>{ let w=pop(); mm.storeplus(dict[w], pop()) }),         // n w --
        new Prim("allot", "mm", c=>{                                                       // n --
            nvar(_dovar, 0)                                                                // create qf array
            for (let n=pop(), i=1; i<n; i++) mm.arr_store(dict.tail(), i, 0)
        }),
        new Prim("n?",    "mm", c=>{ let i=pop(); io.log(mm.arr_at(dict[pop()], i)) }),                 // w i --
        new Prim("n@",    "mm", c=>{ let i=pop(); let w = pop(); push(mm.arr_at(dict[w], i)) }),        // w i -- n
        new Prim("n!",    "mm", c=>{ let i=pop(); let w = pop(); mm.arr_store(dict[w], i, pop()) }),    // n w i --
        /// @}
        /// @defgroup Word Defining ops
        /// @{
        new Immd("exec",     "cm", c=>dict[pop()].exec()),
        new Prim(":",        "cm", c=>{ dict.add(); _compi=true }),  // new colon word
        new Immd(";",        "cm", c=>_compi=false),                 // semicolon
        new Immd("variable", "cm", c=>(dict.add(), nvar(_dovar, 0))),
        new Immd("constant", "cm", c=>(dict.add(), nvar(_docon, pop()))),
        new Prim("create",   "cm", c=>dict.add()),                   // create new word
        new Prim(",",        "cm", c=>{                              // push TOS into qf
            let pf = dict.tail().pf
            if (pf.length) pf[0].qf.push(pop())                      // append more values
            else           nvar(_dovar, pop())                       // 1st value in qf
        }),
        new Prim("allot",    "cm", c=>{                                                       // n --
            nvar(_dovar, 0)                                                                   // create qf array
            for (let n=pop(), i=1; i<n; i++) dict.tail().val[i]=0 }),                         // fill all slot with 0
        new Prim("does",     "cm", c=>does(dict)),
        new Prim("to",       "cm", c=>tok2w().val[0]=pop()),         // update constant
        new Prim("is",       "cm", c=>{                              // n -- alias a word
            dict.add(); dict.tail().pf = dict[pop()].pf
        }),
        /// @}
        /// @defgroup Debugging ops
        /// @{
        new Prim("here",     "db", c=>push(dict.tail().token)),
        new Prim(".s",       "db", c=>io.dot(_ss)),
        new Prim("words",    "db", c=>debug.words(dict)),
        new Prim("dump",     "db", c=>{ let n=pop(); debug.dump(dict, pop(), n) }),
        new Prim("see",      "db", c=>{ let w=tok2w(); console.log(w); debug.see(w) }),
        new Prim("forget",   "db", c=>purge(dict, tok2w(), find("boot"))),
        /// @}
        /// @defgroup System ops
        /// @{
        new Prim("clock",    "os", c=>push(os.clock())),
        new Prim("delay",    "os", c=>os.sleep(pop())),
        new Prim("date",     "os", c=>io.log(os.date()+" ")),
        new Prim("time",     "os", c=>io.log(os.time()+" ")),
        new Prim("eval",     "os", c=>os.js_eval(pop())),           /// * dangerous, be careful!
        /// @}
        new Prim("boot",     "os", c=>{
            let b = find("boot")                                    /// * purge everything upto 'boot'
            purge(dict, b, b)
            _rs.length = _ss.length = 0
            _base = 10
        })]
        /// @}
        /// @defgroup Dictionary access methods
        /// @{
        dict.add  = function()    {                                     ///< create a new word
            let s = io.nxtok();                                         ///< fetch an input token
            if (s==null) { _compi=false; throw "more input" }
            dict.push(new Code(s, true))
        }
        dict.tail = function(i=1) { return this[this.length-i]    }     ///< last entry
        dict.last = function()    { return dict.tail(2).pf.tail() }     ///< pf of last word created
        /// @}
    }
    ///
    /// outer interpreter method
    /// @param tok - one token (or idiom) from input buffer
    ///
    let outer = (tok)=>{                                   ///< outer interperter
        let w = find(tok)                                   /// * search throug dictionary
        if (w != null) {                                    /// * word found?
            if(!_compi || w.immd) {                         /// * in interpret mode?
                try       { w.exec()  }                     ///> execute word
                catch (e) { io.log(e) }
            }
            else comma(w)                                   ///> or compile word
            return
        }
        let n = io.get_base()!=10                           ///> not word, try as number
            ? parseInt(tok, _base)
            : parseFloat(tok)
        if (isNaN(n)) {                                     ///> * not a number?
            io.log(tok + "? ")                              ///>> display prompt
            _compi=false                                    ///>> restore interpret mode
        }
        else if (_compi) {                                  ///> in compile mode?
            compile("dolit", n)                             ///>> compile the number
        }
        else push(n)                                        ///>> or, push number onto stack top
    }
    let dict = []                                           ///< blank for lazy loading
    let exec = (cmd)=>{                                     ///< outer interpreter
        if (dict.length==0) _init()                         /// * construct dict now
        cmd.split("\n").forEach(r=>{                        /// * multi-line input
            io.set_tib(r)                                   /// * capture into TIB
            for (let tok=io.nxtok();                        ///< loop thru input idioms
                 tok != null; tok=io.nxtok()) {
                outer(tok)
            }
        })
        io.log("ok\n")
    }
    return {
        ss: _ss,                                           ///< data stack
        rs: _rs,                                           ///< return stack
        dict: dict,                                        ///< dictionary
        exec: exec                                         ///< outer interpreter
    }
}

