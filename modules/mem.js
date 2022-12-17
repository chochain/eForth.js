/// @file
/// @brief eForth - Memory Access ops
///
import { Prim } from './core.js'

export const voc = (vm)=>{
    const val  = i=>vm.dict[i].val
    const push = v=>vm.ss.push(v)
    const pop  = ()=>{ return vm.ss.pop() }
    
    return [
        new Prim('?',  c=>vm.log(val(pop())[0])),
        new Prim('@',  c=>push(val(pop())[0])),                   // w -- n
        new Prim('!',  c=>{ let w=pop(); val(w)[0]=pop() }),      // n w  --
        new Prim('+!', c=>{ let w=pop(); val(w)[0]+=pop() }),     // n w --
        new Prim('n@', c=>{ let i=pop(); push(val(pop())[i]) }),  // w i -- n
        new Prim("n!", c=>{ let i=pop(); val(pop())[i] = pop() }) // n w i --
    ]
}
