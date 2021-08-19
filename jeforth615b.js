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
    let compile=false
    let ss=[],rs=[]              // array allows push and pop
    let tib="",ntib=0,base=10
    let ip=0,wp=0,wx=0           // instruction and word pointers
    let SPC="&nbsp;"
    // 
    class Code {
        constructor(name, xt) {
            this.name=name; this.xt=xt; this.immd=false; this.pf=[]
        }
    }
    class Immd extends Code {
        constructor(name, xt) { super(name, xt); this.immd=true; }
    }
    // ** ES6 encourages block-scoped immutable function definition
    // parser and search functions
    const parse = function(delim=" ") {
        idiom=""
        while (tib[ntib]<=32) ntib++
        while(ntib<tib.length &&
			  tib.substr(ntib,1)!=delim &&
              tib.substr(ntib,1)!="\n") idiom+=tib.substr(ntib++,1)
        if (delim!=" ") ntib++
        if (idiom==="") throw(" < "+ss.join(" ")+" >ok")
        return idiom
	}
    const find = function(name) {
        for (let i=dict.length-1; i>=0; i--) {
            if (dict[i].name===name) return i }
        return -1
    }
    // compiler functions
    const tmp = ()->dict[dict.length-1].pf
    const dictcompile = n=>tmp().push(n)
    const compilecode = function(nword) {
		let n=(typeof(nword)==="string") ? find(nword) : nword
        if (n>-1) dictcompile(n);
        else {ss=[]; throw(SPC+nword+" ? ");}}
    // interpreter functions
    const exec = n=>{ wx=n; dict[n].xt() }
    const exit = ()=>ip=-1
    const nest = function(){          // inner interpreter
        rs.push(wp); rs.push(ip); wp=wx; ip=0;
        while (ip>=0) { wx=dict[wp].pf[ip++]; dict[wx].xt() }
        ip=rs.pop(); wp=rs.pop()
	}
    const eval = function(idiom) {     // interpreter/compiler
        let nword=find(idiom)
        let n=(base==10) ? parseFloat(idiom) : parseInt(idiom, base)
        if (nword>-1) { 
            if (compile && !dict[nword].immd) dictcompile(nword)
            else exec(nword)
		}                              // nest, docon, dovar need pf
        else if (n || idiom==0) {      // if the idiom is a number
            if (compile) {    
                compilecode("dolit")   // compile an literal
                dictcompile(n)
			}
            else ss.push(n)
		}
        else {
            if (compile) dict.pop()    // error, delete defective word
            ss=[]; throw(SPC+idiom+" ? ")
		}
	} 
    const tick = function() {
        let i=find(wx=parse())
        if (i>=0) ss.push(i)
        else throw(SPC+w+" ? ")
		return i
	}
    // functions serve as macro to reduce verbosity
	const PUSH = v=>ss.push(v)
	const POP  = ()=>ss.pop()
    const TOS  = (n=1)=>ss[ss.length-n]
    const log  = s=>output.log(s)

