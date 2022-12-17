/// @file
/// @brief eForth - Debug functions (can be implemented in front-end)
///
import { Prim, purge } from './core.js'

const DUMP_WIDTH = 54                              ///< dump control
const CR = '\n'

export const voc = (vm) => {
    const log   = vm.log
    const push  = (v)=> vm.ss.push(v)
    const pop   = ()=>{ return vm.ss.pop() }
    const words = ()=>{                            ///< word op
        let sz  = 0
        vm.dict.forEach((w,i)=>{                   /// * loop thru all words
            log(w.name+' ')
            sz += w.name.length + 1
            if (sz > DUMP_WIDTH) { log(CR); sz = 0 }
        })
        log(CR)
    }
    const dump = (n0, sz)=>{                       ///< memory dump op
        for (let i = n0; i <= n0+sz; i++) {
            let w = vm.dict[i]
            log('['+i+(w.immd ? ']*=' : ']="') + w.name + '", ')
            if (w.xt) log(w.xt)
            else      log('pf='+JSON.stringify(w.pf))   /// * user defined word
            log(CR)
        }
    }
    const see = (w, n=0)=>{                        ///< see op
        const _indent = (n)=>{
            for (let i=0; i < 2*n; i++) log(' ')
        }
        const _show_pf = (pf)=>{
            if (pf == null || pf.length == 0) return
            log("["+CR); _indent(n+1)              /// * indent section
            pf.forEach(w1=>see(w1, n+1))           /// * recursive call
            log('] ')                              /// * close section
        }
        log(w.name+' ')                            /// * display word name
        if (w.qf != null && w.qf.length > 0) {     /// * display qf array
            log('='+JSON.stringify(w.qf)+' ')
        }
        _show_pf(w.pf)                             /// * if.{pf}, for.{pf}, or begin.{pf}
        _show_pf(w.pf1)                            /// * else.{pf1}.then, or .then.{pf1}.next
        _show_pf(w.pf2)                            /// * aft.{pf2}.next
    }
    return [
        new Prim('here',   c=>push(vm.tail().token)),
        new Prim('.s',     c=>vm.log(JSON.stringify(vm.ss)+CR)),
        new Prim('words',  c=>words()),
        new Prim('dump',   c=>{ let n=pop(); dump(pop(), n) }),
        new Prim('see',    c=>{ let w=vm.tok2w(); console.log(w); see(w) }),
        new Prim('forget', c=>purge(vm.dict, vm.tok2w(), vm.find('boot'))),
    ]
}
