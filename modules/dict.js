import { Prim, purge } from './core.js'
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
export const init = (vm)=>{          ///< dictionary constructor
    vm.extend(au.voc(vm))
    vm.extend(io.voc(vm))
    vm.extend(li.voc(vm))
    vm.extend(br.voc(vm))
    vm.extend(mm.voc(vm))
    vm.extend(me.voc(vm))
    vm.extend(db.voc(vm))
    vm.extend(os.voc(vm))
    vm.extend([
        new Prim("boot", "os", c=>{  /// * purge all user words (i.e. upto 'boot')
            let b = vm.find("boot")
            purge(vm.dict, b, b)
            vm.reset()
        })
	])
}
