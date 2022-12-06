/// @defgroup Debug functions (can be implemented in front-end)
/// @{
const DUMP_WIDTH = 54                               ///< dump control
const CR = "\n"

export const words = (vm)=>{                        ///< word op
    let sz = 0
    vm.dict.forEach((w,i)=>{                        /// * loop thru all words
        vm.log(w.name+' ')
        sz += w.name.length + 1
        if (sz > DUMP_WIDTH) { vm.log(CR); sz = 0 }
    })
    vm.log(CR)
}
export const dump = (vm, n0, n1)=>{                ///< memory dump op
    for (let i = n0; i <= n1; i++) {
        let w = vm.dict[i]
        vm.log('dict[' + i + ']=("' + w.name + '" ')
        if (w.xt) vm.log(w.xt)
        else      vm.log(', pf[' + w.pf.map(w1=>w1.name) + ']')
        if (w.qf) vm.log(', qf[' + w.qf + ']')
        vm.log((w.immd ? 'immd)' : ')') + vm.log(CR))
    }
}
export const see = (vm, w, n=0)=>{                  ///< see op
    const _indent = (n)=>{
        for (let i=0; i < 2*(n+1); i++) vm.log(' ')
    }
    const _show_pf = (pf)=>{
        if (pf == null || pf.length == 0) return
        vm.log("["+CR); _indent()                   /// * indent section
        pf.forEach(w=>see(w, n+1))                  /// * recursive call
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
