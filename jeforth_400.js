'use strict';
(function() {
    function ForthVM(output=console.log) {    /// ForthVM object template
        this.print = output;                  /// setup output function
        var ss = [], rs = [], dict = [];      /// internal variables
        var tib= "", ntib=0, here=4;
        /// stack functions
        const top    = ()=>ss[-1];
        const push   = (v)=>ss.push(v);
        const pop    = ()=>ss.pop();
        const remove = (n)=>{ let v=ss[n]; ss.splice(n,1); return v; }
        const topR   = ()=>rs[-1];
        const pushR  = (v)=>rs.push(v);
        const popR   = ()=>rs.pop();
        /// primitives
        const prim   = {
            "hi"    :c=>this.print("---->hi\n"),
            "dup"   :c=>push(top()),
            "over"  :c=>push(ss[-2]),
            "2dup"  :c=>push(remove(-2)),
            "2over" :c=>ss.concat(ss.splice(-4,2)),
            "4dup"  :c=>ss.concat(ss.splice(-4,4)),
            "swap"  :c=>ss.add(ssz(-2), pop()),
            "rot"   :c=>push(remove(-3)),
            "-rot"  :c=>{ push(remove(-3)); push(remove(-3)); },
            "2swap" :c=>{ push(remove(-4)); push(remove(-4)); },
            "pick"  :c=>{ let i=pop(), n=ss[-i-1];     push(n); },
            "roll"  :c=>{ let i=pop(), n=remove(-i-1); push(n); },
            "drop"  :c=>pop(),
            "nip"   :c=>remove(-2),
            "2drop" :c=>{ pop(); pop(); },
            ">r"    :c=>pushR(pop()),
            "r>"    :c=>push(popR()),
            "r@"    :c=>push(topR()),
            "push"  :c=>pushR(pop()),
            "pop"   :c=>push(popR()),
            // math
            "+"     :c=>{ let n=pop(); push(pop()+n); },
            "-"     :c=>{ let n=pop(); push(pop()-n); },
            "*"     :c=>{ let n=pop(); push(pop()*n); },
            "/"     :c=>{ let n=pop(); push(pop()/n); },
            "*/"    :c=>{ let n=pop(); push(pop()*pop()/n); },
            "*/mod" :c=>{ let n=pop(), m=pop()*pop(); push(m%n); push(m/n); },
            "mod"   :c=>{ let n=pop(); push(pop()%n); },
            "and"   :c=>push(pop()&pop()),
            "or"    :c=>push(pop()|pop()),
            "xor"   :c=>push(pop()^pop()),
            "negate":c=>push(-pop()),
            "abs"   :c=>push(Math.abs(pop())),
            // logic
            "0="    :c=>push((pop()==0)?-1:0),
            "0<"    :c=>push((pop() <0)?-1:0),
            "0>"    :c=>push((pop() >0)?-1:0),
            "="     :c=>{ let n=pop(); push((pop()==n)?-1:0); },
            ">"     :c=>{ let n=pop(); push((pop()>n )?-1:0); },
            "<"     :c=>{ let n=pop(); push((pop()<n )?-1:0); },
            "<>"    :c=>{ let n=pop(); push((pop()!=n)?-1:0); },
            ">="    :c=>{ let n=pop(); push((pop()>=n)?-1:0); },
            "<="    :c=>{ let n=pop(); push((pop()<=n)?-1:0); },
            // output
            "base@" :c=>push(base),
            "base!" :c=>base=pop(),
            "hex"   :c=>base=16,
            "decimal":c=>base=10,
            "cr"    :c=>this.print("\n"),
            "."     :c=>this.print(Integer.toString(pop(),base)+" "),
        }
        this.ok = ()=>this.print(ss.join('_')+"_ok ");
        this.init = ()=>{
            push(456);
            push(123);
            push(100);
            push(12);
        }
        this.exec = (cmd)=>{
            tib=cmd; ntib=0;
            prim[cmd](null);
            this.ok();
        }
    }
    window.ForthVM = ForthVM;
})();
/*
            { name:".r",   xt:c=>{
              let n=pop();
              String s=Integer.toString(pop(), base);
              for(i=0; i+s.length()<n; i++) output.append(" ");
              output.append(s+" "); }},
              { name:"u.r",  xt:c=>{
              let n=pop();
              String s=Integer.toString(pop()&0x7fffffff, base);
              for(i=0; i+s.length()<n; i++) output.append(" ");
              output.append(s+" "); }},
            { name:"key",  xt:c=>push(in.next().charAt(0)) },
            { name:"emit", xt:c=>output.append((char)pop()) },
            { name:"space",xt:c=>output.append(" "); },
            { name:"spaces",xt:c=>{ let n=pop(); for (i=0; i<n; i++) output.append(" "); }},
            // literals
            { name:"[",    xt:c=>compiling=false },
            { name:"]",    xt:c=>compiling=true },
            { name:"'",    xt:c=>{
                String s=in.next();
                Code w = dict.find(s, wx->s.equals(wx.name));
                if (w==null) throw new  NumberFormatException();
                push(w.token); }},
            { name:"dolit",xt:c=>push(c.qf.head()) },            // integer literal
            { name:"dostr",xt:c=>push(c.token) },                // string literal
            { name:"$\"", xt:c=>{ // -- w a
                let d=in.delimiter();
                    in.useDelimiter("\"");          
                String s=in.next();
                Code last=dict.tail().addCode(new Code("dostr",s)); // literal=s, 
                    in.useDelimiter(d);in.next();
                push(last.token);push(last.pf.size()-1); }},
            { name:"dotstr",xt:c=>{output.append(c.literal); }},
            { name:".\"", xt:c=>{
                let d=in.delimiter();
                    in.useDelimiter("\"");      
                String s=in.next();
                dict.tail().addCode(new Code("dotstr",s));    // literal=s, 
                    in.useDelimiter(d);in.next(); }},
            { name:"(", xt:c=>{
                let d=in.delimiter();
                    in.useDelimiter("\\)");
                String s=in.next();
                    in.useDelimiter(d);in.next(); }},
            { name:".(", xt:c=>{
                let d=in.delimiter();
                    in.useDelimiter("\\)");output.append(in.next() },
                    in.useDelimiter(d);in.next(); }},
            { name:"\\", xt:c=>{
                let d=in.delimiter();
                    in.useDelimiter("\n");in.next();
                    in.useDelimiter(d);in.next(); }},
            // structure: if else then
            { name:"branch",xt:c=>{
                if(!(pop()==0)) {for(var w:c.pf) w.xt();}
                else {for(var w:c.pf1) w.xt();} }},
            { name:"if", xt:c=>{
                dict.tail().addCode(new Code("branch", false));   
                dict.add(new Code("temp", false)); }},
            { name:"else", xt:c=>{
                Code last=dict.tail(2).pf.tail();                 
                Code temp=dict.tail();
                last.pf.addAll(temp.pf);
                temp.pf.clear();
                last.struct=1; }},
            { name:"then", xt:c=>{
                Code last=dict.tail(2).pf.tail();                 
                Code temp=dict.tail();
                if (last.struct==0) {
                    last.pf.addAll(temp.pf);
                    dict.remove_tail();                           
                } else {
                    last.pf1.addAll(temp.pf);
                    if (last.struct==1) { dict.remove_tail();}        
                    else temp.pf.clear();
                } }},
            // loops
            { name:"loops", xt:c=>{
                if (c.struct==1) {                          // again
                    while(true) {for(var w:c.pf) w.xt();}}
                if (c.struct==2) {                          // while repeat
                    while (true) {
                        for(var w:c.pf) w.xt();
                        if (pop()==0) break;
                        for(var w:c.pf1) w.xt();}
                } else {
                    while(true) {                           // until
                        for(var w:c.pf) w.xt();
                        if(pop()!=0) break;}
                } }},
            { name:"begin", xt:c=>{
                dict.tail().addCode(new Code("loops", false));    
                dict.add(new Code("temp", false)); }},
            { name:"while", xt:c=>{
                Code last=dict.tail(2).pf.tail();                 
                Code temp=dict.tail();                            
                last.pf.addAll(temp.pf);
                temp.pf.clear();
                last.struct=2; }},
            { name:"repeat", xt:c=>{
                Code last=dict.tail(2).pf.tail();                 
                Code temp=dict.tail();
                last.pf1.addAll(temp.pf);
                dict.remove_tail(); }},
            { name:"again", xt:c=>{
                Code last=dict.tail(2).pf.tail();                 
                Code temp=dict.tail();
                last.pf.addAll(temp.pf);
                last.struct=1;
                dict.remove_tail(); }},
            { name:"until", xt:c=>{
                Code last=dict.tail(2).pf.tail();                 
                Code temp=dict.tail();
                last.pf.addAll(temp.pf);
                dict.remove_tail(); }},
            // for next
            { name:"cycles", xt:c=>{
                let i=0;
                if (c.struct==0) {
                    while(true){
                        for (w in c.pf) w.xt();
                        i = popR()-1;
                        if (i<0) break;
                        pushR(i);
                    }
                } else {
                    if (c.struct>0) {
                        for (w in c.pf) w.xt();
                        while(true){
                            for (w in c.pf2) w.xt();
                            i=popR()-1;
                            if (i<0) break;
                            pushR(i);
                            for (w in c.pf1) w.xt();
                        }
                    }
                } }},
            { name:"for", xt:c=>{
                dict.tail()                                   
                    .addCode(new Code(">r", false))                 
                    .addCode(new Code("cycles", false));            
                dict.add(new Code("temp", false)); }},
            { name:"aft", xt:c=>{
                Code last=dict.tail(2).pf.tail();             
                Code temp=dict.tail();
                last.pf.addAll(temp.pf);
                temp.pf.clear();
                last.struct=3; }},
            { name:"next", xt:c=>{
                Code last=dict.tail(2).pf.tail();             
                Code temp=dict.tail();
                if (last.struct==0) last.pf.addAll(temp.pf);
                else last.pf2.addAll(temp.pf);
                dict.remove_tail(); }},
            // defining words
            { name:"exit", xt:c=>{throw new ArithmeticException(); }},     // exit interpreter
            { name:"exec", xt:c=>{int let n=pop();dict.get(n).xt(); }},
            { name:":", xt:c=>{                                            // colon
                String s=in.next();
                dict.add(new Code(s) },
                compiling=true; }},
            { name:";", xt:c=>compiling=false },                           // semicolon
            { name:"docon", xt:c=>push(c.qf.head()) },                  // integer literal
            { name:"dovar", xt:c=>push(c.token) },                      // string literal
            { name:"create", xt:c=>{
                String s=in.next();
                dict.add(new Code(s) },
                Code last=dict.tail().addCode(new Code("dovar",0));   
                last.pf.head().token=last.token;
                last.pf.head().qf.remove_head(); }},
            { name:"variable", xt:c=>{ 
                String s=in.next();
                dict.add(new Code(s) },
                Code last=dict.tail().addCode(new Code("dovar",0));   
                last.pf.head().token=last.token; }},
            { name:"constant", xt:c=>{  // n --
                String s=in.next();
                dict.add(new Code(s) },
                Code last=dict.tail().addCode(new Code("docon",pop())); 
                last.pf.head().token=last.token; }},
            { name:"@", xt:c=>{  // w -- n
                Code last=dict.get(pop() },
                push(last.pf.head().qf.head()); }},
            { name:"!", xt:c=>{  // n w -- 
                Code last=dict.get(pop() },
                last.pf.head().qf.set_head(pop()); }},
            { name:"+!", xt:c=>{  // n w -- 
                Code last=dict.get(pop() },
                let n=last.pf.head().qf.head(); n+=pop();     
                last.pf.head().qf.set_head(n); }},
            { name:"?", xt:c=>{  // w -- 
                Code last=dict.get(pop());
                output.append(Integer.toString(last.pf.head().qf.head())); }},
            { name:"array@", xt:c=>{  // w a -- n
                let a=pop();
                Code last=dict.get(pop() },
                push(last.pf.head().qf.get(a)); }},
            { name:"array!", xt:c=>{  // n w a -- 
                let a=pop();
                Code last=dict.get(pop() },
                last.pf.head().qf.set(a,pop()); }},
            { name:",", xt:c=>{ // n --
                Code last=dict.tail();                        
                last.pf.head().qf.add(pop()); }},
            { name:"allot", xt:c=>{  // n --
                let n=pop(); 
                Code last=dict.tail();                        
                for (let i=0;i<n;i++) last.pf.head().qf.head(); }},
            { name:"does", xt:c=>{ // n --
                Code last=dict.tail();                        
                Code source=dict.get(wp);
                last.pf.addAll(source.pf.subList(ip+2,source.pf.size())); }},
            { name:"to", xt:c=>{                                               // n -- , compile only 
                Code last=dict.get(wp);
                ip++;                                                         // current colon word
                last.pf.get(ip++).pf.head().qf.set_head(pop()); }},        // next constant
            { name:"is", xt:c=>{                                               // w -- , execute only
                Code source=dict.get(pop());                               // source word
                String s=in.next();
                Code w = dict.find(s, wx->s.equals(wx.name)); 
                if (w==null) throw new  NumberFormatException();                
                dict.get(w.token).pf = source.pf; }},
            // tools
            { name:"here", xt:c=>push(dict.tail().token) },
            { name:"boot", xt:c=>for (int i=dict.tail().token;i>104;i--) dict.remove_tail() },
            { name:"forget", xt:c=>{
                String s=in.next();
                Code w = dict.find(s, wx->s.equals(wx.name)); 
                if (w==null) throw new  NumberFormatException();                
                for (int i=dict.tail().token;i>=Math.max(w.token,104);i--) dict.remove_tail(); }},
            { name:"words", xt:c=>{
                for (int i=0, j=1; j<=dict.tail().token+1; j++, i++) {
                    var w = dict.tail(j);
                    output.append(w.name+" "+w.token+" ");
                    if (i>9) { output.append("\n"); i=0; }
                } }},
            { name:".s", xt:c=>for(int n:stack) output.append(Integer.toString(n,base)+" ") },
            { name:"see", xt:c=>{
                String s=in.next();
                Code w = dict.find(s, wx->s.equals(wx.name)); 
                if (w==null) throw new  NumberFormatException();                
                output.append(w.name+", "+w.token+", "+w.qf.toString() },
                for(var wx:w.pf) output.append(wx.name+", "+wx.token+", "+wx.qf.toString()+"| "); }},
            { name:"time", xt:c=>{
                LocalTime now=LocalTime.now();
                output.append(now.toString()); }},
            { name:"ms", xt:c=>{ // n --
                try { Thread.sleep(pop());} 
                catch (Exception e) { output.append(e.toString());} }}

public class EforthTing {    // ooeforth 2.04
    static Scanner in; 
    static Stack<Integer> ss=new Stack<>();
    static Stack<Integer> rs=new Stack<>();
    static ForthList<Code> dict=new ForthList<>();        
    static boolean compiling=false;
    static int base=10;
    static int wp,ip;
    static Frame frame = new Frame("ooeForth");
    static TextArea input = new TextArea("words",10,50);
    static TextArea output = new TextArea("ooeForth 2.04\n",10,80);
    function setup_dict() {
        lookUp.forEach((k,v)->dict.add(new Code(k))); // create primitive words
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
            String idiom=in.next();
            Code newWordObject=dict.find(idiom,w->idiom.equals(w.name));     
            if(newWordObject !=null) {                      // word found
                if((!compiling) || newWordObject.immediate) {
                    try {newWordObject.xt(); }              // execute
                    catch (Exception e) {output.append(e.toString());}}
                else {                                      // or compile
                    dict.tail().addCode(newWordObject);}}                     
            else { 
                try {int n=Integer.parseInt(idiom, base);   // not word, try number
                if (compiling) {                            // compile integer literal
                    dict.tail().addCode(new Code("dolit",n));}                
                else { push(n);}}                     // or push number on stack
                catch (NumberFormatException  ex) {         // catch number errors
                    output.append(idiom + "? ");
                    compiling=false; ss.clear();}
            }}
        for(int n:stack) output.append(Integer.toString(n,base)+" ");
        output.append(">ok\n");
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
