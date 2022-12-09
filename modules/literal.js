import { Prim, Immd } from './core.js'

export const voc = (vm)=>{
    const push = v=>vm.ss.push(v)                      ///< macro
    return [
        /// @defgroup Literal ops
        /// @{
        new Prim("dolit", "li", c=>push(c.qf[0])),     /// * integer literal or string
        new Prim("dostr", "li", c=>push(c.token)),     /// * string literal token
        new Immd("s\"",   "li", c=>{
            let s = vm.tok('"')
            if (s != null) {
                if (vm.compi) vm.compile("dostr", null, s)
                else push(s)                           /// * push string object
            }
            else {
                vm.log('one quote? ')
                vm.xtib()                             /// * clear input buffer
            }
        }),
        new Immd(".\"",   "li", c=>vm.compile("dolit", null, vm.tok('"'))),
        new Immd("(",     "li", c=>vm.tok(')')),
        new Immd(".(",    "li", c=>vm.log(vm.tok(')'))),
        new Immd("\\",    "li", c=>vm.xtib()),
        /// @}
    ]
}
