///
/// Module - eForth Virtual Machine
/// Note: supported interface
///   > let vm = new ForthVM(), or
///   > let vm = ForthVM()
///
import { Prim, Immd, Code, run, boot, forget, does } from './core.js'

export default function ForthVM(output=console.log) {
    if (!(this instanceof ForthVM)) return new ForthVM(output);

    const SPC=" ", CR="\n"                ///< string constants
    const EPS=1.0e-6                      ///< comparison epsilon
    ///
    /// Virtual Machine instance variables
    ///
    let _ss    = []                       ///< data stack
    let _rs    = []                       ///< return stack
    let _base  = 10                       ///< numeric radix
    ///
    /// VM control states
    ///
    let _compi = false                    ///< compile flag
    let _ucase = false                    ///< case sensitive find
    let _tib   ="", _ntib = 0             ///< input buffer
    ///=====================================================================
    /// @defgroup IO functions
    /// @{
    const log    = (s)=>output(s)                    ///< output port
    const NA     = (s)=>s+" not found! "             ///< exception handler
    const nxtok  = (d=SPC)=>{                        ///< assumes tib ends with a blank
        while (d==SPC &&
               (_tib[_ntib]==SPC || _tib[_ntib]=="\t")) _ntib++ /// skip leading blanks and tabs
        let i = _tib.indexOf(d, _ntib)
        let s = (i==-1) ? null : _tib.substring(_ntib, i); _ntib=i+1
        return s
    }
    const dot_r = (n, v)=>{
        let s = v.toString(_base)
        for(let i=0; i+s.length < n; i++) log(SPC)
        log(s)
    }
    const sleep  = (ms)=>{
        return new Promise(rst=>setTimeout(rst,ms))
    }
    /// @}
    /// @defgroup Compiler functions
    /// @{
    const compile= (w)=>dict.tail().pf.push(w)      ///< add word to pf[]
    const nvar   = (xt, v)=>{
        compile(new Code("dovar", v))
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
        let s=nxtok(), w=find(s)
        if (w==null) throw NA(s);
        return w
    }
    /// @}
    /// @defgroup Data conversion functions
    /// @{
    const INT    = v=>(v | 0)                        ///< OR takes 32-bit integer
    const BOOL   = t=>(t ? -1 : 0)                   ///< Forth true = -1 
    const ZERO   = v=>BOOL(Math.abs(v) < EPS)        ///< zero floating point
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
    /// @defgroup Debug functions (can be implemented in front-end)
    /// @{
    const _spaces= (n)=>{ for (let i=0; i<n; i++) log(SPC) }
    const _words = ()=>{                                ///< word op
        let sz = 0
        dict.forEach((w,i)=>{                           /// * loop thru all words
            log(w.name+SPC)
            sz += w.name.length + 1
            if (sz > 52) { log(CR); sz = 0 }
        })
        log(CR)
    }
    const _dump = (n0, n1)=>{                           ///< memory dump op
        for (let i = n0; i <= n1; i++) {
            let w = dict[i]
            log('dict[' + i + ']=("' + w.name + '" ')
            if (w.xt) log(w.xt.toString(_base))
            else      log(', pf[' + w.pf.map(w1=>w1.name).toString(_base) + ']')
            if (w.qf) log(', qf[' + w.qf.toString(_base) + ']')
            log((w.immd ? 'immd)' : ')') + CR)
        }
    }
    const _see = (w, n=0)=>{                            ///< see op
        const _show_pf = (pf)=>{
            if (pf == null || pf.length == 0) return
            log('['+CR); _spaces(2*(n+1))               /// * indent section
            pf.forEach(w=>_see(w, n+1))                 /// * recursive call
            log('] ')                                   /// * close section
        }
        log(w.name+SPC)                                 /// * display word name
        if (w.qf != null && w.qf.length > 0) {          /// * display qf array
            log('='+JSON.stringify(w.qf)+SPC)
        }
        _show_pf(w.pf)                                  /// * if.{pf}, for.{pf}, or begin.{pf}
        _show_pf(w.pf1)                                 /// * else.{pf1}.then, or .then.{pf1}.next
        _show_pf(w.pf2)                                 /// * aft.{pf2}.next
    }
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
        new Prim("base@", "io", c=>push(INT(_base))),
        new Prim("base!", "io", c=>_base=INT(pop())),
        new Prim("hex",   "io", c=>_base=16),
        new Prim("decimal","io",c=>_base=10),
        new Prim("cr",    "io", c=>log(CR)),
        new Prim(".",     "io", c=>log(pop().toString(_base)+SPC)),
        new Prim(".r",    "io", c=>{ let n=pop(); dot_r(n, pop()) }),
        new Prim("u.r",   "io", c=>{ let n=pop(); dot_r(n, pop()&0x7fffffff) }),
        new Prim("key",   "io", c=>push(nxtok()[0])),
        new Prim("emit",  "io", c=>log(String.fromCharCode(pop()))),
        new Prim("space", "io", c=>log(SPC)),
        new Prim("spaces","io", c=>_spaces(pop())),
        /// @}
        /// @defgroup Literal ops
        /// @{
        new Prim("dolit", "li", c=>push(c.qf[0])),     /// * integer literal or string
        new Prim("dostr", "li", c=>push(c.token)),     /// * string literal token
        new Immd("[",     "li", c=>_compi=false ),
        new Prim("]",     "li", c=>_compi=true ),
        new Prim("'",     "li", c=>{ let w=tok2w(); push(w.token) }),
        new Immd("s\"",   "li", c=>{
            let s = nxtok('"')
            if (_compi) compile(new Code("dostr", s))
            else push(s)                               /// * push string object
        }),
        new Immd(".\"",   "li", c=>compile(new Code("dolit", nxtok('"')))),
        new Immd("(",     "li", c=>nxtok(')')),
        new Immd(".(",    "li", c=>log(nxtok(')'))),
        new Immd("\\",    "li", c=>_ntib=_tib.length),
        /// @}
        /// @defgroup Branching - if.{pf}.then, if.{pf}.else.{pf1}.then
        /// @{
        new Immd("if",    "br", c=>{
            let w = new Code("_bran", false, _bran)    /// * encode branch opcode
            w.pf1=[]; w.stage=0                        /// * stage for branching
            compile(w)
            dict.push(new Code("tmp"))                 /// * as dict.tail()
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
            compile(new Code("_loop", false, _loop))   /// * encode _loop opcode
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
            compile(new Code(">r"));                   /// * push I onto rstack
            compile(new Code("_for", false, _for))     /// * encode _for opcode
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
        /// @}
        /// @defgroup Memory Access ops
        /// @{
        new Prim("?",        "mm", c=>log(dict[pop()].val[0].toString(_base)+SPC)),
        new Prim("@",        "mm", c=>push(dict[pop()].val[0])),                              // w -- n
        new Prim("!",        "mm", c=>{ let w=pop(); dict[w].val[0]=pop() }),                 // n w  --
        new Prim("+!",       "mm", c=>{ let w=pop(); dict[w].val[0]+=pop() }),                // n w --
        new Prim("allot",    "mm", c=>{                                                       // n --
            nvar(_dovar, 0)                                                                   // create qf array
            for (let n=pop(), i=1; i<n; i++) dict.tail().val[i]=0 }),                         // fill all slot with 0
        new Prim("n?",       "mm", c=>{                                                       // w i --
            let i=pop(); let w=pop(); log(dict[w].val[i].toString(_base)+SPC) }),
        new Prim("n@",       "mm", c=>{ let i=pop(); let w=pop(); push(dict[w].val[i]) }),    // w i -- n
        new Prim("n!",       "mm", c=>{ let i=pop(); let w=pop(); dict[w].val[i]=pop() }),    // n w i --
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
        new Prim("does",     "cm", c=>does(dict)),
        new Prim("to",       "cm", c=>tok2w().val[0]=pop()),         // update constant
        new Prim("is",       "cm", c=>{                              // n -- alias a word
            dict.add(); dict.tail().pf = dict[pop()].pf
        }),
        /// @}
        /// @defgroup Debugging ops
        /// @{
        new Prim("here",     "db", c=>push(dict.tail().token)),
        new Prim("words",    "db", c=>_words()),
        new Prim("dump",     "db", c=>{ let n=pop(); _dump(pop(), n) }),
        new Prim(".s",       "db", c=>{
            let s = _ss.map(v=>v.toString(_base))
            log(s.join(' ') + CR)
        }),
        new Prim("see",      "db", c=>{ let w=tok2w(); console.log(w); _see(w) }),
        new Prim("forget",   "db", c=>{
            forget(dict, tok2w(), find("boot"))
        }),
        /// @}
        /// @defgroup System ops
        /// @{
        new Prim("exit",     "os", c=>{ throw "exit" }),             /// * exit inner interpreter
        new Prim("clock",    "os", c=>{ let n = Date.now(); push(n) }),
        new Prim("delay",    "os", c=>sleep(pop()).then(()=>{})),
        new Prim("date",     "os", c=>log((new Date()).toDateString()+" ")),
        new Prim("time",     "os", c=>log((new Date()).toLocaleTimeString()+" ")),
        new Prim("eval",     "os", c=>eval(pop())),                 /// * dangerous, be careful!
        /// @}
        new Prim("boot",     "os", c=>{
            boot(dict, find("boot"))                                /// * purge everything upto 'boot'
            _rs.length = _ss.length = 0
            _base = 10
        })]
        /// @}
        /// @defgroup Dictionary access methods
        /// @{
        dict.add  = function()    {                                     ///< create a new word
            let s = nxtok();                                            ///< fetch an input token
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
                try       { w.exec() }                      ///> execute word
                catch (e) { log(e) }
            }
            else compile(w)                                 ///> or compile word
            return
        }
        let n = _base!=10                                   ///> not word, try as number
            ? parseInt(tok, _base)
            : parseFloat(tok)
        if (isNaN(n)) {                                     ///> * not a number?
            log(tok + "? ")                                 ///>> display prompt
            _compi=false                                    ///>> restore interpret mode
        }
        else if (_compi) {                                  ///> in compile mode?
            compile(new Code("dolit", n))                   ///>> compile the number
        }
        else push(n)                                        ///>> or, push number onto stack top
    }
    let dict = []                                           ///< blank for lazy loading
    let exec = (cmd)=>{                                     ///< outer interpreter
        if (dict.length==0) _init()                         /// * construct dict now
        cmd.split("\n").forEach(r=>{                        /// * multi-line input
            _tib=r + SPC; _ntib=0                           /// * capture into TIB
            let tok = ''                                    ///< input idiom
            while ((tok=nxtok()) != null) {                 /// * loop thru all idioms
                outer(tok)
            }
        })
        log("ok\n")
    }
    return {
        ss: _ss,                                           ///< data stack
        rs: _rs,                                           ///< return stack
        dict: dict,                                        ///< dictionary
        exec: exec                                         ///< outer interpreter
    }
}

