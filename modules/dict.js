import { Prim, Immd, Code, run, purge, does } from './core.js'
import * as au  from './alu.js'
import * as io  from './io.js'
import * as mm  from './mem.js'
import * as me  from './meta.js'
import * as br  from './branch.js'
import * as db  from './debug.js'
import * as os  from './os.js'
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
        if (s==null) { this.compi=false; throw "more input" }
        vm.add(s)
        vm.compi = compi
    }
    let vm_nvar = (xt, v)=>{ vm_add(); vm.nvar(xt, v) }
    /// @}
    vm.extend(au.voc(vm))
    vm.extend(io.voc(vm))
    vm.extend([
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
            else push(s)                               /// * push string object
        }),
        new Immd(".\"",   "li", c=>vm.compile("dolit", io.nxtok('"'))),
        new Immd("(",     "li", c=>io.nxtok(')')),
        new Immd(".(",    "li", c=>vm.log(io.nxtok(')'))),
        new Immd("\\",    "li", c=>io.clear()),
        /// @}
    ])
    vm.extend(br.voc(vm))
    vm.extend(mm.voc(vm))
    vm.extend(me.voc(vm))
    vm.extend(db.voc(vm))
    vm.extend(os.voc(vm))
    vm.extend([
        new Prim("boot",     "os", c=>{
            let b = vm.find("boot")                    /// * purge everything upto 'boot'
            purge(vm.dict, b, b)
            vm.reset()
        })
	])
}
