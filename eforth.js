'use strict';
///
/// eForth.js Virtual Machine factory function
///
window.ForthVM = function(output=console.log) {
    let SPC=" ", CR="\n"                  ///< string constants
    let EPS=1.0e-6                        ///< comparison epsilon
    ///
    /// Virtual Machine instance variables
    ///
    let _ss    = []                       ///< data stack
    let _rs    = []                       ///< return stack
    let _wp    = 0                        ///< word pointer
    let _base  = 10                       ///< numeric radix
    ///
    /// VM state control
    ///
    let _compi = false                    ///< compile flag
    let _tib   ="", _ntib = 0             ///< input buffer
    let _fence = 0                        ///< dict length control
    /// @}
    ///==============================================================
    /// Inner interpreter (use catch for does and exit)
    ///
    const _run = (p)=>{ try { p.forEach(w=>w.exec()) } catch {} }
    ///
    /// Primitive and Immediate word classes
    ///
    class Prim {
        constructor(name, cat, xt) {
            this.name  = name             ///< name of the word
			this.cat   = cat
            this.xt    = xt               ///< function pointer
            this.immd  = false            ///< immediate flag
            this.token = _fence++         ///< word
        }
        exec() { this.xt(this) }
    }
    class Immd extends Prim {
        constructor(name, cat, xt) { super(name, cat, xt); this.immd=true }
    }
    ///
    /// Colon word class
    ///
    class Code {
        constructor(name, v=false) {
            this.name  = name             ///< name of the word
			this.cat   = "ud"             ///< user defined word
            this.xt    = null             ///< function pointer
            this.immd  = false            ///< immediate flag
            this.pf    = []               ///< parameter field

            let w = find(name);
            if (w != null) this.xt = w.xt
            
            if (typeof(v)=="boolean" && v) this.token = _fence++  // new user defined word
            else if (typeof(v)=="string")  this.qf = [ v ]
            else if (typeof(v)=="number")  this.qf = [ v ]
            
            this.pf.tail = function() { return this[this.length-1] }
        }
        exec() {                         /// run colon word
            if (this.xt == null) {       /// * user define word
                _rs.push(_wp)            /// * setup call frame
                _wp = this.token
                _run(this.pf)            /// * inner interpreter
                _wp = _rs.pop()          /// * restore call frame
            }
            else this.xt(this);          /// * build-it words
        }
    }
    ///====================================================================================
    /// @defgroup IO functions
    /// @{
    const log    = (s)=>output(s)
    const NA     = (s)=>s+" not found"
    const nxtok  = (d=SPC)=>{             /// assumes tib ends with a blank
        while (d==SPC &&
               (_tib[_ntib]==SPC || _tib[_ntib]=="\t")) _ntib++ // skip leading blanks and tabs
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
    /// @defgroup data conversion functions
    /// @{
    const INT    = v=>(v | 0)                             ///< OR takes 32-bit integer
    const BOOL   = t=>(t ? -1 : 0)                        ///< Forth true = -1 
    const ZERO   = v=>BOOL(Math.abs(v) < EPS)             ///< zero floating point
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
    const nword  = ()=>{                            ///< create a new word
        let s = nxtok();                            ///< fetch an input token
        if (s==null) { _compi=false; throw "more input" }
        dict.push(new Code(s, true))
    }
    const find   = (s)=>{                           ///< search through dictionary
        for (let i=dict.length-1; i>=0; --i) {      /// * search reversely
            if (s==dict[i].name) return dict[i]     /// * return word index
        }
        return null                                 /// * not found
    }
    const tok2w  = ()=>{                            ///< convert token to word
        let s=nxtok(), w=find(s)
        if (w==null) throw NA(s);
        return w
    }
    /// @}
    /// @defgroup built-in (branching, looping) functions
    /// @{
    const _docon = c=>push(c.qf[0])
    const _dovar = c=>push(c.token)
    const _bran  = c=>_run(ZERO(pop()) ? c.pf1 : c.pf)
    const _for   = c=>{
        do { _run(c.pf) }
        while (c.stage==0 && dec_i() >= 0)         /// for.{pf}.next only
        while (c.stage>0) {                        /// aft
            _run(c.pf2)                            /// aft.{pf2}.next
            if (dec_i() < 0) break
            _run(c.pf1)                            /// then.{pf1}.next
        }
        _rs.pop()                                  /// pop off I
    }
    const _loop  = c=>{
        while (true) {
            _run(c.pf)                             /// begin.{pf}.
            if (c.stage==0 && INT(pop())!=0) break /// until
            if (c.stage==1) continue               /// again
            if (c.stage==2 && ZERO(pop())) break   /// while
            _run(c.pf1)                            /// .{pf1}.until
        }
    }
    /// @}
    ///====================================================================================
    /// dictionary intialized with primitive words
    ///
    let dict = [
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
            push(m % n); push(INT(m / n)) }),
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
        new Prim("0=",    "bi", c=>push(ZERO(pop()))),
        new Prim("0<",    "bi", c=>push(BOOL(pop() < -EPS))),
        new Prim("0>",    "bi", c=>push(BOOL(pop() >  EPS))),
        new Prim("=",     "bi", c=>{ let n=pop(); push(ZERO(pop() - n)) }),
        new Prim("<",     "bi", c=>{ let n=pop(); push(BOOL((pop() - n) < -EPS)) }),
        new Prim(">",     "bi", c=>{ let n=pop(); push(BOOL((pop() - n) >  EPS)) }),
        new Prim("<>",    "bi", c=>{ let n=pop(); push(BOOL(ZERO(pop() - n)==0)) }),
        new Prim("<=",    "bi", c=>{ let n=pop(); push(BOOL(INT(pop()) <= INT(n))) }),
        new Prim(">=",    "bi", c=>{ let n=pop(); push(BOOL(INT(pop()) >= INT(n))) }),
        /// @}
        /// @defgroup IO ops
        /// @{
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
        new Prim("spaces","io", c=>{ for (let i=0, n=pop(); i<n; i++) log(SPC) }),
        /// @}
        /// @defgroup Literal ops
        /// @{
        new Prim("dolit", "li", c=>push(c.qf[0])),                // integer literal
        new Prim("dostr", "li", c=>push(c.token)),                // string literal
        new Prim("dotstr","li", c=>log(c.qf[0])),                 // print string
        new Immd("[",     "li", c=>_compi=false ),
        new Prim("]",     "li", c=>_compi=true ),
        new Prim("'",     "li", c=>{ let w=tok2w(); push(w.token) }),
        new Immd("s\"",   "li", c=>compile(new Code("dostr", nxtok('"')))),
        new Immd(".\"",   "li", c=>compile(new Code("dotstr", nxtok('"')))),
        new Immd("(",     "li", c=>nxtok(')')),
        new Immd(".(",    "li", c=>log(nxtok(')'))),
        new Immd("\\",    "li", c=>_ntib=_tib.length),
        /// @}
        /// @defgroup Branching - if.{pf}.then, if.{pf}.else.{pf1}.then
        /// @{
        new Immd("if",    "br", c=>{
            let w = new Code("_bran")
            w.xt = _bran; w.pf1=[]; w.stage=0        // stage for branching
            compile(w)
            dict.push(new Code("tmp")) }),           // as dict.tail()
        new Immd("else",  "br", c=>{
            let w=dict.word2(), tmp=dict.tail()
            w.pf.push(...tmp.pf); w.stage=1
            tmp.pf.length = 0 }),
        new Immd("then",  "br", c=>{
            let w=dict.word2(), tmp=dict.tail()
            if (w.stage==0) {
                w.pf.push(...tmp.pf)                 // copy tmp.pf into branch
                dict.pop()                           // drop tmp
            }
            else {
                w.pf1.push(...tmp.pf)
                if (w.stage==1) dict.pop()           // drop tmp
                else tmp.pf.length=0                 // for...aft...then
            } }),
        /// @}
        /// @defgroup Loop ops
        /// @brief begin.{pf}.again, begin.{pf}.until, begin.{pf}.while.{pf1}.repeat
        /// @{
        new Immd("begin", "br", c=>{
            compile(new Code("_loop"))
            dict.push(new Code("tmp"))
            let w = dict.word2()
            w.xt = _loop; w.pf1=[]; w.stage=0 }),
        new Immd("while", "br", c=>{               // begin...f.while...repeat
            let w=dict.word2(), tmp=dict.tail()
            w.pf.push(...tmp.pf); w.stage=2
            tmp.pf.length = 0 }),
        new Immd("repeat", "br", c=>{
            let w=dict.word2(), tmp=dict.tail()
            w.pf1.push(...tmp.pf)
            dict.pop() }),
        new Immd("again", "br", c=>{               // begin...again
            let w=dict.word2(), tmp=dict.tail()
            w.pf.push(...tmp.pf); w.stage=1
            dict.pop() }),
        new Immd("until", "br", c=>{               // begin...f.until
            let w=dict.word2(), tmp=dict.tail()
            w.pf.push(...tmp.pf)
            dict.pop() }),
        /// @}
        /// @defgroup Loop ops
        /// @brief for.{pf}.next, for.{pf}.aft.{pf1}..then.{pf2}.next
        /// @{
        new Immd("for",   "br", c=>{                    // for...next
            compile(new Code(">r"));
            compile(new Code("_for"))
            dict.push(new Code("tmp"))
            let w=dict.word2()
            w.xt = _for; w.stage=0; w.pf1=[] }),
        new Immd("aft",   "br", c=>{
            let w=dict.word2(), tmp=dict.tail()
            w.pf.push(...tmp.pf); w.stage=3; w.pf2=[]   // for...aft
            tmp.pf.length=0 }),
        new Immd("next",  "br", c=>{
            let w=dict.word2(), tmp=dict.tail()
            if (w.stage==0) w.pf.push(...tmp.pf)        // for...next
            else            w.pf2.push(...tmp.pf)       // then...next
            dict.pop() }),
        new Prim(">r",    "br", c=>_rs.push(pop())),    // push into rstack
        new Prim("r>",    "br", c=>push(_rs.pop())),    // pop from rstack
        new Prim("r@",    "br", c=>push(rtop())),       // fetch from rstack
        new Prim("i",     "br", c=>push(rtop())),       // same as r@
        /// @}
        /// @defgroup Memory Access ops
        /// @{
        new Prim("?",        "ma", c=>log(dict[pop()].val[0].toString(_base)+SPC)),
        new Prim("@",        "ma", c=>push(dict[pop()].val[0])),                              // w -- n
        new Prim("!",        "ma", c=>{ let w=pop(); dict[w].val[0]=pop() }),                 // n w  --
        new Prim("+!",       "ma", c=>{ let w=pop(); dict[w].val[0]+=pop() }),                // n w --
        new Prim("allot",    "ma", c=>{                                                       // n -- 
			nvar(_dovar, 0)                                           // create qf array
            for (let n=pop(), i=1; i<n; i++) dict.tail().val[i]=0 }), // fill all slot with 0
        new Prim("n?",       "ma", c=>{                                                       // w i --
            let i=pop(); let w=pop(); log(dict[w].val[i].toString(_base)+SPC) }),
        new Prim("n@",       "ma", c=>{ let i=pop(); let w=pop(); push(dict[w].val[i]) }),    // w i -- n
        new Prim("n!",       "ma", c=>{ let i=pop(); let w=pop(); dict[w].val[i]=pop() }),    // n w i --
        /// @}
        /// @defgroup Word Defining ops
        /// @{
        new Immd("exec",     "mc", c=>dict[pop()].exec()),
        new Prim(":",        "mc", c=>{ nword(); _compi=true }),     // new colon word
        new Immd(";",        "mc", c=>_compi=false),                 // semicolon
        new Immd("variable", "mc", c=>(nword(), nvar(_dovar, 0))),
        new Immd("constant", "mc", c=>(nword(), nvar(_docon, pop()))),
        new Prim("create",   "mc", c=>nword()),                      // create new word
        new Prim(",",        "mc", c=>{                              // push TOS into qf
            let pf = dict.tail().pf
            if (pf.length) pf[0].qf.push(pop())                      // append more values
            else           nvar(_dovar, pop())                       // 1st value in qf
        }),
        new Prim("does",     "mc", c=>{
            let w=dict.tail(), src=dict[_wp].pf
            for (var i=0; i < src.length; i++) {
                if (src[i].name=="does") w.pf.push(...src.slice(i+1))
            }
            throw "does"                                             // break from inner interpreter
        }),
        new Prim("to",       "mc", c=>tok2w().val[0]=pop()),         // update constant
        new Prim("is",       "mc", c=>{                              // n -- alias a word
            nword(); dict.tail().pf = dict[pop()].pf
        }),
        /// @}
        /// @defgroup System ops
        /// @{
        new Prim("exit",     "os", c=>{ throw "exit" }),             // exit inner interpreter
        new Prim("time",     "os", c=>push(Date.now())),
        new Prim("delay",    "os", c=>sleep(pop()).then(()=>{})),
        /// @}
        /// @defgroup Debugging ops
        /// @{
        new Prim("here",     "os", c=>push(dict.tail().token)),
        new Prim("words",    "os", c=>{
			let sz = 0
            dict.forEach((w,i)=>{
				log(w.name+SPC)
				sz += w.name.length + 1
				if (sz > 52) { log(CR); sz = 0 }
			})
		}),
        new Prim("dump",     "os", c=>{
            log("dict["+CR)
            dict.forEach((w,i)=>{
                log('{name:"'+w.name+'", xt:'+w.xt.toString(_base))
                if (w.pf)   log(', pf:['+w.pf.toString(_base)+']')
                if (w.qf)   log(', qf:['+w.qf.toString(_base)+']')
                if (w.immd) log(' ,immd:'+w.immd)
                log("}},"+CR)
            })
            log("]"+CR)
        }),
        new Prim("see",      "os", c=>{
            let w = tok2w(); console.log(w); log(w) }),   // pass object directly to browser console
        new Prim("forget",   "os", c=>{
            _fence=Math.max(tok2w().token, find("boot").token+1)
            dict.splice(_fence) }),
        new Prim("boot",     "os", c=>dict.splice(_fence=find("boot").token+1))
        /// @}
    ]
    ///
    /// @defgroup add dictionary access methods
    /// @{
    dict.tail = function(i=1) { return this[this.length-i]    }
    dict.word2= function()    { return dict.tail(2).pf.tail() }
    /// @}
    /// Forth initializer method
    ///
    this.init = ()=>{
        log("<h2>eForth.js 8.0</h2><h3>...eForth with Javascript</h3>")
    }
    ///
    /// outer interpreter method - main loop
    /// @param row one line of input
    ///
    this.outer = (row)=>{
        _tib=row; _ntib=0                                /// capture into TIB
        for (let s=nxtok(); s!=null; s=nxtok()) {        /// * loop through tokens
            let w=find(s)                                /// * search throug dictionary
            if (w!=null) {                               /// * word found?
                if((!_compi) || w.immd) {                /// * in interpret mode?
                    try       { w.exec() }               ///> execute word
                    catch (e) { log(e) }
                }
                else compile(w)                          ///> or compile word 
            }
            else {                                       /// * word not found
                let n=_base!=10                          ///> not word, try as number
                    ? parseInt(s, _base)
                    : parseFloat(s)
                if (isNaN(n)) {                          ///> * not a number?
                    log(s + "? ")                        ///>> display prompt
                    _compi=false                         ///>> restore interpret mode
                }
                else if (_compi) {                       ///> in compile mode?
                    compile(new Code("dolit", n))        ///>> compile the number
                }
                else push(n)                             ///>> or, push number onto stack top
            }
        }
    }
    this.data = (d)=>{
        switch (d) {
        case "dc": return dict.map(v=>v.name+SPC+v.cat+SPC+v.token)
        case "ss": return _ss.map(v=>v.toString(_base))
        case "rs": return _rs.map(v=>v.toString(_base))
        }
    }
    this.exec   = (cmd)=>{
        cmd.split("\n").forEach(r=>{ this.outer(r+SPC); log("ok\n") })
    }
}
