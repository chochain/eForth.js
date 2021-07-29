/* jeForth 3.01
A minimalist Forth Implementation in Javascript
2021/1/7    Chen-Hanson Ting update for svfig
    next-nest-unnest, quit loop 
2011/12/23 initial version by yapcheahshen@gmail.com */
"uses strict";
(function() {
    function KsanaVm(dictsize) {
        var ip=0; // instruction pointer
        var abortexec=false;
        dictsize = dictsize || 0xfff;          // default 4095 cells 
        var dictionary = new Array(dictsize+1) ;
        dictionary[0]=0;dictionary[1]=1;dictionary[2]=2;dictionary[3]=0;
        var stack = [] , rstack =[];           // array allows push and pop
        var tib="", ntib=0 , here=4;
        var token="";
        var compiling=false;
        this.ticktype=0;   // 'type vector
        var newname,newxt; // for word under construction
        function reset() { stack=[]; rstack=[];}
        function cr() { systemtype("<"+stack.join(" ")+">ok\n"); }
        function systemtype(t) {if (ticktype) ticktype(t);}
        function nexttoken() {
            token="";
            while (tib.substr(ntib,1)==' ') ntib++;
            while (ntib<tib.length && tib.substr(ntib,1)!=' ') token+=tib.substr(ntib++,1);
            if (token==="") { throw("<"+stack.join(" ")+">ok");}
            return token;}
        function findword(name) {
            for (var i=words.length-1;i>0;i--) { if (words[i].name===name) return i;}
            return -1;}
        function dictcompile(n) {dictionary[here++]=n;} 
        function compilecode(nword) { 
            if ( typeof(nword) ==="string" ) {var n=findword(nword); }
            else n=nword;
            if (n>-1) dictcompile(n);
            else {reset(); throw(" "+nword+"?");}}
        function execute(n){words[n].xt();}
        function next(){var n=dictionary[ip++];execute(n);}
        function nest(addr){rstack.push(ip);ip=addr; next();}
        function unnest(){ip=rstack.pop(ip); next();}
        function docol(pf){rstack.push(ip);ip=pf; next();}
        function exectoken(cmd){               // outer loop
            var n=parseInt(cmd);                 // convert to number
            var nword=findword(cmd);
            if (nword>-1) { 
                var w=words[nword]; 
                if (compiling && !w.immediate) {dictcompile(nword);}
                else { w.xt(w.pf);}}             // docol, docon, dovar need pf
            else if (n) {                        // if the token is a number
                if (compiling) {    
                    compilecode("dolit");            // compile an literal
                    dictcompile(n); }
                else {stack.push(n);}}
            else {reset();throw(" "+cmd+"?");}} 
        function exec(cmd) {
            tib=cmd; ntib=0; ip=0; nest(0);}
        
        var words = [
            {name:"token",xt:function(){token=nexttoken();next();}}
            ,{name:"exec" ,xt:function(){exectoken(token);next();}}
            ,{name:"bran" ,xt:function(){ip=dictionary[ip];next();}}
            ,{name:"here" ,xt:function(){stack.push(here);next();}}
            ,{name:","    ,xt:function(){dictcompile(stack.pop());next();}}
            ,{name:"dolit",xt:function(){stack.push(dictionary[ip++]);next();}}
            ,{name:"ret"  ,xt:function(){unnest();}}
            ,{name:":"    ,xt:function(){newname=nexttoken();newxt=here; compiling=true;next();}}
            ,{name:";"    ,xt:function(){compiling=false;compilecode("ret");
                                         words.push({name:newname,xt:function(){docol(this.pf);},pf:newxt})},immediate:true}
            ,{name:"*"    ,xt:function(){stack.push(stack.pop()*stack.pop());next();}}
            ,{name:"."    ,xt:function(){systemtype(stack.pop()+" ");next();}}
            ,{name:"dup"  ,xt:function(){stack.push(stack[stack.length-1]);next();next();}}
        ]
        this.exec= exec;  // make exec become a public interface
    }
    window.KsanaVm=KsanaVm;  // export KsanaVm as a global variable
})();
