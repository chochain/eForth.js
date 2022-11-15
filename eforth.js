'use strict';
///
/// eForth.js Virtual Machine factory function
///
window.ForthVM = function(output=console.log) {
    let SPC=" ", CR="\n"                  ///< string constants
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
    ///====================================================================================
    /// Primitive and Immediate word classes
    ///
    class Prim {
        constructor(name, xt) {
            this.name  = name             ///< name of the word
            this.xt    = xt               ///< function pointer
            this.immd  = false            ///< immediate flag
            this.token = _fence++         ///< word
        }
        exec() { this.xt(this) }
    }
    class Immd extends Prim {
        constructor(name, xt) { super(name, xt); this.immd=true }
    }
    ///
    /// Colon word class
    ///
    class Code {
        constructor(name, v=false) {
            this.name  = name             ///< name of the word
            this.xt    = null             ///< function pointer
            this.immd  = false            ///< immediate flag
            this.pf    = []               ///< parameter field
            
            let w = find(name);
            if (w != null) this.xt = w.xt
            
            if (typeof(v)=="boolean" && v) this.token = _fence++  // new user defined word
            else if (typeof(v)=="string")  this.pf.push(v)
            else if (typeof(v)=="number")  this.pf.push(v)
            
            this.pf.tail = function(i=1) { return this[this.length-1] }
        }
        exec() {                                          /// run colon word
            if (this.xt == null) {                        /// * user define word
                let tmp = _wp
                _wp = this.token                          /// * keep word ref
                this.pf.forEach(w=>w.exec())              /// * inner interpreter
                _wp = tmp                                 /// * restore word ref
            }
            else this.xt(this);                           /// * build-it words
        }
    }
    ///====================================================================================
    /// @defgroup IO functions
    /// @{
    const log    = (s)=>output(s)
    const NA     = (s)=>s+" not found"
    const nxtok  = (d=" ")=>{             /// assumes tib ends with a blank
        while (d==" " &&
               (_tib[_ntib]==" " || _tib[_ntib]=="\t")) _ntib++ // skip leading blanks and tabs
        let i = _tib.indexOf(d, _ntib)
        let s = (i==-1) ? null : _tib.substring(_ntib, i); _ntib=i+1
        return s
    }
    /// @}
    /// @defgroup Stack functions
    /// @{
    const top    = (n=1)=>_ss[_ss.length-n]
    const push   = v=>_ss.push(v)
    const pop    = ()=>_ss.pop()
    const remove = n=>{ let v=top(n); _ss.splice(length-n,1); return v }
    const rtop   = (n=1)=>_rs[_rs.length-n]
    const rpush  = v=>_rs.push(v)
    const rpop   = ()=>_rs.pop()
    const dec_i  = ()=>_rs[_rs.length-1]-=1
    /// @}
    /// @defgroup Utilities functions
    /// @{
    const comma  = (w)=>{                           ///< add word to pf[]
        dict.tail().pf.push(w)                      /// * append Code obj
    }
    const nvar   = (xt, v=null)=>{
        let t = dict.tail()                         ///< last word of dict
        if (v!=null) t.pf.push(v)                   /// * literal in pf
        t.xt = xt                                   /// * set func ptr
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
    const sleep  = (ms)=>{
        return new Promise(rst=>setTimeout(rst,ms))
    }
    /// @}
    /// @defgroup built-in (branching, looping) functions
    /// @{
    const _docon = c=>push(c.pf[0])
    const _dovar = c=>push(c.token)
    const _dolit = c=>push(c.pf[0])                // integer literal
    const _dostr = c=>push(c.token)                // string literal
    const _dotstr= c=>log(c.pf[0])
    const _bran  = c=>{ (pop()!=0 ? c.pf : c.pf1).forEach(w=>w.exec()) }
    const _for   = c=>{
        do { c.pf.forEach(w=>w.exec()) }           // for
        while (c.stage==0 && dec_i()>=0)           // for...next only
        while (c.stage>0) {                        // aft
            c.pf2.forEach(w=>w.exec())             // then...next
            if (dec_i()<0) break
            c.pf1.forEach(w=>w.exec())             // aft...
        }
        rpop()
    }
    const _loop  = c=>{
        while (true) {
            c.pf.forEach(w=>w.exec())
            if (c.stage==0 && pop()!=0) break      // until
            if (c.stage==1) continue               // again
            if (c.stage==2 && pop()==0) break      // while
            c.pf1.forEach(w=>w.exec())             // then
        }
    }
    /// @}
    ///====================================================================================
    /// dictionary intialized with primitive words
    ///
    let dict = [
        /// @defgroup Stack ops
        /// @{
        new Prim("dup",   c=>push(top())),
        new Prim("drop",  c=>pop()),
        new Prim("over",  c=>push(top(2))),
        new Prim("swap",  c=>push(remove(2))),
        new Prim("rot",   c=>push(remove(3))),
        new Prim("-rot",  c=>_ss.splice(-2, 0, pop())),
        new Prim("pick",  c=>{ let i=pop(), n=top(i+1);    push(n) }),
        new Prim("roll",  c=>{ let i=pop(), n=remove(i+1); push(n) }),
        new Prim("nip",   c=>remove(2)),
        new Prim(">r",    c=>rpush(pop())),
        new Prim("r>",    c=>push(rpop())),
        new Prim("r@",    c=>push(rtop())),
        new Prim("push",  c=>rpush(pop())),
        new Prim("pop",   c=>push(rpop())),
        new Prim("2dup",  c=>{ push(top(2)); push(top(2)) }),
        new Prim("2drop", c=>_ss.splice(-2)),
        new Prim("2over", c=>{ push(top(4)); push(top(4)) }),
        new Prim("2swap", c=>{ push(remove(4)); push(remove(4)) }),
        /// @}
        /// @defgroup Arithmetic ops
        /// @{
        new Prim("+",     c=>{ let n=pop(); push(pop()+n) }),
        new Prim("-",     c=>{ let n=pop(); push(pop()-n) }),
        new Prim("*",     c=>{ let n=pop(); push(pop()*n) }),
        new Prim("/",     c=>{ let n=pop(); push(pop()/n) }),
        new Prim("mod",   c=>{ let n=pop(); push(pop()%n) }),
        new Prim("*/",    c=>{ let n=pop(); push(pop()*pop()/n) }),
        new Prim("*/mod", c=>{ let n=pop(), m=pop()*pop();
                               push(m%n); push(Math.floor(m/n)) }),
        new Prim("and",   c=>push(pop()&pop())),
        new Prim("or",    c=>push(pop()|pop())),
        new Prim("xor",   c=>push(pop()^pop())),
        new Prim("negate",c=>push(-pop())),
        new Prim("abs",   c=>push(Math.abs(pop()))),
        /// @}
        /// @defgroup Logic ops
        /// @{
        new Prim("0=",    c=>push((pop()==0)?-1:0)),
        new Prim("0<",    c=>push((pop() <0)?-1:0)),
        new Prim("0>",    c=>push((pop() >0)?-1:0)),
        new Prim("=",     c=>{ let n=pop(); push((pop()==n)?-1:0) }),
        new Prim(">",     c=>{ let n=pop(); push((pop()>n )?-1:0) }),
        new Prim("<",     c=>{ let n=pop(); push((pop()<n )?-1:0) }),
        new Prim("<>",    c=>{ let n=pop(); push((pop()!=n)?-1:0) }),
        new Prim(">=",    c=>{ let n=pop(); push((pop()>=n)?-1:0) }),
        new Prim("<=",    c=>{ let n=pop(); push((pop()<=n)?-1:0) }),
        /// @}
        /// @defgroup IO ops
        /// @{
        new Prim("base@", c=>push(_base)),
        new Prim("base!", c=>_base=pop()),
        new Prim("hex",   c=>_base=16),
        new Prim("decimal",c=>_base=10),
        new Prim("cr",    c=>log(CR)),
        new Prim(".",     c=>log(pop().toString(_base)+" ")),
        new Prim(".r",    c=>{
            let n=pop(), s=pop().toString(_base)
            for(let i=0; i+s.length<n; i++) log(SPC)
            log(s+SPC) }),
        new Prim(".r",    c=>{
            let n=pop(), s=pop().toString(_base)
            for(let i=0; i+s.length<n; i++) log(SPC)
            log(s+SPC) }),
        new Prim("u.r",   c=>{
            let n=pop(), s=(pop()&0x7fffffff).toString(_base)
            for(let i=0; i+s.length<n; i++) log(SPC)
            log(s+SPC) }),
        new Prim("key",   c=>push(nxtok()[0])),
        new Prim("emit",  c=>log(String.fromCharCode(pop()))),
        new Prim("space", c=>log(SPC)),
        new Prim("spaces",c=>{ for (let i=0, n=pop(); i<n; i++) log(SPC) }),
        /// @}
        /// @defgroup Literal ops
        /// @{
        new Immd("[",     c=>_compi=false ),
        new Prim("]",     c=>_compi=true ),
        new Prim("'",     c=>{ let w=tok2w(); push(w.token) }),
        new Immd("$\"",   c=>{                       // -- w a
            lastword().add(new Code("_dostr", nxtok("\"")))
            push(dict.tail().token)
            push(dict.pf.tail()) }),
        new Immd(".\"",   c=>comma(new Code("_dotstr", nxtok("\"")))),
        new Immd("(",     c=>nxtok(")")),
        new Immd(".(",    c=>log(nxtok(")"))),
        new Immd("\\",    c=>_ntib=_tib.length),
        /// @}
        /// @defgroup Branching - if else then
        /// @{
        new Immd("if",    c=>{
            comma(new Code("_bran"))
            dict.push(new Code("tmp"))               // as dict.tail()
            let w=dict.pword()
            w.xt = _bran; w.pf1=[]; w.stage=0 }),    // stage for branching
        new Immd("else",  c=>{
            let w=dict.pword(), tmp=dict.tail()
            w.pf.push(...tmp.pf); w.stage=1
            tmp.pf.length = 0 }),
        new Immd("then",  c=>{
            let w=dict.pword(), tmp=dict.tail()
            if (w.stage==0) {
                w.pf.push(...tmp.pf);                // copy tmp.pf into branch
                dict.pop()                           // drop tmp
            }
            else {
                w.pf1.push(...tmp.pf)
                if (w.stage==1) dict.pop()           // drop tmp
                else tmp.pf.length=0                 // for...aft...then
            } }),
        /// @}
        /// @defgroup Loop ops
        /// @brief begin...again, begin...until, begin...while...repeat
        /// @{
        new Immd("begin", c=>{
            comma(new Code("_loop"))
            dict.push(new Code("tmp"))
            let w = dict.pword()
            w.xt = _loop; w.pf1=[]; w.stage=0 }),
        new Immd("while", c=>{                     // begin...f.while...repeat
            let w=dict.pword(), tmp=dict.tail()
            w.pf.push(...tmp.pf); w.stage=2
            tmp.pf.length = 0 }),
        new Immd("repeat", c=>{
            let w=dict.pword(), tmp=dict.tail()
            w.pf1.push(...tmp.pf)
            dict.pop() }),
        new Immd("again", c=>{                     // begin...again
            let w=dict.pword(), tmp=dict.tail()
            w.pf.push(...tmp.pf); w.stage=1
            dict.pop() }),
        new Immd("until", c=>{                     // begin...f.until
            let w=dict.pword(), tmp=dict.tail()
            w.pf.push(...tmp.pf)
            dict.pop() }),
        /// @}
        /// @defgroup Loop ops
        /// @brief for...next, for...aft...then...next
        /// @{
        new Prim("i",     c=>push(rtop())),
        new Immd("for",   c=>{                         // for...next
            comma(new Code(">r"));
            comma(new Code("_for"))
            dict.push(new Code("tmp"))
            let w=dict.pword()
            w.xt = _for; w.stage=0; w.pf1=[] }),
        new Immd("aft",   c=>{
            let w=dict.pword(), tmp=dict.tail()
            w.pf.push(...tmp.pf); w.stage=3; w.pf2=[]   // for...aft
            tmp.pf.length=0 }),
        new Immd("next",  c=>{
            let w=dict.pword(), tmp=dict.tail()
            if (w.stage==0) w.pf.push(...tmp.pf)        // for...next
            else            w.pf2.push(...tmp.pf)       // then...next
            dict.pop() }),
        /// @}
        /// @defgroup Word Defining ops
        /// @{
        new Immd("exec",     c=>dict[pop()].exec()),
        new Prim(":",        c=>{ nword(); _compi=true }),    // new colon word
        new Immd(";",        c=>_compi=false),                // semicolon
        new Immd("variable", c=>(nword(), nvar(_dovar, 0))),
        new Immd("constant", c=>(nword(), nvar(_docon, pop()))),
        /// @}
        /// @defgroup Memory Access ops
        /// @{
        new Prim("?",        c=>log(dict[pop()].pf[0].toString(_base)+" ")),
        new Prim("@",        c=>push(dict[pop()].pf[0])),                              // w -- n
        new Prim("!",        c=>{ let w=pop(); dict[w].pf[0]=pop() }),                 // n w  --
        new Prim("+!",       c=>{ let w=pop(); dict[w].pf[0]+=pop() }),                // n w --
        new Prim("n?",       c=>{                                                      // w i --
            let i=pop(); let w=pop(); log(dict[w].pf[i].toString(_base)+" ") }),
        new Prim("n@",       c=>{ let i=pop(); let w=pop(); push(dict[w].pf[i]) }),    // w i -- n
        new Prim("n!",       c=>{ let i=pop(); let w=pop(); dict[w].pf[i]=pop() }),    // n w i --
        new Prim("allot",    c=>{ for (let n=pop(), i=0; i<n; i++) dict.tail().pf[i]=0 }),  // n -- 
        /// @}
        /// @defgroup metacompiler
        /// @{
        new Prim("create",   c=>(nword(), nvar(_dovar))),     // create new word
        new Prim(",",        c=>comma(pop())),                 // n --
        new Prim("does",     c=>{
            let i=0, word=dict.tail(), src=dict[_wp].pf
            while (i<src.length && src[i].name!="does") i++;
            if (++i<src.length) word.pf.push(...src.slice(i)) }),
        new Prim("to",       c=>tok2w().pf[0].qf[0]=pop()),    // update constant
        new Prim("is",       c=>tok2w().pf = dict[pop()].pf),  // alias a word
        /// @}
        /// @defgroup System ops
        /// @{
        new Prim("exit",     c=>{ throw "close app" }),     // exit interpreter
        new Prim("time",     c=>push(Date.now())),
        new Prim("delay",    c=>sleep(pop()).then(()=>{})),
        /// @}
        /// @defgroup Debugging ops
        /// @{
        new Prim("here",     c=>push(dict.tail().token)),
        new Prim("words",    c=>
                 dict.forEach((w,i)=>log(w.name+((i%10)==9 ? CR : SPC)))),
        new Prim("see",      c=>{
            let w = tok2w(); console.log(w); log(w) }),   // pass object directly to browser console
        new Prim("forget",   c=>{
            _fence=Math.max(tok2w().token, find("boot").token+1)
            dict.splice(_fence) }),
        new Prim("boot",     c=>dict.splice(_fence=find("boot").token+1))
        /// @}
    ]
    ///
    /// @defgroup add dictionary access methods
    /// @{
    dict.tail = function(i=1) { return this[this.length-i]    }
    dict.pword= function()    { return dict.tail(2).pf.tail() }
    /// @}
    /// Forth initializer method
    ///
    this.init = ()=>{
        log("<h2>eForth.js 4.0</h2><h3>...eForth with Javascript</h3>")
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
                else comma(w)                            ///> or compile word 
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
                    comma(new Code("_dolit", n))         ///>> compile the number
                }
                else push(n)                             ///>> or, push number onto stack top
            }
        }
    }
    this.data = (d)=>{
        switch (d) {
        case "dc": return dict.map(v=>v.name+SPC+v.token)
        case "ss": return _ss.map(v=>v.toString(_base))
        case "rs": return _rs.map(v=>v.toString(_base))
        }
    }
    this.exec   = (cmd)=>{
        cmd.split("\n").forEach(r=>{ this.outer(r+" "); log("ok\n") })
    }
}
