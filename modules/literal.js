import { Prim, Immd } from './core.js'

export const voc => (vm)=>{
    const push = v=>vm.ss.push()
    return [
        /// @defgroup Literal ops
        /// @{
        new Prim("dolit", "li", c=>push(c.qf[0])),     /// * integer literal or string
        new Prim("dostr", "li", c=>push(c.token)),     /// * string literal token
        new Immd("[",     "li", c=>vm.compi=false ),
        new Prim("]",     "li", c=>vm.compi=true ),
        new Prim("'",     "li", c=>{ let w=tok2w(); push(w.token) }),
        new Immd("s\"",   "li", c=>{
            let s = vm.nxtok('"')
            if (vm.compi) vm.compile("dostr", s)
            else push(s)                               /// * push string object
        }),
        new Immd(".\"",   "li", c=>vm.compile("dolit", vm.nxtok('"'))),
        new Immd("(",     "li", c=>vm.nxtok(')')),
        new Immd(".(",    "li", c=>vm.log(io.nxtok(')'))),
        new Immd("\\",    "li", c=>io.clear()),
        /// @}
    ]
}
