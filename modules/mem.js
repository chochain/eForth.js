import { Prim } from './core.js'
///
/// @defgroup Memory Access ops
/// @{
const _fetch     = (c)=>{ return c.val[0] }
const _store     = (c, v)=>c.val[0]=v
const _storeplus = (c, v)=>c.val[0]+=v
const _afetch    = (c, i)=>{ return c.val[i] }
const _astore    = (c, i, v)=>c.val[i]=v

export const voc = (vm)=>{
    let log = vm.log
    return [
        /// @defgroup Memory Access ops
        /// @{
        new Prim("?",     "mm", c=>log(_fetch(vm.dict[pop()]))),
        new Prim("@",     "mm", c=>push(_fetch(vm.dict[pop()]))),                        // w -- n
        new Prim("!",     "mm", c=>{ let w=pop(); _store(vm.dict[w], pop()) }),          // n w  --
        new Prim("+!",    "mm", c=>{ let w=pop(); _storeplus(vm.dict[w], pop()) }),      // n w --
        new Prim("allot", "mm", c=>{                                                     // n --
            vm.nvar(_dovar, 0)                                                           // create qf array
            for (let n=pop(), i=1; i<n; i++) _astore(vm.tail(), i, 0)
        }),
        new Prim("n?",    "mm", c=>{                                       // w i --
			let i=pop()
			log(_afetch(vm.dict[pop()], i))
		}),
        new Prim("n@",    "mm", c=>{                                       // w i -- n
			let i=pop(), w = pop()
			push(_afetch(vm.dict[w], i))
		}),
        new Prim("n!",    "mm", c=>{                                       // n w i --
			let i=pop(), w = pop()
			_astore(vm.dict[w], i, pop())
		})
        /// @}
    ]
}
