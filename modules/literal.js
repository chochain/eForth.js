/// @file
/// @brief eForth - Literal ops
///
import { Prim, Immd } from './core.js'

export const voc = (vm)=>{
    const dostr = v=>vm.ss.push(v)                      ///< macro
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
        new Prim('_dotstr',c=>vm.log(c.qf[0])),         /// * display string
        new Prim('_dolit', c=>push(c.qf[0])),           /// * integer literal or string
        new Immd('."',     c=>lit('_dotstr', vm.log)),
        new Immd('s"',     c=>lit('_dolit', dostr)),    /// * push string as TOS
        new Immd('"',      c=>lit('_dolit', dostr)),    /// * non-Forth standard
        new Immd('(',      c=>vm.tok(')')),
        new Immd('.(',     c=>vm.log(vm.tok(')'))),
        new Immd('\\',     c=>vm.xtib()),
    ]
}
