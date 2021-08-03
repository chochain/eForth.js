'use strict';
///
/// jeForth Virtual Machine factory function
///
window.ForthVM = function(output=console.log) {
    let fence = 0
    ///
    /// Primitive word class
    ///
    class Prim {
        constructor(name, xt) {
            this.name=name; this.xt=xt; this.token=fence++; this.immd=false
        }
        exec() { this.xt(this) }
    }
    ///
    /// Immediate word class
    ///
    class Immd extends Prim {
        constructor(name, xt) { super(name, xt); this.immd=true; }
    }
    ///
    /// Colon word class
    ///
    class Code {
        constructor(name, n=false) {
            this.name=name; this.xt=null; this.immd=0; this.pf=[]
            let w = find(name); if (w!=null) this.xt = w.xt
            if (typeof(n)=="boolean" && n) this.token=fence++
            else if (typeof(n)=="string")  this.literal=n
            else if (typeof(n)=="number")  this.qf = [ n ]
            this.pf.tail = function(i=1) { return this[this.length-i] }
        }
        exec() {                                          /// run colon word
            if (this.xt!=null) { this.xt(this); return }  /// dolit, dostr,...
            this.pf.forEach((w,i)=>{                      /// inner interpreter
                try   { w.exec() }
                catch (e) {}
            })
        }
        addcode(w) { this.pf.push(w); return this }
    }
    ///
    /// @defgroup Virtual Machine Internal variables
    /// @{
    let ss=[], rs=[]                      /// stacks
    let tib="", ntib=0, base=10           /// internal variables
    let cmpl=false
    /// @}
    /// @defgroup IO functions
    /// @{
    const log    = (s)=>output(s)
    const NA     = (s)=>s+" not found"
    const ss_ok  = ()=>" "+ss.map(v=>v.toString(base)).join("_")+"_ok "
    const ntok   = (d=' ')=>{
        let i = tib.indexOf(d, ntib)
        if (i<0) { ntib=0; return null }
        let s = tib.substring(ntib, i); ntib=i+1; return s
    }
    /// @}
    /// @defgroup Stack functions
    /// @{
    const top    = (n=1)=>ss[ss.length-n]
    const push   = v=>ss.push(v)
    const pop    = ()=>ss.pop()
    const remove = n=>{ let v=top(n); ss.splice(length-n,1); return v }
    const topR   = (n=1)=>rs[rs.length-n]
    const pushR  = v=>rs.push(v)
    const popR   = ()=>rs.pop()
    const decR   = ()=>rs[rs.length-1]-=1
    /// @}
    /// @defgroup Utilities functions
    /// @{
    const nword  = ()=>{
        let s=ntok(); if (s==null) { cmpl=false; throw "more input" }
        dict.push(new Code(s, true))
        return dict.tail()
    }
    const find   = (s)=>{
        for (let i=dict.length-1; i>=0; --i) {      /// search reversely
            if (s==dict[i].name) return dict[i]
        }
        return null
    }
    const tok2w  = ()=>{                            /// token to word
        let s=ntok(), w=find(s)
        if (w==null) throw NA(s);
        return w
    }
    const sleep  = (ms)=>{
        return new Promise(rst=>setTimeout(rst,ms))
    }
    /// @}
    /// dictionary intialized with primitive words
    ///
    let dict = [
        /// @defgroup Stack ops
        /// @{
        new Prim("dup",   c=>push(top())),
        new Prim("over",  c=>push(top(2))),
        new Prim("2dup",  c=>push(...ss.slice(-2))),
        new Prim("2over", c=>push(...ss.slice(-4,-2))),
        new Prim("4dup",  c=>push(...ss.slice(-4))),
        new Prim("swap",  c=>push(remove(2))),
        new Prim("rot",   c=>push(remove(3))),
        new Prim("-rot",  c=>ss.splice(-2, 0, pop())),
        new Prim("2swap", c=>{ push(remove(4)); push(remove(4)) }),
        new Prim("pick",  c=>{ let i=pop(), n=top(i+1);    push(n) }),
        new Prim("roll",  c=>{ let i=pop(), n=remove(i+1); push(n) }),
        new Prim("drop",  c=>pop()),
        new Prim("nip",   c=>remove(2)),
        new Prim("2drop", c=>ss.splice(-2)),
        new Prim(">r",    c=>pushR(pop())),
        new Prim("r>",    c=>push(popR())),
        new Prim("r@",    c=>push(topR())),
        new Prim("push",  c=>pushR(pop())),
        new Prim("pop",   c=>push(popR())),
        /// @}
        /// @defgroup Arithmetic ops
        /// @{
        new Prim("+",     c=>{ let n=pop(); push(pop()+n) }),
        new Prim("-",     c=>{ let n=pop(); push(pop()-n) }),
        new Prim("*",     c=>{ let n=pop(); push(pop()*n) }),
        new Prim("/",     c=>{ let n=pop(); push(pop()/n) }),
        new Prim("*/",    c=>{ let n=pop(); push(pop()*pop()/n) }),
        new Prim("*/mod", c=>{ let n=pop(), m=pop()*pop(); push(m%n); push(m/n) }),
        new Prim("mod",   c=>{ let n=pop(); push(pop()%n) }),
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
        new Prim("base@", c=>push(base)),
        new Prim("base!", c=>base=pop()),
        new Prim("hex",   c=>base=16),
        new Prim("decimal",c=>base=10),
        new Prim("cr",    c=>log("\n")),
        new Prim(".",     c=>log(pop().toString(base))),
        new Prim(".r",    c=>{
            let n=pop(), s=pop().toString(base)
            for(let i=0; i+s.length<n; i++) log(" ")
            log(s+" ") }),
        new Prim(".r",    c=>{
            let n=pop(), s=pop().toString(base)
            for(let i=0; i+s.length<n; i++) log(" ")
            log(s+" ") }),
        new Prim("u.r", c=>{
            let n=pop(), s=(pop()&0x7fffffff).toString(base)
            for(let i=0; i+s.length<n; i++) log(" ")
            log(s+" ") }),
        new Prim("key", c=>push(ntok()[0])),
        new Prim("emit", c=>log(String.fromCharCode(pop()))),
        new Prim("space", c=>log(" ")),
        new Prim("spaces", c=>{ for (let i=0, n=pop(); i<n; i++) log(" ") }),
        /// @}
        /// @defgroup Literal ops
        /// @{
        new Prim("[", c=>cmpl=false ),
        new Prim("]", c=>cmpl=true ),
        new Prim("'", c=>{ let w=tok2w(); push(w.token) }),
        new Prim("dolit", c=>push(c.qf[0])),         // integer literal
        new Prim("dostr", c=>push(c.token)),         // string literal
        new Immd("$\"", c=>{                         // -- w a
            let s=ntok('"'), last=dict.tail()
            last.addcode(new Code("dostr", s))
            push(last.token)
            push(dict.pf.tail()) }),
        new Prim("dotstr",c=>log(c.literal)),
        new Immd(".\"", c=>{
            let s = ntok('"')
            dict.tail().addcode(new Code("dotstr", s)); ntok() }),
        new Prim("(",   c=>{ let s=ntok(')'); ntok() }),
        new Immd(".(",  c=>{ let s=ntok(')'); ntok(); log(s) }),
        new Immd("\\",  c=>ntib=tib.length),
        /// @}
        /// @defgroup Branching - if else then
        /// @{
        new Prim("bran",c=>(pop()==0 ? c.pf1 : c.pf).forEach(w=>w.exec())),
        new Immd("if",  c=>{
            dict.tail().addcode(new Code("bran"))
            dict.push(new Code("temp"))
            dict.lastpf().stage=0 }),
        new Immd("else",c=>{
            let last=dict.lastpf(), temp=dict.tail()
            last.pf.push(...temp.pf)
            temp.pf = []
            last.stage=1 }),
        new Immd("then", c=>{
            let last=dict.lastpf(), temp=dict.tail()
            if (last.stage==0) {
                last.pf.push(...temp.pf)
                dict.pop()                           // drop temp
            }
            else {
                if (last.pf1==null) last.pf1=[]
                last.pf1.push(...temp.pf)
                if (last.stage==1) dict.pop()
                else temp.pf=[]
            } }),
        /// @}
        /// @defgroup Loop ops
        /// @brief begin...again, begin...until, begin...while...repeat
        /// @{
        new Prim("loop", c=>{
            while (true) {
                c.pf.forEach(w=>w.exec())
                if (c.stage==0) continue           // again
                if (c.stage==1 && pop()!=0) break  // until
                if (c.stage==2 && pop()!=0) {      // while
                    c.pf1.forEach(w=>w.exec())
                }
            } }),
        new Immd("begin", c=>{
            dict.tail().addcode(new Code("loop"))
            dict.push(new Code("temp")) }),
        new Immd("again", c=>{                     // begin...again
            let last=dict.lastpf(), temp=dict.tail()
            last.pf.push(...temp.pf)
            last.stage=0
            dict.pop() }),
        new Immd("until", c=>{                     // begin...f.until
            let last=dict.lastpf(), temp=dict.tail()
            last.pf.push(...temp.pf)
            last.stage=1
            dict.pop() }),
        new Immd("while", c=>{                     // begin...f.while...repeat
            let last=dict.lastpf(), temp=dict.tail()
            last.pf.push(...temp.pf)
            temp.pf = []
            last.stage=2 }),
        new Immd("repeat", c=>{
            let last=dict.lastpf(), temp=dict.tail()
            if (last.pf1==null) last.pf1=[]
            last.pf1.push(...temp.pf)
            dict.pop() }),
        /// @}
        /// @defgroup Loop ops
        /// @brief for...next, for...aft...then...next
        /// @{
        new Prim("i",     c=>push(topR())),
        new Prim("cycle", c=>{
            do {
                c.pf.forEach(w=>w.exec())
                if (c.stage==0 || decR()==0) { popR(); break }
            } while (c.stage==0)                           // for...next
            while (c.stage>0) {
                c.pf2.forEach(w=>w.exec())                 // then...
                if (decR()<0) { popR(); break }            // next
                c.pf1.forEach(w=>w.exec())                 // aft...
            } }),
        new Immd("for", c=>{               // for...next
            dict.tail()
                .addcode(new Code(">r"))
                .addcode(new Code("cycle"))
            dict.push(new Code("temp"))
            dict.lastpf().stage=0 }),
        new Immd("aft", c=>{               // for...aft...then...next
            let last=dict.lastpf(), temp=dict.tail()
            last.pf.push(...temp.pf)
            temp.pf=[]
            last.stage=3 }),
        new Immd("next", c=>{
            let last=dict.lastpf(), temp=dict.tail()
            if (last.stage==0) last.pf.push(...temp.pf)  // for...next
            else {
                if (last.pf2==null) last.pf2=[]          // for...aft...
                last.pf2.push(...temp.pf)
            }
            dict.pop() }),
        /// @}
        /// @defgroup Word Defining ops
        /// @{
        new Prim("exec",  c=>dict[pop()].exec()),
        new Prim(":",     c=>{ nword(); cmpl=true }),    // new colon word
        new Immd(";",     c=>cmpl=false),                // semicolon
        new Prim("docon", c=>push(c.qf[0])),
        new Prim("dovar", c=>push(c.token)),
        new Prim("create",c=>{
            let last=nword().addcode(new Code("dovar",0))
            last.pf[0].token=last.token; last.pf[0].qf.shift() }),
        new Immd("variable", c=>{
            let last=nword().addcode(new Code("dovar",0))
            last.pf[0].token=last.token }),
        new Immd("constant", c=>{
            let last=nword().addcode(new Code("docon", pop()))
            last.pf[0].token=last.token }),
        /// @}
        /// @defgroup Memory Access ops
        /// @{
        new Prim("?", c=>log(dict[pop()].pf[0].qf[0].toString(base))),
        new Prim("@", c=>push(dict[pop()].pf[0].qf[0])),
        new Prim("!", c=>{ let i=pop(); dict[i].pf[0].qf[0]=pop() }),
        new Prim("+!",c=>{ let i=pop(); dict[i].pf[0].qf[0]+=pop() }),
        new Prim("array@", c=>{ let a=pop(); push(dict[pop()].pf[0].qf[a]) }),
        new Prim("array!", c=>{ let a=pop(); dict[pop()].pf[0].qf[a]=pop() }),
        new Prim(",", c=>dict.tail().pf[0].qf.push(pop())),
        new Prim("allot", c=>{
            let n=pop(), qf=dict.tail().pf[0].qf
            for (let i=0; i<n; i++) qf[i]=0  }),
        /*
          new Immd("does", c=>{ // n --
          let last=dict.tail(), src=dict[wp]
          last.pf.push(...src.pf.subList(ip+2,src.pf.length)) }),
          new Immd("to", c=>{                              // n -- , compile only 
          let last=dict[wp]
          ip++;                                        // current colon word
          last.pf[ip++].pf[0].qf[0]=pop() }),          // next constant
          new Prim("is", c=>{ let w=tok2w(); dict[w.token].pf = dict[pop()].pf }),
        */
        /// @}
        /// @defgroup System ops
        /// @{
        new Prim("exit",  c=>{ throw "close app" }),     // exit interpreter
        new Prim("time",  c=>push(Date.getTime())),
        new Prim("delay", c=>sleep(pop()).then(()=>{})),
        /// @}
        /// @defgroup Debugging ops
        /// @{
        new Prim("hi",   c=>log("jeforth 4.0\n")),
        new Prim("here",  c=>push(dict.tail().token)),
        new Prim("forget",c=>dict.splice(tok2w().token)),
        new Prim("words", c=>
                 dict.forEach((w,i)=>log(((i%5)==0 ? "\n" : " ")+w.name))),
        new Prim(".s",   c=>console.log(ss)),
        new Prim("see",  c=>console.log(tok2w())),
        new Prim("boot", c=>dict.splice(find("boot").token+1))
        /// @}
    ]
    //
    // add dictionary access methods
    //
    dict.tail   = function(i=1) { return this[this.length-i]    }
    dict.lastpf = function()    { return this.tail(2).pf.tail() }
    ///
    /// initializer method
    ///
    this.init = ()=>{
        log("jeforth 4.0\n")
    }
    ///
    /// outer interpreter method - main loop
    /// @param cmd one line of input
    ///
    this.outer = (cmd)=>{
        tib = cmd                                       /// capture into TIB
        for (let s=ntok(); s!=null; s=ntok()) {         /// * loop through tokens
            let w = find(s)                             /// * search throug dictionary
            if (w!=null) {                              /// * word found?
                console.log(s+"=>"+w.token)
                if((!cmpl) || w.immd) {                 /// * in interpret mode?
                    try       { w.exec() }              ///> execute word
                    catch (e) { log(e) }
                }
                else dict.tail().addcode(w)              ///> or compile word 
            }
            else {                                       /// * word not found
                try {
                    let n=parseInt(s, base)              ///> not word, try number
                    console.log(s+"=>"+n.toString(base))
                    if (cmpl) {                          ///> in compile mode?
                        dict.tail().addcode(new Code("dolit",n))  ///>> compile the number
                    }
                    else push(n)                         ///>> or, push number onto stack top
                }
                catch (e) {                              /// * catch number errors
                    log(s + "? ")
                    cmpl=false                           ///> restore interpret mode
                }
            }
        }
        log(ss_ok())     /// dump stack and display ok prompt
    }
}
