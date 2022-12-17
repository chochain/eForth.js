/// @file
/// @brief eForth - Branching ops
///
import { INT, ZERO, Prim, Immd, Code } from './core.js'

export const voc = (vm)=>{
    const push = v=>vm.ss.push(v)                  ///< macros
    const pop  = ()=>{ return vm.ss.pop() }
    const rtop = (n=1)=>vm.rs[vm.rs.length - INT(n)]
    ///
    /// internal branching methods
    ///
    const run  = (pf)=>{ try { pf.forEach(w=>w.exec(vm)) } catch {} }
    const dec_i= ()=>{                             ///< decrement I
        return (vm.rs[vm.rs.length - 1] -= 1)
    } 
    const bran = c=>{                              ///< branch method
        run(ZERO(pop()) ? c.pf1 : c.pf)
    }
    const again = c=>{                             ///< begin cycle method
        while (true) {
            run(c.pf)                              /// * begin.{pf}.
            if (c.stage==0 && INT(pop())!=0) break /// * until
            if (c.stage==1) continue               /// * again
            if (c.stage==2 && ZERO(pop())) break   /// * while
            run(c.pf1)                             /// * .{pf1}.until
        }
    }
    const dofor= c=>{                              ///< loop method
        do { run(c.pf) } while (                   /// * for.{pf}.next only
            c.stage==0 && dec_i() >=0)
        while (c.stage>0) {                        /// * aft
            run(c.pf2)                             /// * aft.{pf2}.next
            if (dec_i() < 0) break
            run(c.pf1)                             /// * then.{pf1}.next
        }
        vm.rs.pop()                                /// * pop off I
    }
    
    return [
        /// @defgroup Branching - if.{pf}.then, if.{pf}.else.{pf1}.then
        /// @{
        new Immd('if',   c=>{
            vm.compile('bran', bran)               /// * encode branch methods
            vm.dict.push(new Code('tmp'))          /// * as dict.tail()
            let w = vm.last()
            w.pf1=[]; w.stage=0                    /// * stage for branching
        }),
        new Immd('else', c=>{
            let w=vm.last(), tmp=vm.tail()
            w.pf.push(...tmp.pf); w.stage=1
            tmp.pf.length = 0
        }),
        new Immd('then', c=>{
            let w=vm.last(), tmp=vm.tail()
            if (w.stage==0) {
                w.pf.push(...tmp.pf)               /// * copy tmp.pf into branch
                vm.dict.pop()                      /// * drop tmp
            }
            else {
                w.pf1.push(...tmp.pf)
                if (w.stage==1) vm.dict.pop()      /// * drop tmp
                else tmp.pf.length=0               /// * for...aft...then
            }
        }),
        /// @}
        /// @defgroup Loop ops
        /// @brief begin.{pf}.again, begin.{pf}.until, begin.{pf}.while.{pf1}.repeat
        /// @{
        new Immd('begin', c=>{
            vm.compile('again', again)             /// * encode cycle function
            vm.dict.push(new Code('tmp'))          /// * create a tmp holder
            let w = vm.last()
            w.pf1=[]; w.stage=0                    /// * create branching pf
        }),
        new Immd('while', c=>{
            let w=vm.last(), tmp=vm.tail()
            w.pf.push(...tmp.pf); w.stage=2        /// * begin.{pf}.f.while
            tmp.pf.length = 0
        }),
        new Immd('repeat',c=>{
            let w=vm.last(), tmp=vm.tail()
            w.pf1.push(...tmp.pf)                  /// * while.{pf1}.repeat
            vm.dict.pop()
        }),
        new Immd('again', c=>{
            let w=vm.last(), tmp=vm.tail()
            w.pf.push(...tmp.pf); w.stage=1        /// * begin.{pf}.again
            vm.dict.pop()
        }),
        new Immd('until', c=>{
            let w=vm.last(), tmp=vm.tail()
            w.pf.push(...tmp.pf)                   /// * begin.{pf}.f.until
            vm.dict.pop()
        }),
        /// @}
        /// @defgroup Loop ops
        /// @brief for.{pf}.next, for.{pf}.aft.{pf1}.then.{pf2}.next
        /// @{
        new Immd('for',   c=>{
            vm.compile('>r')                       /// * push I onto rstack
            vm.compile('dofor', dofor)             /// * encode loop function
            vm.dict.push(new Code('tmp'))          /// * create tmp holder
            let w=vm.last()
            w.stage=0; w.pf1=[]
        }),
        new Immd('aft',   c=>{
            let w=vm.last(), tmp=vm.tail()
            w.pf.push(...tmp.pf); w.stage=3; w.pf2=[]    /// * for.{pf}.aft
            tmp.pf.length=0
        }),
        new Immd('next',  c=>{
            let w=vm.last(), tmp=vm.tail()
            if (w.stage==0) w.pf.push(...tmp.pf)   /// * for.{pf}.next
            else            w.pf2.push(...tmp.pf)  /// * .then.{pf2}.next
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
