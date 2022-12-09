import { Prim } from './core.js'
///
/// @defgroup Memory Access ops
/// @{
export const voc = (vm)=>{
    const val  = i=>vm.dict[i].val
    const log  = vm.log
    const push = v=>vm.ss.push(v)
    const pop  = ()=>{ return vm.ss.pop() }
    return [
        /// @defgroup Memory Access ops
        /// @{
        new Prim("?",  "mm", c=>log(val(pop())[0])),
        new Prim("@",  "mm", c=>push(val(pop())[0])),                   // w -- n
        new Prim("!",  "mm", c=>{ let w=pop(); val(w)[0]=pop() }),      // n w  --
        new Prim("+!", "mm", c=>{ let w=pop(); val(w)[0]+=pop() }),     // n w --
        new Prim("n?", "mm", c=>{ let i=pop(); log(val(pop())[i]) }),   // w i --
        new Prim("n@", "mm", c=>{ let i=pop(); push(val(pop())[i]) }),  // w i -- n
        new Prim("n!", "mm", c=>{ let i=pop(); val(pop())[i] = pop() }) // n w i --
        /// @}
    ]
}
