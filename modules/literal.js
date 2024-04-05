/// @file
/// @brief eForth - Literal ops
///
import { Prim, Immd } from './core.js'

export const voc = (vm)=>{
    const push  = vm.push
    const dotstr= c=>log(c.q[0])                  /// display string
    const dostr = c=>{
        let s = dict[c.token >> 16].pf[c.token & 0xffff].q[0]
        push(s); push(s.length)
    }
    const lit   = (s, xt)=>{
        let t = vm.tok('"')
        if (t == null) {
            vm.log('one quote? ')
            vm.xtib()                                   /// * clear input buffer
        }
        else if (vm.compi) vm.compile(s, null, t)       /// compile literal
        else xt(t)                                      /// * call xt (log or push string object)
    }
    return [
        new Immd('."', c=>{
            let s = vm.tok('"')
            if (s==null) { log('one quote? '); return }
            if (vm.compi) vm.compile(new Code('." ', dotstr, s))
            else vm.log(s)
        }),
        new Immd('s"', c=>{
            let s = vm.tok('"')
            if (s==null) { log('one quote? '); return }
            if (_compi) {
                let w = new Code('s" ', dostr, s)     /// create string
                let n = dict.tail()                   /// current word
                w.token = (n.token<<16) | n.pf.length /// dict[n].pf[i]
                vm.compile(w)
            }
            else { push(s); push(s.length) }    /// push string object
        }),
        new Immd('(',  c=>vm.tok(')')),
        new Immd('.(', c=>vm.log(vm.tok(')'))),
        new Immd('\\', c=>vm.xtib()),
    ]
}
