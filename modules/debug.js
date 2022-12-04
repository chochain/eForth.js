/// @defgroup Debug functions (can be implemented in front-end)
/// @{
import { log, spaces } from './io.js'

const CR = "\n"

export const words = (dict)=>{                      ///< word op
    let sz = 0
    dict.forEach((w,i)=>{                           /// * loop thru all words
        log(w.name+' ')
        sz += w.name.length + 1
        if (sz > 52) { log(CR); sz = 0 }
    })
    log(CR)
}
export const dump = (dict, n0, n1)=>{               ///< memory dump op
    for (let i = n0; i <= n1; i++) {
        let w = dict[i]
        log('dict[' + i + ']=("' + w.name + '" ')
        if (w.xt) log(w.xt)
        else      log(', pf[' + w.pf.map(w1=>w1.name) + ']')
        if (w.qf) log(', qf[' + w.qf + ']')
        log((w.immd ? 'immd)' : ')') + log(CR))
    }
}
export const see = (w, n=0)=>{                      ///< see op
    const _show_pf = (pf)=>{
        if (pf == null || pf.length == 0) return
        log("["+CR); spaces(2*(n+1))                /// * indent section
        pf.forEach(w=>see(w, n+1))                  /// * recursive call
        log('] ')                                   /// * close section
    }
    log(w.name+' ')                                 /// * display word name
    if (w.qf != null && w.qf.length > 0) {          /// * display qf array
        log('='+JSON.stringify(w.qf)+' ')
    }
    _show_pf(w.pf)                                  /// * if.{pf}, for.{pf}, or begin.{pf}
    _show_pf(w.pf1)                                 /// * else.{pf1}.then, or .then.{pf1}.next
    _show_pf(w.pf2)                                 /// * aft.{pf2}.next
}
