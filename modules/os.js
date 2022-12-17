/// @file
/// @brief eForth - OS functions
///
import { Prim } from './core.js'

const clock   = ()  =>{ return Date.now() }
const sleep   = (ms)=>(new Promise(rst=>setTimeout(rst,ms))).then(()=>{})
const js_eval = (js)=>eval(js)                     /// * dangerous, be careful!

export const voc = (vm)=>{
    const push = (v)=>vm.ss.push(v)                /// macros
    const pop  = ()=>{ return vm.ss.pop() }
    return [
        new Prim('clock', c=>push(clock())),
        new Prim('delay', c=>sleep(pop())),
        new Prim('date',  c=>push((new Date()).toDateString())),
        new Prim('time',  c=>push((new Date()).toLocaleTimeString())),
        new Prim('eval',  c=>js_eval(pop()))       /// * dangerous, be careful!
    ]
}
