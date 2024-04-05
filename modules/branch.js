/// @file
/// @brief eForth - Branching ops
///
import { INT, ZERO, Prim, Immd, Code } from './core.js'

export const voc = (vm)=>{
    /// @defgroup Macros
    /// @{
    const push = v=>vm.ss.push(v)                  ///< macros
    const pop  = ()=>vm.ss.pop()
    const rtop = (n=1)=>vm.rs.at(-INT(n))
    const merge= (dst, src)=>{ dst.push(...src); src.length = 0 }
    ///
    /// internal branching methods
    ///
    const run  = (pf)=>{ try { pf.forEach(w=>w.exec(vm)) } catch {} }
    const dec_i= ()=>(vm.rs[vm.rs.length -1] -= 1) ///< decrement I
    /// @}
    /// @defgroup Built-in (branching, looping) functions
    /// @{
    const tor  = c=>vm.rs.push(pop())              /// push into rs
    const bran = c=>{ run(ZERO(pop()) ? c.p1 : c.pf) }
    const cycle= c=>{
        while (true) {
            run(c.pf)                              /// * begin.{pf}.
            if (c.stage==0 && INT(pop())!=0) break /// * until
            if (c.stage==1) continue               /// * again
            if (c.stage==2 && ZERO(pop())) break   /// * while
            run(c.p1)                              /// * .{p1}.until
        }
    }
    const dofor= c=>{                              ///< loop method
        do { run(c.pf) } while (                   /// * for.{pf}.next only
            c.stage==0 && dec_i() >=0)
        while (c.stage>0) {                        /// * aft
            run(c.p2)                             /// * aft.{p2}.next
            if (dec_i() < 0) break
            run(c.p1)                             /// * then.{p1}.next
        }
        vm.rs.pop()                               /// * pop off I
    }
    
    return [
        /// @defgroup Branching - if.{pf}.then, if.{pf}.else.{p1}.then
        /// @{
        new Immd('if',   c=>{
            let w = new Code('_if', bran, false)  /// * encode branch opcode
            vm.compile(w); w.p1=[]; w.stage=0     /// * stage for branching
            vm.dict.push(new Code(' tmp'))        /// * as dict.at(-1)
        }),
        new Immd('else', c=>{
            let w=vm.last(), tmp=vm.tail()
            merge(w.pf, tmp.pf); w.stage=1
        }),
        new Immd('then', c=>{
            let w=vm.last(), tmp=vm.tail()
            if (w.stage==0) {
                merge(w.pf, tmp.pf)                 /// copy tmp.pf into branch
                vm.dict.pop()                       /// drop tmp
            }
            else {
                merge(w.p1, tmp.pf)                 /// else.{p1}.then, or then.{p1}.next
                if (w.stage==1) vm.dict.pop()       /// drop tmp
            }
        }),
        /// @}
        /// @defgroup Loop ops
        /// @brief begin.{pf}.again, begin.{pf}.until, begin.{pf}.while.{p1}.repeat
        /// @{
        new Immd('begin', c=>{
            let w = new Code('_begin', cycle, false)
            vm.compile(w); w.p1=[]; w.stage=0       /// * encode cycle function
            vm.dict.push(new Code(' tmp'))          /// * create a tmp holder
        }),
        new Immd('while', c=>{
            let w=vm.last(), tmp=vm.tail()
            merge(w.pf, tmp.pf); w.stage=2          /// * begin.{pf}.f.while
        }),
        new Immd('repeat',c=>{
            let w=vm.last(), tmp=vm.tail()
            merge(w.p1, tmp.pf); vm.dict.pop()      /// * while.{p1}.repeat
        }),
        new Immd('again', c=>{
            let w=vm.last(), tmp=vm.tail()
            merge(w.pf, tmp.pf); w.stage=1          /// * begin.{pf}.again
            vm.dict.pop()
        }),
        new Immd('until', c=>{
            let w=vm.last(), tmp=vm.tail()
            merge(w.pf, tmp.pf); vm.dict.pop()       /// * begin.{pf}.f.until
            vm.dict.pop()
        }),
        /// @}
        /// @defgroup Loop ops
        /// @brief for.{pf}.next, for.{pf}.aft.{p1}.then.{p2}.next
        /// @{
        new Immd('for',   c=>{
            vm.compile(new Code('>r', tor, false))   /// * push I onto rstack
            let w = new Code('_for', dofor, false)   /// encode _for opcode
            compile(w); w.p1=[]; w.stage=0
            vm.dict.push(new Code(' tmp'))           /// * create tmp holder
        }),
        new Immd('aft',   c=>{
            let w=vm.last(), tmp=vm.tail()
            merge(w.pf, tmp.pf); w.p2=[]; w.stage=3  /// * for.{pf}.aft
        }),
        new Immd('next',  c=>{
            let w=vm.last(), tmp=vm.tail()
            if (w.stage==0) merge(w.pf, tmp.pf)      /// * for.{pf}.next
            else            merge(w.p2, tmp.pf)      /// * .then.{p2}.next
            vm.dict.pop()
        }),
        /// @}
        /// @defgroup return stack ops
        /// @{
        new Prim('>r',    c=>vm.rs.push(pop())),   /// * push into rstack
        new Prim('r>',    c=>push(vm.rs.pop())),   /// * pop from rstack
        new Prim('r@',    c=>push(rtop())),        /// * fetch from rstack
        new Prim('i',     c=>push(rtop())),        /// * same as r@
        new Prim('exit',  c=>{ throw 'exit' }),    /// * exit inner interpreter
        /// @}
    ]
}
