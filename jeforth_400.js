'use strict';
(function() {
    let fence = 0
    let Prim  = class {
        constructor(name, xt) {
            this.name=name; this.xt=xt; this.token=fence++; this.immd=0;
        }
    }
    let Code  = class {
        constructor(name, n=null) {
            this.name=name; this.immd=0; this.stage=0
            if (n==null) this.token=fence++
            this.pf=[]; this.pf1=[]; this.pf2=[]; this.qf=[]
        }
        addcode(w) { this.pf.push(w) }
    }
    function ForthVM(output=console.log) {    /// ForthVM object template
		let ss=[456,123,100,12], rs=[]        /// stacks
        let tib="", ntib=0, here=4, base=10   /// internal variables
        let cmpl=true
        
        /// IO functions
        const nxtok  = ()=>input.next()
        const log    = (s)=>output(s)
        const NA     = (s)=>s+" not found"
        const token  = (w)=>{for (let i in dict) if (w.name==dict[i].name) return i; }
        
        /// stack functions
        const top    = (n=1)=>ss[ss.length-n]
        const push   = v=>ss.push(v)
        const pop    = ()=>ss.pop()
        const remove = n=>{ let v=top(n); ss.splice(length-n,1); return v }
        const topR   = (n=1)=>rs[ss.length-n]
        const pushR  = v=>rs.push(v)
        const popR   = ()=>rs.pop()

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
                for(let i=0; i+s.length()<n; i++) log(" ");
                log(s+" "); }),
            new Prim("key", c=>push(nxtok()[0])),
            new Prim("emit", c=>log(String.fromCharCode(pop()))),
            new Prim("space", c=>log(" ")),
            new Prim("spaces", c=>{
                let n=pop();
                for (let i=0; i<n; i++) log(" "); }),
            // literals
            new Prim("[", c=>cmpl=false ),
            new Prim("]", c=>cmpl=true ),
            new Prim("'", c=>{
                let s=nxtok();
                let w=dict.find(wx=>s==wx.name); if (w==null) throw NA(s)
                push(w.token); }),
            new Prim("dolit", c=>push(c.qf[0])),                // integer literal
            new Prim("dostr", c=>push(c.token)),                // string literal
            new Prim("$\"", c=>{                                // -- w a
                let d=this.in.delimiter(); this.in.useDelimiter("\"")
                let s=nxtok()
                let w=new Code("dostr", s)
                if (dict[-1].pf==null) dict[-1].pf=[]
                dict[-1].pf.push(w)
                    this.in.useDelimiter(d); nxtok()
                push(last.token)
                push(last.pf[-1]) }),
            new Prim("dotstr",c=>log(c.literal)),
            new Prim(".\"", c=>{
                let d=this.in.delimiter(); this.in.useDelimiter("\"")
                let s=nxtok()
                dict[-1].addcode(new Code("dotstr", s))
                    this.in.useDelimiter(d); nxtok() }),
            new Prim("(", c=>{
                let d=this.in.delimiter(); this.in.useDelimiter("\\)")
                let s=nxtok(); this.in.useDelimiter(d); nxtok() }),
            new Prim(".(", c=>{
                let d=this.in.delimiter(); this.in.useDelimiter("\\)")
                log(nxtok())
                    this.in.useDelimiter(d); nxtok() }),
            new Prim("\\", c=>{
                let d=this.in.delimiter(); this.in.useDelimiter("\n");
                    nxtok(); this.in.useDelimiter(d); nxtok() }),
            // structure: if else then
            new Prim("branch",c=>(pop()==0 ? c.pf1 : c.pf).forEach(w=>w.xt(c))),
            new Prim("if", c=>{
                dict[-1].addcode(new Code("branch"))
                dict.add(new Code("temp") }),
            new Prim("else", c=>{
                let last=dict[-2].pf[-1]
                let temp=dict[-1]
                last.pf.addAll(temp.pf)
                temp.pf.clear()
                last.stage=1 }),
            new Prim("then", c=>{
                let last=dict[-2].pf[-1]
                let temp=dict[-1]
                if (last.stage==0) {
                    last.pf.addAll(temp.pf)
                    dict.pop()
                } else {
                    last.pf1.addAll(temp.pf)
                    if (last.stage==1) dict.pop()
                    else temp.pf.clear()
                } }),
            // loops
            new Prim("loops", c=>{
                if (c.stage==1) {                          // again
                    while (true) { c.pf.forEach(w=>w.xt(c)) }
                } else if (c.stage==2) {                   // while repeat
                    while (true) {
                        c.pf.forEach(w=>w.xt(c))
                        if (pop()==0) break;
                        c.pf1.forEach(w=>w.xt(c))
                    }
                } else {
                    while (true) {                          // until
                        c.pf.forEach(w=>w.xt(c))
                        if(pop()!=0) break;
                    }
                } }),
            new Prim("begin", c=>{
                dict[-1].addcode(new Code("loops", false))
                dict.push(new Code("temp", false)) }),
            new Prim("while", c=>{
                let last=dict[-2].pf[-1]
                let temp=dict[-1]
                last.pf.addAll(temp.pf)
                temp.pf.clear()
                last.stage=2 }),
            new Prim("repeat", c=>{
                let last=dict[-2].pf[-1]
                let temp=dict[-1]
                last.pf1.addAll(temp.pf)
                dict.pop() }),
            new Prim("again", c=>{
                let last=dict[-2].pf[-1]
                let temp=dict[-1]
                last.pf.addAll(temp.pf)
                last.stage=1
                dict.pop }),
            new Prim("until", c=>{
                let last=dict[-2].pf[-1]
                let temp=dict[-1]
                last.pf.addAll(temp.pf)
                dict.pop }),
            // for next
            new Prim("cycles", c=>{
                let i=0;
                if (c.stage==0) {
                    while(true){
                        c.pf.forEach(w=>w.xt(c))
                        i = popR()-1;
                        if (i<0) break;
                        pushR(i);
                    }
                } else {
                    if (c.stage>0) {
                        c.pf.forEach(w=>w.xt(c))
                        while(true){
                            c.pf2.forEach(w=>w.xt(c))
                            i=popR()-1;
                            if (i<0) break;
                            pushR(i);
                            c.pf1.forEach(w=>w.xt(c))
                        }
                    }
                } }),
            new Prim("for", c=>{
                dict[-1]
                    .addcode(new Code(">r", false))
                    .addcode(new Code("cycles", false))
                dict.add(new Code("temp", false)) }),
            new Prim("aft", c=>{
                let last=dict[-2].pf[-1]
                let temp=dict[-1]
                last.pf.addAll(temp.pf)
                temp.pf = []
                last.stage=3 }),
            new Prim("next", c=>{
                let last=dict[-2].pf[-1]
                let temp=dict[-1]
                if (last.stage==0) last.pf.addAll(temp.pf)
                else last.pf2.addAll(temp.pf)
                dict.pop() }),
            // defining words
            new Prim("exit", c=>{ throw "close the app" }),      // exit interpreter
            new Prim("exec", c=>dict[pop()].xt(c)),
            new Prim(":", c=>{                                   // colon
                let s=nxtok()
                dict.push(new Code(s))
                cmpl=true }),
            new Prim(";", c=>cmpl=false),                        // semicolon
            new Prim("docon", c=>push(c.qf[0])),                 // integer literal
            new Prim("dovar", c=>push(c.token)),                 // string literal
            new Prim("create", c=>{
                let s=nxtok(); dict.push(new Code(s))
                let last=dict[-1].addcode(new Code("dovar",0))
                last.pf[0].token=last.token
                last.pf[0].qf.remove_head() }),
            new Prim("variable", c=>{ 
                let s=nxtok(); dict.push(new Code(s))
                let last=dict[-1].addcode(new Code("dovar",0));
                last.pf[0].token=last.token }),
            new Prim("constant", c=>{  // n --
                let s=nxtok(); dict.push(new Code(s))
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
                let last=dict[-1], source=dict[wp]
                last.pf.addAll(source.pf.subList(ip+2,source.pf.size())); }),
            new Prim("to", c=>{                                               // n -- , compile only 
                let last=dict[wp]
                ip++;                                                         // current colon word
                last.pf[ip++].pf[0].qf[0]=pop() }),                           // next constant
            new Prim("is", c=>{                                               // w -- , execute only
                let source=dict[pop()]                                        // source word
                let s=nxtok();
                let w = dict.find(wx=>s==wx.name); if (w==null) throw NA(s)
                dict[w.token].pf = source.pf }),
            // tools
            new Prim("here", c=>push(dict[-1].token)),
            new Prim("boot", c=>dict.splice(104, dict.length)),
            new Prim("forget", c=>{
                let s=nxtok();
                let w = dict.find(wx=>s==w.name); if (w==null) throw NA(s)
                for (let i=dict[-1].token; i>=Math.max(w.token,104); i--) dict.pop() }),
            new Prim("words", c=>{
                for (let i=0, j=1; j<=dict[-1].token+1; j++, i++) {
                    var w = dict[-j]
                    log(w.name+" "+w.token+" ")
                    if (i>9) { log("\n"); i=0; }
                } }),
            new Prim(".s", c=>ss.forEach(s=>log(s.toString(base)+" "))),
            new Prim("see", c=>{
                let s=nxtok()
                let w = dict.find(wx=>s==wx.name); if (w==null) throw NA(s)
                log(w.name+", "+w.token+", "+w.qf.toString())
                w.pf.forEach(wx=>log(wx.name+", "+wx.token+", "+wx.qf.toString()+"| ")) }),
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
            console.log(dict)
        }
        this.exec = (cmd)=>{
            tib=cmd, ntib=0
            let w = dict.find(w=>cmd==w.name)
            if (w!=null) w.xt(null)
            else         log(cmd+"?\n")
            this.ok()
        }
    }
    window.ForthVM = ForthVM
})();
/*

public class EforthTing {    // ooeforth 2.04
    static Scanner in; 
    static Stack<Integer> ss=new Stack<>();
    static Stack<Integer> rs=new Stack<>();
    static ForthList<Code> dict=new ForthList<>();        
    static boolean cmpl=false;
    static int base=10;
    static int wp,ip;
    static Frame frame = new Frame("ooeForth");
    static TextArea input = new TextArea("words",10,50);
    static TextArea output = new TextArea("ooeForth 2.04\n",10,80);
    function setup_dict() {
        lookUp.forEach((k,v)->dict.add(new Prim(k))); // create primitive words
        final String immd[]= {
                ";","(","$\"","\\",".(",".\"",
                "aft","again","begin","else","for","if",
                "next","repeat","then","until","while"};
        for (String s: immd) { 
            dict.find(s,w->s.equals(w.name)).immediate(); // set immediate flag
        }
    }
    public static void main(String args[]) { 
        System.out.println("ooeForth2.03\n");
        setup_dict();
        // GetKeyChar
        Font font= new Font("Monospaced", Font.PLAIN, 12);
        input.setFont(font);
        output.setFont(font);
        frame.add(input, BorderLayout.EAST);
        frame.add(output, BorderLayout.WEST);
        frame.setSize(1000, 700);
        frame.setVisible(true);
        frame.addWindowListener(new WindowAdapter() {
            public void windowClosing(WindowEvent we) {
                System.exit(0);
            }});
        input.addKeyListener(new KeyAdapter() {
            public void keyTyped(KeyEvent ke) {
                char keyChar = ke.getKeyChar();
                if (keyChar <= 13) {
                    in = new Scanner(input.getText());
                    outerInterpreter();
                    for(int n:stack) System.out.print(Integer.toString(n,base)+" ");
                    System.out.print(">ok\n");
                    input.setText("");
                    in.close();
        }}});
    }
    // outer interpreter
    public static void outerInterpreter() {                 // ooeforth 2.01
        while(in.hasNext()) {                               // parse input
            String idiom=nxtok();
            Code newWordObject=dict.find(idiom,w->idiom.equals(w.name));     
            if(newWordObject !=null) {                      // word found
                if((!cmpl) || newWordObject.immediate) {
                    try {newWordObject.xt(); }              // execute
                    catch (Exception e) {log(e.toString());}}
                else {                                      // or compile
                    dict.tail().addCode(newWordObject);}}                     
            else { 
                try {int n=Integer.parseInt(idiom, base);   // not word, try number
                if (cmpl) {                            // compile integer literal
                    dict.tail().addCode(new Prim("dolit",n));}                
                else { push(n);}}                     // or push number on stack
                catch (NumberFormatException  ex) {         // catch number errors
                    log(idiom + "? ");
                    cmpl=false; ss.clear();}
            }}
        for(int n:stack) log(Integer.toString(n,base)+" ");
        log(">ok\n");
    }
    static public class ForthList<T> extends ArrayList<T> { 
        T head()           { return get(0);               }
        T tail()           { return get(size() - 1);      }
        T tail(int offset) { return get(size() - offset); }
        T find(String s, Predicate<T> m) { 
            for (int i=size()-1; i>=0; i--) {           // search array from tail to head
                T w = get(i);
                if (m.test(w)) return w;}
            return null;
        }
        ForthList<T> set_head(T w) { set(0, w);        return this; }
        ForthList<T> remove_head() { remove(0);        return this; }
        ForthList<T> remove_tail() { remove(size()-1); return this; }
    }
    // forth words constructor
    static class Code {                                 // one size fits all objects
        static int fence=0;
        public int token=0;
        public String name;
        public ForthList<Code> pf=new ForthList<>();
        public ForthList<Code> pf1=new ForthList<>();
        public ForthList<Code> pf2=new ForthList<>();
        public ForthList<Integer> qf=new ForthList<>() ;
        public int struct=0;
        public boolean immediate=false;
        public String literal;
        public Code(String n) {name=n;token=fence++;}
        public Code(String n, boolean f) {name=n; if (f) token=fence++;}
        public Code(String n, int d) {name=n;qf.add(d);}
        public Code(String n, String l) {name=n;literal=l;}
        public Code immediate() { immediate=true; return this; }
        public void xt() {
            if (lookUp.containsKey(name)) {
                lookUp.get(name).accept(this);                  // run primitives words
            } else { pushR(wp); pushR(ip);          // run colon words
            wp=token; ip=0;                                     // point to current object
            for(Code w:pf) {
                try { w.xt();ip++;}                             // inner interpreter
                catch (ArithmeticException e) {}}
            ip=popR(); wp=popR();}}
        public Code addCode(Code w) {this.pf.add(w);return this;} 
    }
}
*/
