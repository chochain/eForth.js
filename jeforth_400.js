'use strict';
(function() {
    function ForthVM(output=console.log) {    /// ForthVM object template
	    let fence = 0
        class Prim {                          /// primitive word class
            constructor(name, xt) {
                this.name=name; this.xt=xt; this.token=fence++; this.immd=false
            }
		    exec() { this.xt(this) }
            to_s() { return this.name+" "+this.token+(this.immd ? "~" : "") }
        }
        class Immd extends Prim {
            constructor(name, xt) { super(name, xt); this.immd=true; }
        }
        class Code {                          /// colon word class
            constructor(name, n=false) {
                this.name=name; this.immd=0; this.stage=0; this.pf=[]
                if (name!="temp") this.xt = find(name).xt
			    if (typeof(n)=="boolean" && n) this.token=fence++
			    else if (typeof(n)=="string")  this.literal=n
			    else if (typeof(n)=="number")  this.qf = { n }
                this.pf.tail = function(i=1) { return this[this.length-i] }
            }
            exec() {                          /// run colon word
			    this.pf.forEach(w=>{
				    try   { w.exec() }        /// inner interpreter
                    catch (e) {}
			    })
		    }
            to_s() { return this.name+" "+this.token+(this.immd ? "~" : "") }
            addcode(w) { this.pf.push(w); return this }
        }
		let ss=[], rs=[]                      /// stacks
        let tib="", ntib=0, base=10           /// internal variables
        let cmpl=false
        
        /// IO functions
        const log    = (s)=>output(s)
        const NA     = (s)=>s+" not found"
        const ntok   = (d=' ')=>{
            let i = tib.indexOf(d, ntib)
            if (i<0) { ntib=0; return null }
            let s = tib.substring(ntib, i); ntib=i+1; return s
        }            
        
        /// stack functions
        const top    = (n=1)=>ss[ss.length-n]
        const push   = v=>ss.push(v)
        const pop    = ()=>ss.pop()
        const remove = n=>{ let v=top(n); ss.splice(length-n,1); return v }
        const topR   = (n=1)=>rs[ss.length-n]
        const pushR  = v=>rs.push(v)
        const popR   = ()=>rs.pop()
        
        /// utilities functions
        const nword  = ()=>{
            dict.push(new Code(ntok(), true))
            return dict.tail()
        }
        const sleep  = (ms)=>{
            return new Promise(rst=>setTimeout(rst,ms))
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
        const see    = (c, dp)=>{                       /// debug (JSON possible)
            const tab = (i)=>{ log("\n"); while(i--) log("  ") }
            const qf  = (v)=>{ log("=");  v.forEach(i=>log(i+" ")) }
            tab(dp); log("[ "); log(c.to_s())
            c.pf.forEach(w=>see(w, dp+1))
            if (c.pf.length>0) {
                tab(dp); log("---")
                c.pf1.forEach(w=>see(w, dp+1))
            }
            if (c.qf.length>0) qf(c.qf)
            log("]")
        }

        /// primitive words
        let dict = [
            new Prim("hi",    c=>log("---->hi there\n")),
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
            // math
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
            // logic
            new Prim("0=",    c=>push((pop()==0)?-1:0)),
            new Prim("0<",    c=>push((pop() <0)?-1:0)),
            new Prim("0>",    c=>push((pop() >0)?-1:0)),
            new Prim("=",     c=>{ let n=pop(); push((pop()==n)?-1:0) }),
            new Prim(">",     c=>{ let n=pop(); push((pop()>n )?-1:0) }),
            new Prim("<",     c=>{ let n=pop(); push((pop()<n )?-1:0) }),
            new Prim("<>",    c=>{ let n=pop(); push((pop()!=n)?-1:0) }),
            new Prim(">=",    c=>{ let n=pop(); push((pop()>=n)?-1:0) }),
            new Prim("<=",    c=>{ let n=pop(); push((pop()<=n)?-1:0) }),
            // output
            new Prim("base@", c=>push(base)),
            new Prim("base!", c=>base=pop()),
            new Prim("hex",   c=>base=16 ),
            new Prim("decimal",c=>base=10 ),
            new Prim("cr",    c=>log("\n")),
            new Prim(".",     c=>log(pop().toString(base)+", ")),
            new Prim(".r",    c=>{
                let n=pop(), s=pop().toString(base);
                for(let i=0; i+s.length<n; i++) log(" ");
                log(s+" "); }),
            new Prim("u.r", c=>{
                let n=pop(), s=(pop()&0x7fffffff).toString(base);
                for(let i=0; i+s.length<n; i++) log(" ");
                log(s+" "); }),
            new Prim("key", c=>push(ntok()[0])),
            new Prim("emit", c=>log(String.fromCharCode(pop()))),
            new Prim("space", c=>log(" ")),
            new Prim("spaces", c=>{ for (let i=0, n=pop(); i<n; i++) log(" ")}),
            // literals
            new Prim("[", c=>cmpl=false ),
            new Prim("]", c=>cmpl=true ),
            new Prim("'", c=>{ let w=tok2w(); push(w.token) }),
            new Prim("dolit", c=>push(c.qf[0])),                // integer literal
            new Prim("dostr", c=>push(c.token)),                // string literal
            new Immd("$\"", c=>{                                // -- w a
                let s=ntok('"'), last=dict.tail()
                last.addcode(new Code("dostr", s))
                push(last.token)
                push(dict.pf.tail()) }),
            new Prim("dotstr",c=>log(c.literal)),
            new Immd(".\"", c=>{
                let s=ntok('"'), x=ntok()
                dict.tail().addcode(new Code("dotstr", s))}),
            new Prim("(",  c=>{ let s=ntok(')'), x=ntok()}, true),
            new Immd(".(", c=>{ let s=ntok(')'), x=ntok(); log(s) }),
            new Immd("\\", c=>{ let x=ntok('\n') }),
            // branching: if else then
            new Prim("bran",c=>(pop()==0 ? c.pf1 : c.pf).forEach(w=>w.exec())),
            new Immd("if", c=>{
                dict.tail().addcode(new Code("bran"))
                dict.push(new Code("temp")) }),
            new Immd("else", c=>{
                let last=dict.lastpf(), temp=dict.tail()
                last.pf.push(...temp.pf)
                temp.pf = []
                last.stage=1 }),
            new Immd("then", c=>{
                let last=dict.lastpf(), temp=dict.tail()
                if (last.stage==0) {
                    last.pf.push(...temp.pf)
                    dict.pop()                           // drop temp
                } else {
                    if (last.pf1==null) last.pf1=[]
                    last.pf1.push(...temp.pf)
                    if (last.stage==1) dict.pop()
                    else temp.pf=[]
                } }),
            // loop
            new Prim("loop", c=>{
                if (c.stage==1) {                        // again
                    while (true) { c.pf.forEach(w=>w.exec()) }
                }
                else if (c.stage==2) {                   // while repeat
                    while (true) {
                        c.pf.forEach(w=>w.exec())
                        if (pop()==0) break;
                        c.pf1.forEach(w=>w.exec())
                    }
                }
                else {
                    while (true) {                       // until
                        c.pf.forEach(w=>w.exec())
                        if(pop()!=0) break;
                    }
                } }),
            new Immd("begin", c=>{
                dict.tail().addcode(new Code("loop"))
                dict.push(new Code("temp")) }),
            new Immd("while", c=>{
                let last=dict.lastpf(), temp=dict.tail()
                last.pf.push(...temp.pf)
                temp.pf = []
                last.stage=2 }),
            new Immd("repeat", c=>{
                let last=dict.lastpf(), temp=dict.tail()
                last.pf1.push(...temp.pf)
                dict.pop() }),
            new Immd("again", c=>{
                let last=dict.lastpf(), temp=dict.tail()
                last.pf.push(...temp.pf)
                last.stage=1
                dict.pop() }),
            new Immd("until", c=>{
                let last=dict.lastpf(), temp=dict.tail()
                last.pf.push(...temp.pf)
                dict.pop() }),
            // for next
            new Prim("cycle", c=>{
                let i=0;
                if (c.stage==0) {
                    while (true) {
                        c.pf.forEach(w=>w.exec())
                        i = popR()-1;
                        if (i<0) break;
                        pushR(i);
                    }
                } else {
                    if (c.stage>0) {
                        c.pf.forEach(w=>w.exec())
                        while (true) {
                            c.pf2.forEach(w=>w.exec())
                            i=popR()-1;
                            if (i<0) break;
                            pushR(i);
                            c.pf1.forEach(w=>w.exec())
                        }
                    }
                } }),
            new Immd("for", c=>{
                dict[-1]
					.addcode(new Code(">r"))
                    .addcode(new Code("cycles"))
                dict.add(new Code("temp")) }),
            new Immd("aft", c=>{
                let last=dict.lastpf(), temp=dict.tail()
                last.pf.push(...temp.pf)
                temp.pf=[]
                last.stage=3 }),
            new Immd("next", c=>{
                let last=dict.lastpf(), temp=dict.tail()
                if (last.stage==0) last.pf.push(...temp.pf)
                else {
                    if (last.pf2==null) last.pf2=[]
                    last.pf2.push(...temp.pf)
                }
                dict.pop() }),
            // defining words
            new Prim("exec", c=>dict[pop()].exec()),
            new Prim(":", c=>{ nword(); cmpl=true }),           // new colon word
            new Immd(";", c=>cmpl=false),                        // semicolon
            new Prim("docon", c=>push(c.qf[0])),                 // integer literal
            new Prim("dovar", c=>push(c.token)),                 // string literal
            new Prim("create", c=>{
                let last=nword().addcode(new Code("dovar",0))
                last.pf[0].token=last.token
                last.pf[0].qf.shift() }),
            new Immd("variable", c=>{ 
                let last=nword().addcode(new Code("dovar",0))
                last.pf[0].token=last.token }),
            new Immd("constant", c=>{
                let last=nword().addcode(new Code("docon",pop()))
                last.pf[0].token=last.token }),
            // memory access functions
            new Prim("@", c=>{ let last=dict[pop()]; push(last.pf[0].qf[0]) }),
            new Prim("!", c=>{ let last=dict[pop()]; last.pf[0].qf[0]=pop() }),
            new Prim("+!",c=>{ let last=dict[pop()]; last.pf[0].qf[0]+=pop() }),
            new Prim("?", c=>{ let last=dict[pop()], n=last.pf[0].qf[0]; log(n.toString(base)) }),
            new Prim("array@", c=>{ let a=pop(), last=dict[pop()];  push(last.pf[0].qf[a]) }),
            new Prim("array!", c=>{ let a=pop(), last=dict[pop()];  last.pf[0].qf[a]=pop() }),
            new Prim(",", c=>{ let last=dict[-1]; last.pf[0].qf.push(pop()) }),
            new Prim("allot", c=>{  // n --
                let n=pop(), last=dict[-1]
                for (let i=0; i<n; i++) last.pf[0].qf[0] }),
            new Prim("does", c=>{ // n --
                let last=dict[-1], src=dict[wp]
                last.pf.push(...src.pf.subList(ip+2,src.pf.length)) }),
            new Prim("to", c=>{                                               // n -- , compile only 
                let last=dict[wp]
                ip++;                                                         // current colon word
                last.pf[ip++].pf[0].qf[0]=pop() }),                           // next constant
            new Prim("is", c=>{                                               // w -- , execute only
                let src=dict[pop()], w=tok2w()                                // source word
                dict[w.token].pf = src.pf }),
            // system functions
            new Prim("exit", c=>{ throw "close app" }),          // exit interpreter
            new Prim("time", c=>log(Date.now.toString())),
            new Prim("ms",   c=>sleep(pop()).then(()=>{})),
            // debug functions
            new Prim("here", c=>push(dict.tail().token)),
            new Prim("forget", c=>dict.splice(tok2w().token)),
            new Prim("words", c=>{
                dict.forEach((w,i)=>log(((i%5)==0 ? "\n" : " ")+w.to_s()))
                }),
            new Prim(".s",   c=>console.log(ss)),
            new Prim("see",  c=>{ let w=tok2w(); console.log(w) }),
            new Prim("boot", c=>dict.splice(find("boot").token+1))
        ]
        //
        // add dictionary access methods
        //
        dict.tail   = function(i=1) { return this[this.length-i] }
        dict.lastpf = function()    { return this[this.length-2].pf.tail() }
        //
        // main interface
        //
        this.init = ()=>{
			log("jeforth 4.0\n")
        }
		this.outer = (cmd)=>{                               // outer interpreter
            tib = cmd
            for (let s=ntok(); s!=null; s=ntok()) {
				let w = find(s)                             // search dictionary
				if (w!=null) {                              // word found
					if((!cmpl) || w.immd) {
						try       { w.exec() }              // execute
						catch (e) { log(e) }
					}
					else dict.tail().addcode(w)              // or compile
				}
				else {
					try {
						let n=parseInt(s, base)             // not word, try number
						if (cmpl) {                         // compile integer literal
							dict.tail().addcode(new Code("dolit",n))
						}                
						else push(n)
					}                                       // or push number on stack
					catch (e) {                             // catch number errors
						log(s + "? ")
						cmpl=false
					}
				}
			}
			log(ss.join('_')+"_ok ")
		}
    }
    window.ForthVM = ForthVM
})();
