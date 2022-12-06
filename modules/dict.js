import { Prim, Immd, Code, run, purge, does } from './core.js'
import * as au  from './alu.js'
import * as io  from './io.js'
import * as li  from './literal.js'
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
    const tok2w  = ()=>{                               ///< convert token to word
        let s=io.nxtok(), w=vm.find(s)
        if (w==null) throw NA(s);
        return w
    }
    /// @}
    /// @}
    vm.extend(au.voc(vm))
    vm.extend(io.voc(vm))
    vm.extend(li.voc(vm))
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
