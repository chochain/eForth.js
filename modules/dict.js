import { Prim, Immd, Code, run, purge, does } from './core.js'
import * as io    from './io.js'
import * as mm    from './mem.js'
import * as br    from './branch.js'
import * as debug from './debug.js'
import * as os    from './os.js'
///======================================================================
/// dictionary intialized with primitive words
///
export const init = (vm)=>{                              ///< dictionary constructor
    /// @defgroup Stack op short-hand functions (macros)
    /// @{
    const top    = (n=1)=>vm.ss[vm.ss.length - INT(n)]
    const push   = v    =>vm.ss.push(v)
    const pop    = ()   =>vm.ss.pop()
    const remove = n    =>{
        let v=top(n)
        vm.ss.splice(vm.ss.length - n, 1)
        return v
    }
    const rtop   = (n=1)=>vm.rs[vm.rs.length - INT(n)]
    const tok2w  = ()=>{                                 ///< convert token to word
        let s=io.nxtok(), w=vm.find(s)
        if (w==null) throw NA(s);
        return w
    }
    /// @}
    const _docon = c=>push(c.qf[0])                      ///< constant op
    const _dovar = c=>push(c.token)                      ///< variable op
    /// @}
    /// @defgroup Dictionary access methods
    /// @{
    let vm_add = (compi=false)=>{
        let s = io.nxtok();                              ///< fetch an input token
        vm.add(s)
        vm.compi = compi
    }
    let vm_nvar = (xt, v)=>{ vm_add(); vm.nvar(xt, v) }
    let vm_tail = (i=1)  =>{ return vm.dict[vm.dict.length - i] } ///< last entry
    let vm_last = ()     =>{ return vm_tail(2).pf.tail() }        ///< pf of last word created
    /// @}
    [
        /// @defgroup Stack ops
        /// @{
        new Prim("dup",   "ss", c=>push(top())),
        new Prim("drop",  "ss", c=>pop()),
        new Prim("over",  "ss", c=>push(top(2))),
        new Prim("swap",  "ss", c=>push(remove(2))),
        new Prim("rot",   "ss", c=>push(remove(3))),
        new Prim("-rot",  "ss", c=>vm.ss.splice(-2, 0, pop())),
        new Prim("pick",  "ss", c=>{ let i=pop(), n=top(i+1); push(n) }),
        new Prim("roll",  "ss", c=>{ let i=pop(), n=remove(i+1); push(n) }),
        new Prim("nip",   "ss", c=>remove(2)),
        new Prim("2dup",  "ss", c=>{ push(top(2)); push(top(2)) }),
        new Prim("2drop", "ss", c=>vm.ss.splice(-2)),
        new Prim("2over", "ss", c=>{ push(top(4)); push(top(4)) }),
        new Prim("2swap", "ss", c=>{ push(remove(4)); push(remove(4)) }),
        /// @}
        /// @defgroup Arithmetic ops
        /// @{
        new Prim("+",     "au", c=>{ let n=pop(); push(pop() + n) }),
        new Prim("-",     "au", c=>{ let n=pop(); push(pop() - n) }),
        new Prim("*",     "au", c=>{ let n=pop(); push(pop() * n) }),
        new Prim("/",     "au", c=>{ let n=pop(); push(pop() / n) }),
        new Prim("mod",   "au", c=>{ let n=pop(); push(pop() % n) }),          // * note: 4.5 3 mod => 1.5
        new Prim("*/",    "au", c=>{ let n=pop(); push(pop() * pop() / n) }),
        new Prim("*/mod", "au", c=>{
            let n=pop(), m=pop() * pop();
            push(m % n); push(INT(m / n))
        }),
        /// @}
        /// @defgroup Bit-wise ops (auto convert to 32-bit by Javascript)
        /// @{
        new Prim("int",   "au", c=>push(INT(pop()))),                          // * convert float to integer
        new Prim("and",   "au", c=>push(pop() & pop())),
        new Prim("or",    "au", c=>push(pop() | pop())),
        new Prim("xor",   "au", c=>push(pop() ^ pop())),
        new Prim("negate","au", c=>push(-pop())),
        new Prim("abs",   "au", c=>push(Math.abs(pop()))),
        /// @}
        /// @defgroup Logic ops
        /// @{
        new Prim("0=",    "eq", c=>push(ZERO(pop()))),
        new Prim("0<",    "eq", c=>push(BOOL(pop() < -EPS))),
        new Prim("0>",    "eq", c=>push(BOOL(pop() >  EPS))),
        new Prim("=",     "eq", c=>{ let n=pop(); push(ZERO(pop() - n)) }),
        new Prim("<",     "eq", c=>{ let n=pop(); push(BOOL((pop() - n) < -EPS)) }),
        new Prim(">",     "eq", c=>{ let n=pop(); push(BOOL((pop() - n) >  EPS)) }),
        new Prim("<>",    "eq", c=>{ let n=pop(); push(BOOL(ZERO(pop() - n)==0)) }),
        /// @}
        /// @defgroup IO ops
        /// @{
        new Prim("ucase!","io", c=>_ucase=BOOL(ZERO(pop()))),
        new Prim("base@", "io", c=>push(io.get_base())),
        new Prim("base!", "io", c=>io.set_base(pop())),
        new Prim("hex",   "io", c=>io.set_base(16)),
        new Prim("decimal","io",c=>io.set_base(10)),
        new Prim("cr",    "io", c=>io.cr()),
        new Prim(".",     "io", c=>io.dot(pop())),
        new Prim(".r",    "io", c=>{ let n=pop(); io.dot_r(n, pop()) }),
        new Prim("u.r",   "io", c=>{ let n=pop(); io.dot_r(n, pop()&0x7fffffff) }),
        new Prim("key",   "io", c=>push(io.key())),
        new Prim("emit",  "io", c=>io.emit(pop())),
        new Prim("space", "io", c=>io.spaces(1)),
        new Prim("spaces","io", c=>io.spaces(pop())),
        /// @}
        /// @defgroup Literal ops
        /// @{
        new Prim("dolit", "li", c=>push(c.qf[0])),     /// * integer literal or string
        new Prim("dostr", "li", c=>push(c.token)),     /// * string literal token
        new Immd("[",     "li", c=>vm.compi=false ),
        new Prim("]",     "li", c=>vm.compi=true ),
        new Prim("'",     "li", c=>{ let w=tok2w(); push(w.token) }),
        new Immd("s\"",   "li", c=>{
            let s = io.nxtok('"')
            if (vm.compi) vm.compile("dostr", s)
            else        push(s)                        /// * push string object
        }),
        new Immd(".\"",   "li", c=>vm.compile("dolit", io.nxtok('"'))),
        new Immd("(",     "li", c=>io.nxtok(')')),
        new Immd(".(",    "li", c=>io.log(io.nxtok(')'))),
        new Immd("\\",    "li", c=>io.clear()),
        /// @}
        /// @defgroup Branching - if.{pf}.then, if.{pf}.else.{pf1}.then
        /// @{
        new Immd("if",    "br", c=>br._if(vm)),
        new Immd("else",  "br", c=>br._else(vm.dict)),
        new Immd("then",  "br", c=>br._then(vm.dict)),
        /// @}
        /// @defgroup Loop ops
        /// @brief begin.{pf}.again, begin.{pf}.until, begin.{pf}.while.{pf1}.repeat
        /// @{
        new Immd("begin", "br", c=>br._begin(vm)),
        new Immd("while", "br", c=>br._while(dict)),
        new Immd("repeat","br", c=>br._repeat(dict)),
        new Immd("again", "br", c=>br._again(dict)),
        new Immd("until", "br", c=>br._until(dict)),
        /// @}
        /// @defgroup Loop ops
        /// @brief for.{pf}.next, for.{pf}.aft.{pf1}.then.{pf2}.next
        /// @{
        new Immd("for",   "br", c=>br._for(vm)),
        new Immd("aft",   "br", c=>br._aft(dict)),
        new Immd("next",  "br", c=>br._next(dict)),
        new Prim(">r",    "br", c=>vm.rs.push(pop())),   /// * push into rstack
        new Prim("r>",    "br", c=>push(vm.rs.pop())),   /// * pop from rstack
        new Prim("r@",    "br", c=>push(rtop())),        /// * fetch from rstack
        new Prim("i",     "br", c=>push(rtop())),        /// * same as r@
        new Prim("exit",  "br", c=>{ throw 'exit' }),    /// * exit inner interpreter
        /// @}
        /// @defgroup Memory Access ops
        /// @{
        new Prim("?",     "mm", c=>io.log(mm.at(dict[pop()]))),
        new Prim("@",     "mm", c=>push(mm.at(dict[pop()]))),                              // w -- n
        new Prim("!",     "mm", c=>{ let w=pop(); mm.store(dict[w], pop()) }),             // n w  --
        new Prim("+!",    "mm", c=>{ let w=pop(); mm.storeplus(dict[w], pop()) }),         // n w --
        new Prim("allot", "mm", c=>{                                                       // n --
            vm.nvar(_dovar, 0)                                                             // create qf array
            for (let n=pop(), i=1; i<n; i++) mm.arr_store(vm_tail(), i, 0)
        }),
        new Prim("n?",    "mm", c=>{ let i=pop(); io.log(mm.arr_at(dict[pop()], i)) }),                 // w i --
        new Prim("n@",    "mm", c=>{ let i=pop(); let w = pop(); push(mm.arr_at(dict[w], i)) }),        // w i -- n
        new Prim("n!",    "mm", c=>{ let i=pop(); let w = pop(); mm.arr_store(dict[w], i, pop()) }),    // n w i --
        /// @}
        /// @defgroup Word Defining ops
        /// @{
        new Immd("exec",     "cm", c=>vm.dict[pop()].exec()),
        new Prim(":",        "cm", c=>vm_add(true)),                       ///< fetch an input token
        new Immd(";",        "cm", c=>vm.compi=false),                     // semicolon
        new Immd("variable", "cm", c=>vm_nvar(_dovar, 0)),
        new Immd("constant", "cm", c=>vm_nvar(_docon, pop())),
        new Prim("create",   "cm", c=>vm_add()),                           // create new word
        new Prim(",",        "cm", c=>{                                    // push TOS into qf
            let pf = vm_tail().pf
            if (pf.length) pf[0].qf.push(pop())                            // append more values
            else           vm.nvar(_dovar, pop())                          // 1st value in qf
        }),
        new Prim("allot",    "cm", c=>{                                    // n --
            nvar(_dovar, 0)                                                // create qf array
            for (let n=pop(), i=1; i<n; i++) vm_tail().val[i]=0 }),        // fill all slot with 0
        new Prim("does",     "cm", c=>does(vm.dict)),
        new Prim("to",       "cm", c=>tok2w().val[0]=pop()),               // update constant
        new Prim("is",       "cm", c=>{                                    // n -- alias a word
            vm_add()    
            vm_tail().pf = vm.dict[pop()].pf
        }),
        /// @}
        /// @defgroup Debugging ops
        /// @{
        new Prim("here",     "db", c=>push(vm_tail().token)),
        new Prim(".s",       "db", c=>io.dot(vm.ss)),
        new Prim("words",    "db", c=>debug.words(vm)),
        new Prim("dump",     "db", c=>{ let n=pop(); debug.dump(vm, pop(), n) }),
        new Prim("see",      "db", c=>{ let w=tok2w(); console.log(w); debug.see(vm, w) }),
        new Prim("forget",   "db", c=>purge(vm.dict, tok2w(), find("boot"))),
        /// @}
        /// @defgroup System ops
        /// @{
        new Prim("clock",    "os", c=>push(os.clock())),
        new Prim("delay",    "os", c=>os.sleep(pop())),
        new Prim("date",     "os", c=>io.log(os.date()+" ")),
        new Prim("time",     "os", c=>io.log(os.time()+" ")),
        new Prim("eval",     "os", c=>os.js_eval(pop())),           /// * dangerous, be careful!
        /// @}
        new Prim("boot",     "os", c=>{
            let b = vm.find("boot")                                 /// * purge everything upto 'boot'
            purge(dict, b, b)
            vm.reset()
        })].forEach(c=>vm.dict.push(c))
}
