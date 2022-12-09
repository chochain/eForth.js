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
        new Prim("dolit", "li", c=>vm.log(c.qf[0])),    /// * integer literal or string
        new Prim("dostr", "li", c=>push(c.qf[0])),      /// * string literal token
        new Immd(".\"",   "li", c=>lit("dolit", vm.log)),
        new Immd("s\"",   "li", c=>lit("dostr", push)),
        new Immd("(",     "li", c=>vm.tok(')')),
        new Immd(".(",    "li", c=>vm.log(vm.tok(')'))),
        new Immd("\\",    "li", c=>vm.xtib()),
        /// @}
    ]
}
