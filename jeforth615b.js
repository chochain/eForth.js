/* jeforth 6.14
07may21cht 6.14 minimized
19feb21cht 6.13 see, dump, to, is, evaluate
11feb21cht 6.03 jsBach, qf, q@, does
25jan21cht 5.03 one AudioContext, 6 voices polypohny
18jan21cht 4.01-4.03 haiku eforth 
08jan21cht 3.01-3.02 colon words have token lists in pf. 
07jan21cht 2.01-2.03 execute-nest-exit, quit loop 
2011/12/23 initial version by Cheahshen Yap and Sam Chen */
window.ForthVM = function(output=console.log) {
    let fence=0
    let compiling=false
    let ss=[],rs=[]              // array allows push and pop
    let tib="",ntib=0,base=10
    let ip=0,wp=0,wx=0           // instruction and word pointers
    let SPC="&nbsp;", CR="<br/>"
    // classes for Code and Immedate words
    class Code {
        constructor(name, xt) {
            this.name=name; this.xt=xt; this.immd=false; this.pf=[] }}
    class Immd extends Code {    // calls Code constructor and set immd flag
        constructor(name, xt) { super(name, xt); this.immd=true; }}
    //
    // ** ES6 encourages block-scoped immutable function definition
    // i.e. const fname = function(n) {...}  /* if 'this' is needed     */
    // or   const fname = (n)=>{...}         /* fat arrow style, if 'this' is not needed */
    // or   const fname = n=>...             /* for single statement    */
    //
    // parser functions
    // @return parsed token or "" (advance ntib index against tib string)
    const parse = function(delim=" ") {
        let tok=""
        while (tib.charCodeAt(ntib)<=32) ntib++
        while(ntib<tib.length &&
			  tib[ntib]!=delim &&
              tib[ntib]!='\n') tok+=tib[ntib++]
        if (delim!=" ") ntib++
        return tok
	}
    // dictionary scanner for word by given name
    const find = function(name) {
        for (let i=dict.length-1; i>=0; i--) {
            if (dict[i].name===name) return i
        }
        return -1
    }
    // compiler functions
    const comma   = function(n) { dict.tail().pf.push(n) }
    const compile = function(nword) {
		let n=(typeof(nword)==="string") ? find(nword) : nword
        if (n>-1) comma(n);
        else {ss=[]; throw(SPC+nword+" ? ");}}
    // interpreter functions
    const exit = ()=>ip=-1                    // exit nest() loop, fat arrow style
    const nest = function() {                 // inner interpreter
        rs.push(wp); rs.push(ip); wp=wx; ip=0;// setup call frame
        while (ip>=0) {
            wx=dict[wp].pf[ip++];
            console.log("\nwp="+wp.toString()+",ip="+ip.toString())
            console.log(dict[wx])
            dict[wx].xt()
        }
        ip=rs.pop(); wp=rs.pop()              // restore call frame
	}
    const eval = function(idiom) {     // interpreter/compiler
        let nword=find(idiom)
        if (nword>-1) {                // is an existing word
            if (compiling && !dict[nword].immd) comma(nword)
            else dict[wx=nword].xt()
            return
		}
        // try as a number
        let n=(base==10) ? parseFloat(idiom) : parseInt(idiom, base)
        if (isNaN(n)) {                 // not a number
            if (compiling) dict.pop()   // delete defective word
            compiling=false; ss=[]; ntib=tib.length
            log(SPC+idiom+" ? ")
            return
        }
        // is a number
        if (compiling) { compile("dolit"); comma(n) } // compile an literal
        else ss.push(n)
	} 
    const tick = function() {
        let i=find(wx=parse())
        if (i>=0) return i
        else throw(SPC+w+" ? ")
	}
    // functions serve as macro to reduce verbosity
    // using blocked-scoped immutable function definition (use fat arrow style)
	const PUSH = v=>ss.push(v)
	const POP  = ()=>ss.pop()
    const TOS  = (n=1)=>ss[ss.length-n]
    const log  = s=>output(s)
    const xip  = ()=>dict.tail().pf.length

// dictionary
    var dict = [
// sss
        new Code("dup"   ,c=>PUSH(TOS())),
        new Code("over"  ,c=>PUSH(TOS(2))),
        new Code("2dup"  ,c=>{PUSH(TOS(2));PUSH(TOS(2))}),
        new Code("2over" ,c=>{PUSH(TOS(4));PUSH(TOS(4))}),
		
        new Code("4dup"  ,c=>PUSH(ss.slice(-4))),
		new Code("swap"  ,c=>PUSH(ss.splice(-2,1))),
		new Code("rot"   ,c=>PUSH(ss.splice(-3,1))),
		new Code("-rot"  ,c=>ss.splice(-2,0,POP())),
		new Code("2swap" ,c=>PUSH(ss.splice(-4,2))),
		new Code("pick"  ,c=>{let j=POP()+1;PUSH(ss.slice(-j,-j+1))}),
		new Code("roll"  ,c=>{let j=POP()+1;PUSH(ss.splice(-j,1))}),
// add here
        new Code("drop"  ,c=>POP()),
        new Code("nip"   ,c=>ss[ss.length-2]=POP()),
        new Code("2drop" ,c=>{POP();POP()}),
        new Code(">r"    ,c=>rs.push(POP())),
        new Code("r>"    ,c=>PUSH(rs.pop())),
        new Code("r@"    ,c=>PUSH(rs[rs.length-1])),
        new Code("push"  ,c=>rs.push(POP())),
        new Code("pop"   ,c=>PUSH(rs.pop())),
// math
        new Code("+"     ,c=>{let n=POP(); PUSH(POP()+n)}),
        new Code("-"     ,c=>{let n=POP(); PUSH(POP()-n)}),
        new Code("*"     ,c=>{let n=POP(); PUSH(POP()*n)}),
        new Code("/"     ,c=>{let n=POP(); PUSH(POP()/n)}),
        new Code("mod"   ,c=>{let n=POP(); PUSH(POP()%n)}),
        new Code("and"   ,c=>{PUSH(POP() & POP())}),
        new Code("or"    ,c=>{PUSH(POP() | POP())}),
        new Code("xor"   ,c=>{PUSH(POP() ^ POP())}),
        new Code("negate",c=>PUSH(-POP())),
// compare
        new Code("0="    ,c=>PUSH(POP()===0)),
        new Code("0<"    ,c=>PUSH(POP()<0)),
        new Code("0>"    ,c=>PUSH(POP()>0)),
        new Code("="     ,c=>PUSH(POP()===POP())),
        new Code(">"     ,c=>{let b=POP();PUSH(POP()>b)}),
        new Code("<"     ,c=>{let b=POP();PUSH(POP()<b)}),
        new Code("<>"    ,c=>PUSH(POP()!==POP())),
// output
        new Code("base@" ,c=>PUSH(base)),
        new Code("base!" ,c=>base=POP()),
        new Code("hex"   ,c=>base=16),
        new Code("decimal",c=>base=10),
        new Code("cr"    ,c=>log(CR)),
        new Code("."     ,c=>log(POP().toString(base)+" ")),
        new Code("emit"  ,c=>log(String.fromCharCode(POP()))),
        new Code("space" ,c=>log(SPC)),
        new Code("spaces",c=>{for (let i=0,n=POP();i<n;i++) log(SPC)}),
        new Code(".r"    ,c=>{
            let n=POP(), s=POP().toString(base)
            for(let i=0; i+s.length<n; i++) log(SPC)
            log(s+SPC) }),
// strings
        new Immd("["     ,c=>compiling=false),
        new Code("]"     ,c=>compiling=true),
        new Code("find"  ,c=>PUSH(find(parse()))),
        new Code("'"     ,c=>PUSH(tick())),
        new Code("(')"   ,c=>PUSH(dict[wx].pf[ip++])),
        new Immd("[']"   ,c=>{ compile("(')"); compile(tick())}),
        new Code("dolit" ,c=>PUSH(dict[wp].pf[ip++])),
        new Code("dostr" ,c=>PUSH(dict[wx].pf[ip++])),
        new Immd('s"'    ,c=>{
            let s=parse('"');
            if (compiling) { compile("dostr"); comma(s) }
            else PUSH(s) }),
        new Code("dotstr",c=>log(dict[wp].pf[ip++])),
        new Immd('."'    ,c=>{
            let s=parse('"');
            console.log(s)
            if (compiling) { compile("dotstr"); comma(s) }
            else log(s)}),
        new Immd('('     ,c=>s=parse(')')),
        new Immd('.('    ,c=>log(parse(')'))),
        new Immd('\\'    ,c=>log(parse('\n'))),
// structures
        new Code("exit"   ,c=>exit()),
        new Code("branch" ,c=>ip=dict[wp].pf[ip]),
        new Code("0branch",c=>ip=POP() ? ip+1 : dict[wp].pf[ip]),
        new Code("donext" ,c=>{
            let i=rs.pop()-1
            if (i>=0) { ip=dict[wp].pf[ip]; rs.push(i)} else { ip++ }}),
        new Immd("if"  ,c=>{    // if    ( -- here ) 
            compile("0branch");
            PUSH(xip()); comma(0)}),
        new Immd("else",c=>{    // else ( here -- there )
            compile("branch");
            let h=xip()
            comma(0)
            dict.tail().pf[POP()]=xip(); PUSH(h)}),
        new Immd("then", c=>dict.tail().pf[POP()]=xip()),
        new Immd("begin",c=>PUSH(xip())),
        new Immd("again",c=>{   // again    ( there -- ) 
            compile("branch"); compile(POP())}),
        new Immd("until",c=>{   // until    ( there -- ) 
            compile("0branch"); compile(POP())}),
        new Immd("while",c=>{   // while    ( there -- there here ) 
            compile("0branch");
            PUSH(xip()); comma(0)}),
        new Immd("repeat",c=>{  // repeat    ( there1 there2 -- ) 
            compile("branch");
            let t=POP(); compile(POP());
            dict.tail().pf[t]=xip()}),
        new Immd("for" ,c=>{    // for ( -- here )
            compile(">r"); PUSH(xip())}),
        new Immd("next",c=>{    // next ( here -- )
            compile("donext"); compile(POP())}),
        new Immd("aft" ,c=>{    // aft ( here -- here there )
            POP(); compile("branch");
            let h=xip();
            comma(0); PUSH(xip()); PUSH(h)}),
// defining dict
        new Code(":", c=>{
            compiling=true
            dict.push(new Code(parse(), c=>nest()))}),
        new Immd(";", c=>{ compiling=false; compile("exit")}),
        new Code("create",  c=>dict.push(new Code(wx, c=>ss.push(wx)))),
        new Code("variable",c=>dict.push(new Code(parse(), c=>ss.push(wx)))),
        new Code("constant",c=>{
            dict.push(new Code(parse(), c=>ss.push(dict[wx].qf[0])))
            dict.tail().qf[0] = POP()}),
        new Code(","     ,c=>dict.tail().qf.push(POP())),
        new Code("allot" ,c=>{
            let n=POP()
            for(let i=0;i<n;i++) dict.tail().qf.push(0)}),
        new Code("does"  ,c=>{
            dict.tail().xt=()=>nest()
            dict[dict.length-1].pf = dict[wp].pf.slice(ip); ip=-1}),
        new Code("q@"    ,c=>PUSH(dict[wp].qf[POP()])),
// tools
        new Code("here"  ,c=>PUSH(dict.length)),
        new Code("words" ,c=>
             dict.forEach((w,i)=>log(w.name+((i%10)==9 ? CR : SPC)))),
        new Code("dump"  ,c=>{
            log("dict["+CR)
            for(let i=0;i<dict.length;i++){
                log('{name:"'+dict[i].name+'", xt:'+dict[i].xt.toString(base));
                if (dict[i].pf)   log(', pf:['+dict[i].pf.toString(base)+']');
                if (dict[i].qf)   log(', qf:['+dict[i].qf.toString(base)+']');
                if (dict[i].immd) log(' ,immd:'+dict[i].immd);
                log("}},"+CR)}
            log("]"+CR)}),
        new Code("forget",c=>dict.splice(fence=Math.max(fence, tick()))),
        new Code("see"   ,c=>{
            let n=tick(), p=dict[n].pf, s=""
            for(let i=0;i<p.length;i++){
                if (s=="dolit"||s=="branch"||s=="0branch"
                    ||s=="donext"||s=="dostr"||s=="dotstr") {
                    s=" ";log(p[i].toString(base)+" ")}
                else {s=dict[p[i]].name;log(s+" ")}}}),
        new Code("date"  ,c=>{log(new Date()); log(CR)}),
        new Code("@"     ,c=>{let a=POP(); PUSH(dict[a].qf[0])}),
        new Code("!"     ,c=>{let a=POP(); dict[a].qf[0]=POP()}),
        new Code("+!"    ,c=>{let a=POP(); dict[a].qf[0]+=POP()}),
        new Code("?"     ,c=>log(dict[POP()].pf[0].toString(base)+" ")),
        new Code("array@",c=>{ // array@ ( w i -- n ) 
            let i=POP(), a=POP(); PUSH(dict[a].qf[i])}),
        new Code("array!",c=>{ // array! ( n w i -- ) 
            let i=POP(), a=POP(); dict[a].qf[i]=POP()}),
        new Code("is"    ,c=>{ // ( a -- ) vector a to next word 
            let b=tick(), a=POP();dict[b].pf=dict[a].pf}),
        new Code("to"    ,c=>{ // ( a -- ) change value of next word
            let a=dict[wp].pf[ip++]; dict[a].qf[0]=POP()}),
        new Code("ms"    ,c=>{let t=Date.now()+POP(); while (Date.now()<t);}),
// transcendental
        new Code("pi"    ,c=>PUSH(Math.PI)),
        new Code("random",c=>PUSH(Math.random())),
        new Code("int"   ,c=>PUSH(Math.trunc(POP()))),
        new Code("ceil"  ,c=>PUSH(Math.ceil(POP()))),
        new Code("floor" ,c=>PUSH(Math.floor(POP()))),
        new Code("sin"   ,c=>PUSH(Math.sin(POP()))),
        new Code("cos"   ,c=>PUSH(Math.cos(POP()))),
        new Code("tan"   ,c=>PUSH(Math.tan(POP()))),
        new Code("asin"  ,c=>PUSH(Math.asin(POP()))),
        new Code("acos"  ,c=>PUSH(Math.acos(POP()))),
        new Code("exp"   ,c=>PUSH(Math.exp(POP()))),
        new Code("log"   ,c=>PUSH(Math.log(POP()))),
        new Code("sqrt"  ,c=>PUSH(Math.sqrt(POP()))),
        new Code("abs"   ,c=>PUSH(Math.abs(POP()))),
        new Code("max"   ,c=>{let b=POP();PUSH(Math.max(POP(),b))}),
        new Code("min"   ,c=>{let b=POP();PUSH(Math.min(POP(),b))}),
        new Code("atan2" ,c=>{let b=POP();PUSH(Math.atan2(POP(),b))}),
        new Code("pow"   ,c=>{let b=POP();PUSH(Math.pow(POP(),b))}),
        new Code("boot"  ,c=>dict.splice(fence=find("boot")+1))
    ]
    // add access functions to dictionary object
	dict.tail = function(i=1) { return this[this.length-i] }
	
    fence=dict.length
	
    this.outer = function(cmd) {
		tib=cmd; ntib=0
        for (let idiom=parse(); idiom!=""; idiom=parse()) {
            eval(idiom)
        }
        if (!compiling) log(" < "+ss.join(" ")+" >ok"+CR)
	}
}
