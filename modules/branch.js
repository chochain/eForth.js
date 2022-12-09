import { INT, Prim, Immd, Code, run } from './core.js'

export const voc = (vm)=>{
    const push = v=>vm.ss.push(v)                        ///< macros
    const pop  = ()=>{ return vm.ss.pop() }
    const rtop = (n=1)=>vm.rs[vm.rs.length - INT(n)]
    
    return [
        /// @defgroup Branching - if.{pf}.then, if.{pf}.else.{pf1}.then
        /// @{
        new Immd("if",    "br", c=>{
            vm.compile("_bran", c1=>vm.bran(c1))         /// * encode branch opcode
            vm.dict.push(new Code("tmp"))                /// * as dict.tail()
            let w = vm.last()
            w.pf1=[]; w.stage=0                          /// * stage for branching
        }),
        new Immd("else",  "br", c=>{
            let w=vm.last(), tmp=vm.tail()
            w.pf.push(...tmp.pf); w.stage=1
            tmp.pf.length = 0
        }),
        new Immd("then",  "br", c=>{
            let w=vm.last(), tmp=vm.tail()
            if (w.stage==0) {
                w.pf.push(...tmp.pf)                     /// * copy tmp.pf into branch
                vm.dict.pop()                            /// * drop tmp
            }
            else {
                w.pf1.push(...tmp.pf)
                if (w.stage==1) vm.dict.pop()            /// * drop tmp
                else tmp.pf.length=0                     /// * for...aft...then
            }
        }),
        /// @}
        /// @defgroup Loop ops
        /// @brief begin.{pf}.again, begin.{pf}.until, begin.{pf}.while.{pf1}.repeat
        /// @{
        new Immd("begin", "br", c=>{
            vm.compile("cycle", c1=>vm.cycle(c1))        /// * encode _loop opcode
            vm.dict.push(new Code("tmp"))                /// * create a tmp holder
            let w = vm.last()
            w.pf1=[]; w.stage=0                          /// * create branching pf
        }),
        new Immd("while", "br", c=>{
            let w=vm.last(), tmp=vm.tail()
            w.pf.push(...tmp.pf); w.stage=2              /// * begin.{pf}.f.while
            tmp.pf.length = 0
        }),
        new Immd("repeat","br", c=>{
            let w=vm.last(), tmp=vm.tail()
            w.pf1.push(...tmp.pf)                        /// * while.{pf1}.repeat
            vm.dict.pop()
        }),
        new Immd("again", "br", c=>{
            let w=vm.last(), tmp=vm.tail()
            w.pf.push(...tmp.pf); w.stage=1              /// * begin.{pf}.again
            vm.dict.pop()
        }),
        new Immd("until", "br", c=>{
            let w=vm.last(), tmp=vm.tail()
            w.pf.push(...tmp.pf)                         /// * begin.{pf}.f.until
            vm.dict.pop()
        }),
        /// @}
        /// @defgroup Loop ops
        /// @brief for.{pf}.next, for.{pf}.aft.{pf1}.then.{pf2}.next
        /// @{
        new Immd("for",   "br", c=>{
            vm.compile(">r")                             /// * push I onto rstack
            vm.compile("loop", c1=>vm.loop(c1))          /// * encode _for opcode
            vm.dict.push(new Code("tmp"))                /// * create tmp holder
            let w=vm.last()
            w.stage=0; w.pf1=[]
        }),
        new Immd("aft",   "br", c=>{
            let w=vm.last(), tmp=vm.tail()
            w.pf.push(...tmp.pf); w.stage=3; w.pf2=[]    /// * for.{pf}.aft
            tmp.pf.length=0
        }),
        new Immd("next",  "br", c=>{
            let w=vm.last(), tmp=vm.tail()
            if (w.stage==0) w.pf.push(...tmp.pf)         /// * for.{pf}.next
            else            w.pf2.push(...tmp.pf)        /// * .then.{pf2}.next
            vm.dict.pop()
        }),
        /// @}
        /// @defgroup return stack ops
        /// @{
        new Prim(">r",    "br", c=>vm.rs.push(pop())),   /// * push into rstack
        new Prim("r>",    "br", c=>push(vm.rs.pop())),   /// * pop from rstack
        new Prim("r@",    "br", c=>push(rtop())),        /// * fetch from rstack
        new Prim("i",     "br", c=>push(rtop())),        /// * same as r@
        new Prim("exit",  "br", c=>{ throw 'exit' }),    /// * exit inner interpreter
        /// @}
    ]
}
