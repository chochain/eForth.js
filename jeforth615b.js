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
    let ss=[],rs=[]              // array allows push and pop
    let tib="",ntib=0,base=10
    let ip=0,wp=0,w=0            // instruction and word pointers
    let idiom="", newname=""
    let compile=false
    let SPC="&nbsp;"
    class Code {
        constructor(name, v=false) {
            this.name=name; this.xt=null; this.immd=false; this.pf=[]
            let w = find(name); if (w!=null) this.xt = w.xt
            if (typeof(v)=="function")    { this.xt=v; this.token=fence++ }
            else if (typeof(v)=="boolean" && v) this.token=fence++
            else if (typeof(v)=="string")  this.literal=v
            else if (typeof(v)=="number")  this.qf = [ v ]
            this.pf.tail = function(i=1) { return this[this.length-1]; }
        }
        exec() {                                          /// run colon word
            if (this.xt!=null) { this.xt(this); return }  /// dolit, dostr,...
            let tmp = wp
            wp = this.token
            this.pf.forEach(w=>w.exec())                  /// inner interpreter
            wp = tmp
        }
        addcode(w)  { this.pf.push(w);  return this }
    }
    class Immd extends Code {
        constructor(name, xt) { super(name, xt); this.immd=true; }
    }
    function parse(delim=" ") {
        tok=""; 
        while (tib[ntib]<=32) ntib++
        while(ntib<tib.length &&
              tib.substr(ntib,1)!=delim &&
              tib.substr(ntib,1)!="\n")
            tok+=tib.substr(ntib++,1)
        if (delim!=" ") ntib++;
        if (tok==="") throw(" < "+ss.join(" ")+" >ok");
        return tok; }
    function find(name) {
        for (i=words.length-1;i>=0;i--) {
            if (words[i].name===name) return i; }
        return -1; }
    function dictcompile(n) {words[words.length-1].pf.push(n);} 
    function compilecode(nword) { 
        if (typeof(nword)==="string"){var n=find(nword);}
        else n=nword;
        if (n>-1) dictcompile(n);
        else {ss=[]; throw(SPC+nword+" ? ");}}
    function exec(n){w=n;words[n].xt();}
    function exit(){ip=-1;}
    function nest(){               // inner interpreter
        rs.push(wp);rs.push(ip);wp=w;ip=0;
        while (ip>=0){w=words[wp].pf[ip++];words[w].xt();}
        ip=rs.pop();wp=rs.pop();}
    function evaluate(){         // interpreter/compiler
        var n=parseFloat(idiom);   // convert to number
        var nword=find(idiom);
        if (base!=10) {n=parseInt(idiom,base);}
        if (nword>-1) { 
            if (compiling && !words[nword].immediate)dictcompile(nword);
            else {exec(nword);}}       // nest, docon, dovar need pf
        else if (n || idiom==0) {  // if the idiom is a number
            if (compiling) {    
                compilecode("dolit");    // compile an literal
                dictcompile(n); }
            else {ss.push(n);}}
        else {
            if (compiling) words.pop();// error, delete defective word
            ss=[];throw(SPC+idiom+" ? ");}} 
    function dovar(){ss.push(w);}
    function docon(){ss.push(words[w].qf[0]);}
    function tick() {idiom=parse();var i=find(idiom);
                    if(i>=0)ss.push(i);
                    else throw(SPC+idiom+" ? ");}
    function main(cmd) {tib=cmd;ntib=0;
                        rs=[];wp=0;ip=0;w=0;compiling=false;exec(0);}
    function sleep(ms) { let t=Date.now()+ms; while (Date.now()<t); }
    function log(s)    { output.log(s) }
    function top(n=1)  { return ss[ss.length-n] }
