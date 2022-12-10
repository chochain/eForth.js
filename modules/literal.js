import { Prim, Immd } from './core.js'

export const voc = (vm)=>{
    const push = v=>vm.ss.push(v)                      ///< macro
    const lit  = (s, xt)=>{
        let t = vm.tok('"')
        if (t != null) {
            if (vm.compi) vm.compile(s, null, t)
            else xt(t)                                 /// * push string object
        }
        else {
            vm.log('one quote? ')
            vm.xtib()                                  /// * clear input buffer
        }
    }
    return [
        /// @defgroup Literal ops
        /// @{
        new Prim("dotstr","li", c=>vm.log(c.qf[0])),   /// * display string
        new Prim("dolit", "li", c=>push(c.qf[0])),     /// * integer literal or string
        new Immd(".\"",   "li", c=>lit("dotstr", vm.log)),
        new Immd("s\"",   "li", c=>lit("dolit", push)),
        new Immd("(",     "li", c=>vm.tok(')')),
        new Immd(".(",    "li", c=>vm.log(vm.tok(')'))),
        new Immd("\\",    "li", c=>vm.xtib()),
        /// @}
    ]
}
