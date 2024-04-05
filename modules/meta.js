/// @file
/// @brief eForth - Word Defining ops
///
import { Prim, Immd, Code } from './core.js'

export const voc = (vm)=>{
    const push   = v=>vm.ss.push(v)                        ///< ss.push macro
    const pop    = ()=>vm.ss.pop()                         ///< ss.pop macro
    const docon  = c=>push(c.qf[0])                        ///< constant op
    const dovar  = c=>push(c.token)                        ///< variable op
    const does   = c=>{
        let hit = false
        vm.dict[c.token].pf.forEach(w=>{
            if (hit) vm.dict.last().pf.push(w)
            if (w.name=='_does') hit = true
        })
        throw '_does'
    }
    const vm_add = ()=>{
        let s = vm.tok();                                  ///< fetch an input token
        if (s==null) throw 'name? '
        vm.add(s)
    }
    const vm_var = (xt, v)=>{ vm_add(); vm.nvar(xt, v) }   ///< new variable/constant
    
    return [
        new Immd('[',        c=>vm.compi=false ),          /// interpreter mode
        new Prim(']',        c=>vm.compi=true ),           /// compiler mode
        new Prim("'",        c=>{                          /// get token of a word
            let w = vm.tok2w()
            push(w.token)                                  /// put found token on TOS
        }),
        new Immd('exec',     c=>vm.dict[pop()].exec()),    /// execute a word (by its token)
        new Prim(':',        c=>{ vm_add(); vm.compi=true }),  /// fetch an input token
        new Immd(';',        c=>vm.compi=false),           /// semicolon
        new Immd('variable', c=>vm_var(dovar, 0)),
        new Immd('constant', c=>vm_var(docon, pop())),
        new Prim('create',   c=>vm_add()),                 ///< create new word
        new Prim(',',        c=>{                          ///< push TOS into qf
            let t = vm.tail()
            if (t.pf.length==0) vm.nvar(dovar, pop())      /// 1st value in qf
            else                t.val.push(pop())          /// append more values
        }),
        new Prim('allot',    c=>{                          ///< allocate cells
            let t = vm.tail(); vm.nvar(dovar, 0)           /// * create qf array
            for (let n=pop(), i=1; i<n; i++) t.val[i]=0    /// * fill all slot with 0
        }),
        new Prim('does>',    c=>{                          ///< handle create..does..
            let w = new Code('_does', does, false)
            w.token = vm.tail().token;
            vm.comma(w)
        }),
        new Prim('to',       c=>vm.tok2w().val[0]=pop()),  ///< update constant
        new Prim('is',       c=>{                          ///< alias a word
            vm_add()
            let n = pop() | 1
            let w = vm.tail(), s = vm.dict[n]
            w.pf = s.pf; w.xt = s.xt
        })
    ]
}
