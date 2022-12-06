import { BOOL, ZERO, Prim } from './core.js'
///=====================================================================
/// @defgroup IO functions
/// @{
const SPC  = ' ', CR="\n"                                   ///< string constants

let _out   = console.log
let _tib   = "", _ntib = 0                                  ///< input buffer

export const set_tib  = (r)=>{ _tib=r + SPC; _ntib=0 }      ///< capture into TIB
export const clear    = () =>_ntib=_tib.length              ///< clear input buffer
export const nxtok    = (d=SPC)=>{                          ///< assumes tib ends with a blank
    while (d==SPC &&
           (_tib[_ntib]==SPC || _tib[_ntib]=="\t")) _ntib++ /// * skip leading blanks and tabs
    let i = _tib.indexOf(d, _ntib)
    let s = (i==-1) ? null : _tib.substring(_ntib, i); _ntib=i+1
    return s
}
export const init = (output=console.log)=>_out=output
export const log  = (s)=>_out(s)                            ///< output port

export const voc  = (vm)=>{
    const push   = v=>vm.ss.push(v)
    const pop    = ()=>{ return vm.ss.pop() }
    const key    = () =>{ return nxtok()[0] }
    const emit   = (c)=>log(String.fromCharCode(c))
    const spaces = (n)=>{ for (let i=0; i<n; i++) log(SPC) }
    const dot    = (n)=>{
        let a = typeof(n)!='object' ? [ n ] : n
        log(a.map(v=>v.toString(vm.base)).join(SPC)+SPC)
    }
    const dot_r= (n, v)=>{
        let s = v.toString(vm.base)
        for(let i=0; i+s.length < n; i++) log(SPC)
        log(s)
    }
    return [
        /// @defgroup IO ops
        /// @{
        new Prim("ucase!","io", c=>vm.ucase=BOOL(ZERO(pop()))),
        new Prim("base@", "io", c=>push(get_base())),
        new Prim("base!", "io", c=>vm.base = pop() | 0),
        new Prim("hex",   "io", c=>vm.base = 16),
        new Prim("decimal","io",c=>vm.base = 10),
        new Prim("cr",    "io", c=>log(CR)),
        new Prim(".",     "io", c=>dot(pop())),
        new Prim(".r",    "io", c=>{ let n=pop(); dot_r(n, pop()) }),
        new Prim("u.r",   "io", c=>{ let n=pop(); dot_r(n, pop()&0x7fffffff) }),
        new Prim("key",   "io", c=>push(key())),
        new Prim("emit",  "io", c=>emit(pop())),
        new Prim("space", "io", c=>spaces(1)),
        new Prim("spaces","io", c=>spaces(pop())),
        /// @}
    ]
}
