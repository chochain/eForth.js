import { Prim, purge } from './core.js'
/// @defgroup Debug functions (can be implemented in front-end)
/// @{
const DUMP_WIDTH = 54                               ///< dump control
const CR = "\n"

const _words = (vm)=>{                              ///< word op
	let log = vm.log
    let sz  = 0
    vm.dict.forEach((w,i)=>{                        /// * loop thru all words
        log(w.name+' ')
        sz += w.name.length + 1
        if (sz > DUMP_WIDTH) { log(CR); sz = 0 }
    })
    log(CR)
}
const _dump = (vm, n0, n1)=>{                       ///< memory dump op
	let log = vm.log
    for (let i = n0; i <= n1; i++) {
        let w = vm.dict[i]
        log('['+i+(w.immd ? ']*=' : ']="') + w.name + '", ')
        if (w.xt) log(w.xt)
        else      log('pf='+JSON.stringify(w.pf))   /// * user defined word
        log(CR)
    }
}
const _see = (vm, w, n=0)=>{                        ///< see op
    const _indent = (n)=>{
        for (let i=0; i < 2*n; i++) vm.log(' ')
    }
    const _show_pf = (pf)=>{
        if (pf == null || pf.length == 0) return
        vm.log("["+CR); _indent(n+1)                /// * indent section
        pf.forEach(w1=>_see(vm, w1, n+1))           /// * recursive call
        vm.log('] ')                                /// * close section
    }
    vm.log(w.name+' ')                              /// * display word name
    if (w.qf != null && w.qf.length > 0) {          /// * display qf array
        vm.log('='+JSON.stringify(w.qf)+' ')
    }
    _show_pf(w.pf)                                  /// * if.{pf}, for.{pf}, or begin.{pf}
    _show_pf(w.pf1)                                 /// * else.{pf1}.then, or .then.{pf1}.next
    _show_pf(w.pf2)                                 /// * aft.{pf2}.next
}
export const voc = (vm) => {
    const push = (v)=> vm.ss.push(v)
    const pop  = ()=>{ return vm.ss.pop() }
    return [
        /// @}
        /// @defgroup Debugging ops
        /// @{
        new Prim("here",     "db", c=>push(vm.tail().token)),
        new Prim(".s",       "db", c=>vm.log(JSON.stringify(vm.ss)+CR)),
        new Prim("words",    "db", c=>_words(vm)),
        new Prim("dump",     "db", c=>{ let n1=pop(); _dump(vm, pop(), n1) }),
        new Prim("see",      "db", c=>{ let w=vm.tok2w(); console.log(w); _see(vm, w) }),
        new Prim("forget",   "db", c=>purge(vm.dict, vm.tok2w(), vm.find("boot"))),
        /// @}
    ]
}
