/// @defgroup Debug functions (can be implemented in front-end)
/// @{
const DUMP_WIDTH = 54                               ///< dump control
const CR = "\n"

export const words = (vm)=>{                        ///< word op
	let log = vm.log
    let sz  = 0
    vm.dict.forEach((w,i)=>{                        /// * loop thru all words
        log(w.name+' ')
        sz += w.name.length + 1
        if (sz > DUMP_WIDTH) { log(CR); sz = 0 }
    })
    log(CR)
}
export const dump = (vm, n0, n1)=>{                ///< memory dump op
	let log = vm.log
    for (let i = n0; i <= n1; i++) {
        let w = vm.dict[i]
        log('dict[' + i + ']=("' + w.name + '" ')
        if (w.xt) log(w.xt)
        else      log(', pf[' + w.pf.map(w1=>w1.name) + ']')
        if (w.qf) log(', qf[' + w.qf + ']')
        log((w.immd ? 'immd)' : ')') + log(CR))
    }
}
export const see = (vm, w, n=0)=>{                  ///< see op
    const _indent = (n)=>{
        for (let i=0; i < 2*n; i++) vm.log(' ')
    }
    const _show_pf = (pf)=>{
        if (pf == null || pf.length == 0) return
        vm.log("["+CR); _indent(n+1)                /// * indent section
        pf.forEach(w=>this.see(vm, w, n+1))         /// * recursive call
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
