/// @file
/// @brief eForth - Literal ops
///
import { Prim, Immd, Code } from './core.js'

export const voc = (vm)=>{
    const push  = v=>vm.ss.push(v)
    const dotstr= c=>vm.log(c.q[0])               /// display string
    const dostr = c=>{
        let s = dict[c.token >> 16].pf[c.token & 0xffff].q[0]
        push(s); push(s.length)
    }
    const lit   = (s, xt)=>{
        let t = vm.word('"')
        if (t == null) {
            vm.log('one quote? ')
            vm.xtib()                             /// * clear input buffer
        }
        else if (vm.compi) {
            vm.compile(new Code(s, xt, t))        /// compile literal
        }
        else xt(t)                                /// * call xt (log or push string object)
    }
    return [
        new Immd('."', c=>{
            let s = vm.word('"')
            if (s==null) { log('one quote? '); return }
            if (vm.compi) {
                vm.compile(new Code('." ', dotstr, s))
            }
            else vm.log(s)
        }),
        new Immd('s"', c=>{
            let s = vm.word('"')
            if (s==null) { log('one quote? '); return }
            if (vm.compi) {
                let w = new Code('s" ', dostr, s)     /// create string
                let n = vm.tail()                     /// current word
                w.token = (n.token<<16) | n.pf.length /// dict[n].pf[i]
                vm.compile(w)
            }
            else { push(s); push(s.length) }    /// push string object
        }),
        new Immd('(',  c=>vm.word(')')),
        new Immd('.(', c=>vm.log(vm.word(')'))),
        new Immd('\\', c=>vm.xtib()),
    ]
}
