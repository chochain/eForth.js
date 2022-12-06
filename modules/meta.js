import { Prim, Immd } from './core.js'
/// @defgroup Word Defining ops
/// @{
export const voc = (vm)=>{
    const pop    = ()=>{ return vm.ss.pop() }
    const docon  = c=>vm.ss.push(c.qf[0])                                  ///< constant op
    const dovar  = c=>vm.ss.push(c.token)                                  ///< variable op
    const vm_add = (compi=false)=>{
        let s = vm.tok();                                                  ///< fetch an input token
        if (s==null) { vm.compi=false; throw "more input" }
        vm.add(s)
        vm.compi = compi
    }
    const vm_var = (xt, v)=>{ vm_add(); vm.nvar(xt, v) }
    
    return [
        new Immd("exec",     "cm", c=>vm.dict[pop()].exec()),
        new Prim(":",        "cm", c=>vm_add(true)),                       // fetch an input token
        new Immd(";",        "cm", c=>vm.compi=false),                     // semicolon
        new Immd("variable", "cm", c=>vm_var(dovar, 0)),
        new Immd("constant", "cm", c=>vm_var(docon, pop())),
        new Prim("create",   "cm", c=>vm_add()),                           // create new word
        new Prim(",",        "cm", c=>{                                    // push TOS into qf
            let pf = vm.tail().pf
            if (pf.length) pf[0].qf.push(pop())                            // append more values
            else           vm_var(dovar, pop())                            // 1st value in qf
        }),
        new Prim("allot",    "cm", c=>{                                    // n --
            vm_var(dovar, 0)                                               // create qf array
            for (let n=pop(), i=1; i<n; i++) vm.tail().val[i]=0 }),        // fill all slot with 0
        new Prim("does",     "cm", c=>does(vm.dict)),
        new Prim("to",       "cm", c=>vm.tok2w().val[0]=pop()),            // update constant
        new Prim("is",       "cm", c=>{                                    // n -- alias a word
            vm_add()    
            vm.tail().pf = vm.dict[pop()].pf
        })
    ]
}
/// @}
