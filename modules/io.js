/// @file
/// @brief eForth - IO functions
///
import { BOOL, ZERO, Prim } from './core.js'
const SPC  = ' ', CR='\n'                                   ///< string constants

let _out   = console.log
let _tib   = '', _ntib = 0                                  ///< input buffer

export const init    = (output=console.log)=>_out=output    ///< initialize output port
export const set_tib = (r)=>{ _tib=r + SPC; _ntib=0 }       ///< capture into TIB
export const clear   = () =>_ntib=_tib.length               ///< clear input buffer
export const nxtok   = (d=SPC)=>{                           ///< fetch next idiom/token
    while (d==SPC &&                                        /// * assumes tib ends with a blank
           (_tib[_ntib]==SPC || _tib[_ntib]=='\t')) _ntib++ /// * skip leading blanks and tabs
    let i = _tib.indexOf(d, _ntib)
    let s = (i==-1) ? null : _tib.substring(_ntib, i)
    _ntib = i+1                                             /// * advance or reset _ntib
    return s
}
export const log = (s)=>_out(s)                             ///< output port
export const voc = (vm)=>{                                  ///< vocabulary
    const push  = v=>vm.ss.push(v)
    const pop   = ()=>{ return vm.ss.pop() }
    const dot_r = (n, v)=>{
        let s = v.toString(vm.base)
        for(let i=0; i+s.length < n; i++) log(SPC)
        log(s)
    }
    return [
        new Prim('ucase!', c=>vm.ucase=BOOL(ZERO(pop()))),
        new Prim('base@',  c=>push(vm.base)),
        new Prim('base!',  c=>vm.base = pop() | 0),
        new Prim('hex',    c=>vm.base = 16),
        new Prim('decimal',c=>vm.base = 10),
        new Prim('cr',     c=>log(CR)),
        new Prim('.',      c=>{
            let n = pop(), a = typeof(n)!='object' ? [ n ] : n
            log(a.map(v=>v.toString(vm.base)).join(SPC)+SPC)
        }),
        new Prim('.r',     c=>{ let n=pop(); dot_r(n, pop()) }),
        new Prim('u.r',    c=>{ let n=pop(); dot_r(n, pop()&0x7fffffff) }),
        new Prim('key',    c=>push(nxtok()[0])),
        new Prim('emit',   c=>log(String.fromCharCode(pop()))),
        new Prim('space',  c=>log(SPC)),
        new Prim('spaces', c=>{ for (let n=pop(), i=0; i<n; i++) log(SPC) }),
    ]
}