// word objects
    var words = [
        new Code("quit"  ,c=>nest(), [1,2,3,0]),
        new Code("parse" ,c=>idiom=parse()),
        new Code("evaluate",c=>evaluate()),
        new Code("branch",c=>ip=words[wp].pf[ip]),
// sss
        new Code("dup"   ,c=>ss.push(top())),
        new Code("over"  ,c=>ss.push(top(2))),
        new Code("2dup"  ,c=>{push(top(2)); push(top(2))}),
        new Code("2over" ,c=>{ss.push(top(4));ss.push(top(4))}),
// add here
        new Code("drop"  ,c=>ss.pop()),
        new Code("nip"   ,c=>ss[ss.length-2]=ss.pop()),
        new Code("2drop" ,c=>{ss.pop();ss.pop()}),
        new Code(">r"    ,c=>rs.push(ss.pop())),
        new Code("r>"    ,c=>ss.push(rs.pop())),
        new Code("r@"    ,c=>ss.push(rs[rs.length-1])),
        new Code("push"  ,c=>rs.push(ss.pop())),
        new Code("pop"   ,c=>ss.push(rs.pop())),
// math
        new Code("+"     ,c=>{let n=ss.pop(); ss.push(ss.pop()+n)}),
        new Code("-"     ,c=>{let n=ss.pop(); ss.push(ss.pop()-n)}),
        new Code("*"     ,c=>{let n=ss.pop(); ss.push(ss.pop()*n)}),
        new Code("/"     ,c=>{let n=ss.pop(); ss.push(ss.pop()/n)}),
        new Code("mod"   ,c=>{let n=ss.pop(); ss.push(ss.pop()%n)}),
        new Code("and"   ,c=>{ss.push(ss.pop() & ss.pop())}),
        new Code("or"    ,c=>{ss.push(ss.pop() | ss.pop())}),
        new Code("xor"   ,c=>{ss.push(ss.pop() ^ ss.pop())}),
        new Code("negate",c=>ss.push(-ss.pop())),
// compare
        new Code("0="    ,c=>ss.push(ss.pop()===0)),
        new Code("0<"    ,c=>ss.push(ss.pop()<0)),
        new Code("0>"    ,c=>ss.push(ss.pop()>0)),
        new Code("="     ,c=>ss.push(ss.pop()===ss.pop())),
        new Code(">"     ,c=>let b=ss.pop();ss.push(ss.pop()>b)),
        new Code("<"     ,c=>let b=ss.pop();ss.push(ss.pop()<b)),
        new Code("<>"    ,c=>ss.push(ss.pop()!==ss.pop())),
// output
        new Code("base@" ,c=>ss.push(base)),
        new Code("base!" ,c=>base=ss.pop()),
        new Code("hex"   ,c=>base=16),
        new Code("decimal",c=>base=10),
        new Code("cr"    ,c=>{log("<br/>\n")}),
        new Code("."     ,c=>log(ss.pop().toString(base)+" ")),
        new Code("emit"  ,c=>log(String.fromCharCode(ss.pop()))),
        new Code("space" ,c=>log(SPC)),
        new Code("spaces",c=>{for(let i=0,n=ss.pop();i<n;i++) log(SPC)}),
        new Code(".r"    ,c=>{
            let n=ss.pop(), s=ss.pop().toString(base)
            for(let i=0; i+s.length<n; i++) log(SPC)
            log(s+SPC) }),
        
// strings
        new Immd("["     ,c=>compile=false),
        new Code("]"     ,c=>compile=true),
        new Code("find"  ,c=>{idiom=parse(); ss.push(find(idiom))}),
        new Code("'"     ,c=>tick()),
        new Code("(')"   ,c=>ss.push(words[w].pf[ip++])),
        new Immd("[']"   ,c=>{ compilecode("(')"); tick(); compilecode(ss.pop())}),
        new Code("dolit" ,c=>ss.push(words[wp].pf[ip++])),
        new Code("dostr" ,c=>ss.push(words[w].pf[ip++])),
        new Immd('s"'    ,c=>{
             let s=parse('"');
             if (compiling) {compilecode("dostr"); dictcompile(s)}
             else ss.push(s) }),
        new Code("dotstr",c=>{n=words[wp].pf[ip++]; log(n)}),
        new Immd('."'    ,c=>{
             let s=parse('"');
             if (compiling) {compilecode("dotstr"); dictcompile(s)}
             else {log(s)}}),
        new Immd('('     ,c=>s=parse(')')),
        new Immd('.('    ,c=>log(parse(')'))),
        new Immd('\\'    ,c=>log(parse('\n'))),

// structures
        new Code("exit"   ,c=>exit()),
        new Code("0branch",c=>{
             if (ss.pop()) ip++;
             else ip=words[wp].pf[ip]}),
        new Code("donext" ,c=>{
            i=rs.pop()-1
            if (i>=0) {ip=words[wp].pf[ip];rs.push(i)} else {ip++}}),
        new Immd("if"  ,c=>{    // if    ( -- here ) 
            compilecode("0branch");
            ss.push(words[words.length-1].pf.length); dictcompile(0)}),
        new Immd("else",c=>{    // else ( here -- there )
            compilecode("branch");
            let h=words[words.length-1].pf.length;
            dictcompile(0)
            words[words.length-1].pf[ss.pop()]
                =words[words.length-1].pf.length;ss.push(h)}),
        new Immd("then",c=>{    // then    ( there -- ) 
            words[words.length-1].pf[ss.pop()]
                =words[words.length-1].pf.length}),
        new Immd("begin"  ,c=>ss.push(words[words.length-1].pf.length)),
        new Immd("again"  ,c=>{ // again    ( there -- ) 
            compilecode("branch");compilecode(ss.pop())}),
        new Immd("until"  ,c=>{ // until    ( there -- ) 
            compilecode("0branch");compilecode(ss.pop())}),
        new Immd("while"  ,c=>{ // while    ( there -- there here ) 
            compilecode("0branch");
            ss.push(words[words.length-1].pf.length); dictcompile(0)}),
        new Immd("repeat" ,c=>{ // repeat    ( there1 there2 -- ) 
            compilecode("branch");t=ss.pop();compilecode(ss.pop());
            words[words.length-1].pf[t]=words[words.length-1].pf.length}),
        new Immd("for" ,c=>{    // for ( -- here )
            compilecode(">r");ss.push(words[words.length-1].pf.length)}),
        new Immd("next",c=>{    // next ( here -- )
            compilecode("donext"); compilecode(ss.pop())}),
        new Immd("aft" ,c=>{    // aft ( here -- here there )
            ss.pop(); compilecode("branch");
            h=words[words.length-1].pf.length;dictcompile(0);
            ss.push(words[words.length-1].pf.length);ss.push(h)}),

// defining words
        new Code(":"       ,c=>{
            compiling=true;
            words.push(new Code(parse(), c=>nest()))}),
        new Immd(";"       ,c=>{ compile=false; compilecode("exit")}),
        new Code("create"  ,c=>words.push(new Code(parse(), c=>dovar()))),
        new Code("variable",c=>words.push(new Code(parse(), c=>dovar()))),
        new Code("constant",c=>{
            words.push(new Code(parse(), c=>docon()));
            words[words.length-1].qf[0]=ss.pop()}),
        new Code(","       ,c=>words[words.length-1].qf.push(ss.pop())),
        new Code("allot"   ,c=>{
            let n=ss.pop()
            for(i=0;i<n;i++) words[words.length-1].qf.push(0)}),
        new Code("does"    ,c=>{
            words[words.length-1].xt=()=>nest();
            words[words.length-1].pf=words[wp].pf.slice(ip);ip=-1}),
        new Code("q@"      ,c=>ss.push(words[wp].qf[ss.pop()])),
// tools
        new Code("here",c=>ss.push(words.length)),
        new Code("words",c=>{
            for(i=words.length-1;i>=0;i--) log(words[i].name+" ")}),
        new Code("dump",c=>{
            log('words[<br/>')
            for(i=0;i<words.length;i++){
                log('{name:"'+words[i].name+'", xt:'+words[i].xt.toString(base));
                if (words[i].pf)   log(', pf:['+words[i].pf.toString(base)+']');
                if (words[i].qf)   log(', qf:['+words[i].qf.toString(base)+']');
                if (words[i].immd) log(' ,immediate:'+words[i].immd);
                log('}},<br/>')}
            log(']<br/>')}),
        new Code("forget",c=>{
            tick(); let n=ss.pop();
            if (n < fence) {ss=[]; throw(" "+idiom+" below fence" )}
            for(let i=words.length-1;i>=n;i--) words.pop()}),
        new Code("boot",c=>for(i=words.length-1;i>=fence;i--)words.pop()),
        new Code("see",c=>{
            tick();n=ss.pop();p=words[n].pf;s="";
            for(i=0;i<p.length;i++){
                if (s=="dolit"||s=="branch"||s=="0branch"
                    ||s=="donext"||s=="dostr"||s=="dotstr") {
                    s=" ";log(p[i].toString(base)+" ")}
                else {s=words[p[i]].name;log(s+" ")}}}),
        new Code("date",c=>{log(new Date()); log("<br/>")}),
        new Code("@"   ,c=>{a=ss.pop();ss.push(words[a].qf[0])}),
        new Code("!"   ,c=>{a=ss.pop();words[a].qf[0]=ss.pop()}),
        new Code("+!"  ,c=>{a=ss.pop();words[a].qf[0]+=ss.pop()}),
        new Code("?"   ,c=>{
            log(words[ss.pop()].pf[0].toString(base)+" ")}),
        new Code("array@",c=>{ // array@ ( w i -- n ) 
            let i=ss.pop(), a=ss.pop();ss.push(words[a].qf[i])}),
        new Code("array!",c=>{ // array! ( n w i -- ) 
            let i=ss.pop(), a=ss.pop();words[a].qf[i]=ss.pop()}),
        new Code("is",c=>{ // ( a -- ) vector a to next word 
            tick();let b=ss.pop(), a=ss.pop();words[b].pf=words[a].pf}),
        new Code("to",c=>{ // ( a -- ) change value of next word
            let a=words[wp].pf[ip++];words[a].qf[0]=ss.pop()}),
        new Code("ms"    ,c=>{sleep(ss.pop())})
// transcendental
        new Code("pi"    ,c=>{ss.push(Math.PI)}),
        new Code("random",c=>{ss.push(Math.random())}),
        new Code("int"   ,c=>{ss.push(Math.trunc(ss.pop()))}),
        new Code("ceil"  ,c=>{ss.push(Math.ceil(ss.pop()))}),
        new Code("floor" ,c=>{ss.push(Math.floor(ss.pop()))}),
        new Code("sin"   ,c=>{ss.push(Math.sin(ss.pop()))}),
        new Code("cos"   ,c=>{ss.push(Math.cos(ss.pop()))}),
        new Code("tan"   ,c=>{ss.push(Math.tan(ss.pop()))}),
        new Code("asin"  ,c=>{ss.push(Math.asin(ss.pop()))}),
        new Code("acos"  ,c=>{ss.push(Math.acos(ss.pop()))}),
        new Code("exp"   ,c=>{ss.push(Math.exp(ss.pop()))}),
        new Code("log"   ,c=>{ss.push(Math.log(ss.pop()))}),
        new Code("sqrt"  ,c=>{ss.push(Math.sqrt(ss.pop()))}),
        new Code("abs"   ,c=>{ss.push(Math.abs(ss.pop()))}),
        new Code("max"   ,c=>{let b=ss.pop();ss.push(Math.max(ss.pop(),b))}),
        new Code("min"   ,c=>{let b=ss.pop();ss.push(Math.min(ss.pop(),b))}),
        new Code("atan2" ,c=>{let b=ss.pop();ss.push(Math.atan2(ss.pop(),b))}),
        new Code("pow"   ,c=>{let b=ss.pop();ss.push(Math.pow(ss.pop(),b))})
    ]
    fence=words.length;
}
