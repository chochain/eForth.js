/// @file
/// @brief eForth - Literal ops
///
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
        new Prim('_dotstr',c=>vm.log(c.qf[0])),         /// * display string
        new Prim('_dolit', c=>push(c.qf[0])),           /// * integer literal or string
        new Immd('."',     c=>lit('_dotstr', vm.log)),
//        new Immd('s"',   c=>lit('_dolit', push)),     /// * deprecated
        new Immd('"',      c=>lit('_dolit', push)),
        new Immd('(',      c=>vm.tok(')')),
        new Immd('.(',     c=>vm.log(vm.tok(')'))),
        new Immd('\\',     c=>vm.xtib()),
    ]
}