// dictionary
    var dict = [
        new Code("quit"  ,c=>{
			nest(); eval(parse()); ip=dict[wp].pf[ip]}),
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
        new Code("nip"   ,c=>ss.[ss.length-2]=POP()),
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
        new Code(">"     ,c=>let b=POP();PUSH(POP()>b)),
        new Code("<"     ,c=>let b=POP();PUSH(POP()<b)),
        new Code("<>"    ,c=>PUSH(POP()!==POP())),
// output
        new Code("base@" ,c=>PUSH(base)),
        new Code("base!" ,c=>base=POP()),
        new Code("hex"   ,c=>base=16),
        new Code("decimal",c=>base=10),
        new Code("cr"    ,c=>log("<br/>\n")),
        new Code("."     ,c=>log(POP().toString(base)+" ")),
        new Code("emit"  ,c=>log(String.fromCharCode(POP()))),
        new Code("space" ,c=>log(SPC)),
        new Code("spaces",c=>for (let i=0,n=POP();i<n;i++) log(SPC)),
        new Code(".r"    ,c=>{
            let n=POP(), s=POP().toString(base)
            for(let i=0; i+s.length<n; i++) log(SPC)
            log(s+SPC) }),
// strings
        new Immd("["     ,c=>compile=false),
        new Code("]"     ,c=>compile=true),
        new Code("find"  ,c=>PUSH(find(parse()))),
        new Code("'"     ,c=>tick()),
        new Code("(')"   ,c=>PUSH(dict[w].pf[ip++])),
        new Immd("[']"   ,c=>{ compilecode("(')"); tick(); compilecode(POP())}),
        new Code("dolit" ,c=>PUSH(dict[wp].pf[ip++])),
        new Code("dostr" ,c=>PUSH(dict[w].pf[ip++])),
        new Immd('s"'    ,c=>{
             let s=parse('"');
             if (compile) {compilecode("dostr"); dictcompile(s)}
             else PUSH(s) }),
        new Code("dotstr",c=>{n=dict[wp].pf[ip++]; log(n)}),
        new Immd('."'    ,c=>{
             let s=parse('"');
             if (compile) {compilecode("dotstr"); dictcompile(s)}
             else {log(s)}}),
        new Immd('('     ,c=>s=parse(')')),
        new Immd('.('    ,c=>log(parse(')'))),
        new Immd('\\'    ,c=>log(parse('\n'))),

// structures
        new Code("exit"   ,c=>exit()),
        new Code("0branch",c=>{
            if (POP()) ip++;
            else ip=dict[wp].pf[ip]}),
        new Code("donext" ,c=>{
            let i=rs.pop()-1
            if (i>=0) { ip=dict[wp].pf[ip]; rs.push(i)} else { ip++ }}),
        new Immd("if"  ,c=>{    // if    ( -- here ) 
            compilecode("0branch");
            PUSH(tmp().length); dictcompile(0)}),
        new Immd("else",c=>{    // else ( here -- there )
            compilecode("branch");
            let h=tmp().length
            dictcompile(0)
            dict.tmp(POP()) = tmp().length; PUSH(h)}),
        new Immd("then",c=>{    // then    ( there -- ) 
            dict.tmp(POP()) = tmp().length}),
        new Immd("begin",c=>PUSH(tmp().length)),
        new Immd("again",c=>{   // again    ( there -- ) 
            compilecode("branch"); compilecode(POP())}),
        new Immd("until",c=>{   // until    ( there -- ) 
            compilecode("0branch"); compilecode(POP())}),
        new Immd("while",c=>{   // while    ( there -- there here ) 
            compilecode("0branch");
            PUSH(tmp().length); dictcompile(0)}),
        new Immd("repeat",c=>{  // repeat    ( there1 there2 -- ) 
            compilecode("branch");
            let t=POP(); compilecode(POP());
            dict.tmp(t)=tmp().length}),
        new Immd("for" ,c=>{    // for ( -- here )
            compilecode(">r"); PUSH(tmp().length)}),
        new Immd("next",c=>{    // next ( here -- )
            compilecode("donext"); compilecode(POP())}),
        new Immd("aft" ,c=>{    // aft ( here -- here there )
            POP(); compilecode("branch");
            let h=tmp().length;
            dictcompile(0); PUSH(tmp().length);PUSH(h)}),
// defining dict
        new Code(":"     ,c=>{
            compile=true;
            dict.push(new Code(parse(), c=>nest()))}),
        new Immd(";"     ,c=>{ compile=false; compilecode("exit")}),
        new Code("create",  c=>dict.push(wx, c=>ss.push(wx)))),
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
        new Code("dict"  ,c=>{
            for(let i=dict.length-1;i>=0;i--) log(dict[i].name+" ")}),
        new Code("dump"  ,c=>{
            log('dict[<br/>')
            for(let i=0;i<dict.length;i++){
                log('{name:"'+dict[i].name+'", xt:'+dict[i].xt.toString(base));
                if (dict[i].pf)   log(', pf:['+dict[i].pf.toString(base)+']');
                if (dict[i].qf)   log(', qf:['+dict[i].qf.toString(base)+']');
                if (dict[i].immd) log(' ,immediate:'+dict[i].immd);
                log('}},<br/>')}
            log(']<br/>')}),
        new Code("forget",c=>{
            let i=tick(); let n=POP();
            if (n < fence) {ss=[]; throw(" "+dict[i].name+" below fence" )}
            for(let i=dict.length-1;i>=n;i--) dict.pop()}),
        new Code("boot"  ,c=>for(let i=dict.length-1;i>=fence;i--)dict.pop()),
        new Code("see"   ,c=>{
            tick();n=POP();p=dict[n].pf;s="";
            for(let i=0;i<p.length;i++){
                if (s=="dolit"||s=="branch"||s=="0branch"
                    ||s=="donext"||s=="dostr"||s=="dotstr") {
                    s=" ";log(p[i].toString(base)+" ")}
                else {s=dict[p[i]].name;log(s+" ")}}}),
        new Code("date"  ,c=>{log(new Date()); log("<br/>")}),
        new Code("@"     ,c=>{let a=POP(); PUSH(dict[a].qf[0])}),
        new Code("!"     ,c=>{let a=POP(); dict[a].qf[0]=POP()}),
        new Code("+!"    ,c=>{let a=POP(); dict[a].qf[0]+=POP()}),
        new Code("?"     ,c=>log(dict[POP()].pf[0].toString(base)+" ")),
        new Code("array@",c=>{ // array@ ( w i -- n ) 
            let i=POP(), a=POP(); PUSH(dict[a].qf[i])}),
        new Code("array!",c=>{ // array! ( n w i -- ) 
            let i=POP(), a=POP(); dict[a].qf[i]=POP()}),
        new Code("is"    ,c=>{ // ( a -- ) vector a to next word 
            tick(); let b=POP(), a=POP();dict[b].pf=dict[a].pf}),
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
        new Code("pow"   ,c=>{let b=POP();PUSH(Math.pow(POP(),b))})
    ]
    // add access functions to dictionary object
	dict.tail = function(i=1) { return this[this.length-i] }
	dict.tmp  = function()    { this.tail(1).pf }
	
    fence=dict.length
	
    this.outer = function(cmd) {
		tib=cmd; ntib=0
        rs=[]; wp=0; ip=0; wx=0; compile=false
		exec(0)
	}
}
