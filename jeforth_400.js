'use strict';
(function() {
	let fence = 0
    let Prim  = class {
        constructor(name, xt, im=false) {
            this.name=name; this.xt=xt; this.immd=im; this.token=fence++
        }
		exec() { this.xt() }
    }
    let Code  = class {
        constructor(name, n=false) {
            this.name=name; this.immd=0; this.stage=0
            this.pf=[]; this.pf1=[]; this.pf2=[]; this.qf=[]
			if (typeof(n)=="boolean" && n) this.token=fence++
			else if (typeof(n)=="string")  this.literal=n
			else if (typeof(n)=="number")  this.qf.push(n)
        }
        exec() {
            pushR(wp); pushR(ip)                                // run colon word
            wp=token; ip=0                                      // point to current object
			this.pf.forEach(w=>{
				try   { w.exec(); ip++; }                       // inner interpreter
                catch (e) {}
			})
			ip=popR(); wp=popR()
		}
        addcode(w) { this.pf.push(w); return this }
    }
    function ForthVM(output=console.log) {    /// ForthVM object template
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
        
        /// utilities
        const find   = (s)=>{
            for (let i=dict.length-1; i>=0; --i) {       // search reversely
                if (s==dict[i].name) return dict[i]
            }
            return null
        }
        const tok2w  = ()=>{
            let s=ntok(), w=find(s)
            if (w==null) throw NA(s);
            return w
        }
        const see    = (c, dp)=>{
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

        /// primitives
        const dict   = [
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
            new Prim("spaces", c=>{
                for (let i=0, n=pop(); i<n; i++) log(" ") }),
            // literals
            new Prim("[", c=>cmpl=false ),
            new Prim("]", c=>cmpl=true ),
            new Prim("'", c=>{ let w=tok2w(); push(w.token) }),
            new Prim("dolit", c=>push(c.qf[0])),                // integer literal
            new Prim("dostr", c=>push(c.token)),                // string literal
            new Prim("$\"", c=>{                                // -- w a
                let d=this.in.delimiter(); this.in.useDelimiter("\"")
                let s=ntok()
                dict[-1].pf.push(new Code("dostr", s))
                this.in.useDelimiter(d); ntok()
                push(last.token)
                push(last.pf[-1]) }, true),
            new Prim("dotstr",c=>log(c.literal)),
            new Prim(".\"", c=>{
                let d=this.in.delimiter(); this.in.useDelimiter("\"")
                let s=nxtok()
                dict[-1].addcode(new Code("dotstr", s))
                this.in.useDelimiter(d); ntok() }, true),
            new Prim("(", c=>{
                let d=this.in.delimiter(); this.in.useDelimiter("\\)")
                let s=ntok(); this.in.useDelimiter(d); ntok() }, true),
            new Prim(".(", c=>{
                let d=this.in.delimiter(); this.in.useDelimiter("\\)")
                log(ntok())
                this.in.useDelimiter(d); ntok() }, true),
            new Prim("\\", c=>{
                let d=this.in.delimiter(); this.in.useDelimiter("\n");
                ntok(); this.in.useDelimiter(d); ntok() }, true),
            // structure: if else then
            new Prim("bran",c=>(pop()==0 ? c.pf1 : c.pf).forEach(w=>w.exec(this))),
            new Prim("if", c=>{
                dict[-1].addcode(new Code("bran"))
                dict.push(new Code("temp")) }, true),
            new Prim("else", c=>{
                let temp=dict[-1]
                let last=dict[-2].pf[-1]
                last.pf.push(...temp.pf)
                temp.pf=[]
                last.stage=1 }, true),
            new Prim("then", c=>{
                let temp=dict[-1]
                let last=dict[-2].pf[-1]
                if (last.stage==0) {
                    last.pf.push(...temp.pf)
                    dict.pop()
                } else {
                    last.pf1.push(...temp.pf)
                    if (last.stage==1) dict.pop()
                    else temp.pf=[]
                } }, true),
            // loops
            new Prim("loops", c=>{
                if (c.stage==1) {                          // again
                    while (true) { c.pf.forEach(w=>w.exec(this)) }
                } else if (c.stage==2) {                   // while repeat
                    while (true) {
                        c.pf.forEach(w=>w.exec(this))
                        if (pop()==0) break;
                        c.pf1.forEach(w=>w.exec(this))
                    }
                } else {
                    while (true) {                          // until
                        c.pf.forEach(w=>w.exec(this))
                        if(pop()!=0) break;
                    }
                } }),
            new Prim("begin", c=>{
                dict[-1].addcode(new Code("loops"))
                dict.push(new Code("temp")) }, true),
            new Prim("while", c=>{
                let temp=dict[-1]
                let last=dict[-2].pf[-1]
                last.pf.push(...temp.pf)
                temp.pf = []
                last.stage=2 }, true),
            new Prim("repeat", c=>{
                let temp=dict[-1]
                let last=dict[-2].pf[-1]
                last.pf1.push(...temp.pf)
                dict.pop() }, true),
            new Prim("again", c=>{
                let temp=dict[-1]
                let last=dict[-2].pf[-1]
                last.pf.push(...temp.pf)
                last.stage=1
                dict.pop() }, true),
            new Prim("until", c=>{
                let temp=dict[-1]
                let last=dict[-2].pf[-1]
                last.pf.push(...temp.pf)
                dict.pop() }, true),
            // for next
            new Prim("cycles", c=>{
                let i=0;
                if (c.stage==0) {
                    while(true){
                        c.pf.forEach(w=>w.exec(this))
                        i = popR()-1;
                        if (i<0) break;
                        pushR(i);
                    }
                } else {
                    if (c.stage>0) {
                        c.pf.forEach(w=>w.exec(this))
                        while(true){
                            c.pf2.forEach(w=>w.exec(this))
                            i=popR()-1;
                            if (i<0) break;
                            pushR(i);
                            c.pf1.forEach(w=>w.exec(this))
                        }
                    }
                } }),
            new Prim("for", c=>{
                dict[-1]
					.addcode(new Code(">r"))
                    .addcode(new Code("cycles"))
                dict.add(new Code("temp")) }, true),
            new Prim("aft", c=>{
                let last=dict[-2].pf[-1]
                let temp=dict[-1]
                last.pf.push(...temp.pf)
                temp.pf=[]
                last.stage=3 }, true),
            new Prim("next", c=>{
                let last=dict[-2].pf[-1]
                let temp=dict[-1]
                if (last.stage==0) last.pf.push(...temp.pf)
                else last.pf2.push(...temp.pf)
                dict.pop() }, true),
            // defining words
            new Prim("exit", c=>{ throw "close the app" }),      // exit interpreter
            new Prim("exec", c=>dict[pop()].exec(this)),
            new Prim(":", c=>{                                   // colon
                let s=ntok()
                dict.push(new Code(s,true))
                cmpl=true }),
            new Prim(";", c=>cmpl=false, true),                        // semicolon
            new Prim("docon", c=>push(c.qf[0])),                 // integer literal
            new Prim("dovar", c=>push(c.token)),                 // string literal
            new Prim("create", c=>{
                let s=ntok(); dict.push(new Code(s),true)
                let last=dict[-1].addcode(new Code("dovar",0))
                last.pf[0].token=last.token
                last.pf[0].qf.shift() }),
            new Prim("variable", c=>{ 
                let s=ntok(); dict.push(new Code(s),true)
                let last=dict[-1].addcode(new Code("dovar",0));
                last.pf[0].token=last.token }),
            new Prim("constant", c=>{  // n --
                let s=ntok(); dict.push(new Code(s,true))
                let last=dict[-1].addcode(new Code("docon",pop()));
                last.pf[0].token=last.token; }),
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
            // tools
            new Prim("here", c=>push(dict[-1].token)),
            new Prim("boot", c=>dict.splice(104, dict.length)),
            new Prim("forget", c=>{
                let w=tok2w()
                for (let i=dict[-1].token; i>=Math.max(w.token,104); i--) dict.pop() }),
            new Prim("words", c=>{
                dict.forEach((w,i)=>log(((i%5)==0 ? "\n" : " ")+w.name+" "+w.token))
                }),
            new Prim(".s",   c=>log(ss.join(" "))),
            new Prim("see",  c=>{ let w=tok2w(); see(w,0); log("\n")}),
            new Prim("time", c=>{
                let now=LocalTime.now()
                log(now.toString()) }),
            new Prim("ms", c=>{ // n --
                try   { Thread.sleep(pop()) }
                catch (e) { log(e.toString()) }})
        ]
        this.ok = ()=>log(ss.join('_')+"_ok ")
        this.init = ()=>{
			log("jeforth 4.0\n")
        }
		this.exec = (cmd)=>{                                // outer interpreter
            tib = cmd
            for (let s=ntok(); s!=null; s=ntok()) {
				let w = find(s)                             // search dictionary
				if (w!=null) {                              // word found
                    console.log(s+"=>"+w.token)
					if((!cmpl) || w.immd) {
						try       { w.exec() }              // execute
						catch (e) { log(e) }
					}
					else dict[-1].addcode(w)                // or compile
				}
				else {
					try {
						let n=parseInt(s, base)             // not word, try number
                        console.log(s+"=>"+n.toString())
						if (cmpl) {                         // compile integer literal
							dict[-1].addcode(new Code("dolit",n))
						}                
						else push(n)
					}                                       // or push number on stack
					catch (e) {                             // catch number errors
						log(s + "? ")
						cmpl=false
					}
				}
			}
			this.ok()
		}
    }
    window.ForthVM = ForthVM
})();
