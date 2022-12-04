///=====================================================================
/// @defgroup IO functions
/// @{
const SPC  = ' ', CR="\n"                               ///< string constants

let _out   = console.log
let _base  = 10                                         ///< numeric radix
let _tib   = "", _ntib = 0                              ///< input buffer

export const init     = (output=console.log)=>_out=output
export const set_base = (b)=>_base=(b | 0)
export const get_base = () =>{ return _base | 0 }
export const set_tib  = (r)=>{ _tib=r + SPC; _ntib=0 }  ///< capture into TIB

export const log      = (s)=>_out(s)                    ///< output port
export const key      = () =>{ return io.nxtok()[0] }
export const emit     = (c)=>log(String.fromCharCode(c))
export const dot      = (n)=>{
    let a = typeof(n)!='object' ? [ n ] : n
    log(a.map(v=>v.toString(_base)).join(SPC))
}
export const dot_r    = (n, v)=>{
    let s = v.toString(_base)
    for(let i=0; i+s.length < n; i++) log(SPC)
    log(s)
}
export const cr       = () =>log(CR)
export const spaces   = (n)=>{ for (let i=0; i<n; i++) log(SPC) }
export const clear    = () =>_ntib=_tib.length              ///< clear input buffer
export const nxtok    = (d=SPC)=>{                          ///< assumes tib ends with a blank
    while (d==SPC &&
           (_tib[_ntib]==SPC || _tib[_ntib]=="\t")) _ntib++ /// * skip leading blanks and tabs
    let i = _tib.indexOf(d, _ntib)
    let s = (i==-1) ? null : _tib.substring(_ntib, i); _ntib=i+1
    return s
}
