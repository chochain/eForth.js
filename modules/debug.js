/// @file
/// @brief eForth - Debug functions (can be implemented in front-end)
///
import { Prim, purge } from './core.js'

const DUMP_WIDTH = 54                              ///< dump control
const CR = '\n'

export const voc = (vm) => {
    const log   = vm.log
    const push  = (v)=> vm.ss.push(v)
    const pop   = () => vm.ss.pop()
    const words = () =>{                           ///< word op
        let sz  = 0
        vm.dict.forEach((w,i)=>{                   /// * loop thru all words
            log(w.name+' ')
            sz += w.name.length + 1
            if (sz > DUMP_WIDTH) { log(CR); sz = 0 }
        })
        log(CR)
    }
    const dump = (idx, sz)=>{                      ///< memory dump op
        for (let i = INT(idx); i <= INT(idx+sz); i++) {
            if (i >= vm.dict.length) break
            let w = vm.dict[i]
            log('['+i+(w.immd ? ']*=' : ']="') + w.name + '", ')
            if (w.xt) log(w.xt)
            else      log('pf='+JSON.stringify(w.pf))   /// * user defined word
            log(CR)
        }
    }
    const see = (w, n=0)=>{                     ///< see op
        const iden = (n, s)=>{ log(CR); _spaces(2*n); log(s) }
        const show = (hdr, pf)=>{
            if (pf == null || pf.length == 0) return
            if (hdr!='') iden(n, hdr)
            iden(n+1, '')
            pf.forEach(w1=>_see(w1, n+1))       /// * recursive call
        }
        let cn = w.pf!=null && w.pf.length>0
        log(' '+w.name+(cn ? ' {' : ''))        /// * display word name
        if (w.q != null) {                      /// literal
            let n = w.q.length
            if (n > 1) log(JSON.stringify(w.q)) /// * array
            else {
                log(w.q[0].toString())          /// * single var
                if (typeof(w.q[0])=='string') log('"')
            }
        }
        if (w.xt && n==0) {                     /// * show built-in words
            log(' { '+w.xt+' } ')
            return                              /// * leaf, bail 
        }
        let bn = w.stage==2
            ? ' _while' : (w.stage==3 ? ' _aft' : ' _else');
        show('', w.pf)          /// * if.{pf}, for.{pf}, or begin.{pf}
        show(bn, w.p1)          /// * else.{p1}.then, while.{p1}.next, for.{p1}.aft
        show(' _then', w.p2);   /// * aft.{p2}.then
        if (cn) log(' }')
    }
    return [
        new Prim('here',   c=>push(vm.tail().token)),
        new Prim('.s',     c=>vm.log(JSON.stringify(vm.ss)+CR)),
        new Prim('words',  c=>words()),
        new Prim('dump',   c=>{ let n=pop(); dump(pop(), n) }),
        new Prim('see',    c=>{ let w=vm.tok2w(); console.log(w); see(w) }),
        new Prim('forget', c=>purge(vm.dict, vm.tok2w(), vm.find('boot'))),
        new Prim('abort',  c=>{ _rs.length = _ss.length = 0 }),
    ]
}
