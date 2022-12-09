import { Prim, Immd } from './core.js'

export const voc = (vm)=>{
    const push = v=>vm.ss.push(v)                      ///< macro
    return [
        /// @defgroup Literal ops
        /// @{
        new Prim("dolit", "li", c=>push(c.qf[0])),     /// * integer literal or string
        new Prim("dostr", "li", c=>push(c.token)),     /// * string literal token
        new Immd("[",     "li", c=>vm.compi=false ),
        new Prim("]",     "li", c=>vm.compi=true ),
        new Prim("'",     "li", c=>{
            let w = vm.tok2w()
            if (w!=null) push(w.token)
        }),
        new Immd("s\"",   "li", c=>{
            let s = vm.tok('"')
            if (vm.compi) vm.compile("dostr", s)
            else push(s)                               /// * push string object
        }),
        new Immd(".\"",   "li", c=>vm.compile("dolit", vm.tok('"'))),
        new Immd("(",     "li", c=>vm.tok(')')),
        new Immd(".(",    "li", c=>vm.log(vm.tok(')'))),
        new Immd("\\",    "li", c=>io.clear()),
        /// @}
    ]
}
