import { Prim } from './core.js'
///=====================================================================
/// @defgroup OS functions
/// @{
const clock = ()  =>{ return Date.now() }
const sleep = (ms)=>(new Promise(rst=>setTimeout(rst,ms))).then(()=>{})
const date  = ()  =>{ return (new Date()).toDateString() }
const time  = ()  =>{ return (new Date()).toLocaleTimeString() }

const js_eval = (js)=>eval(js)                              /// * dangerous, be careful!

export const voc = (vm)=>{
    return [
        /// @defgroup System ops
        /// @{
        new Prim("clock",    "os", c=>vm.ss.push(clock())),
        new Prim("delay",    "os", c=>sleep(pop())),
        new Prim("date",     "os", c=>vm.log(date()+" ")),
        new Prim("time",     "os", c=>vm.log(time()+" ")),
        new Prim("eval",     "os", c=>js_eval(pop())),      /// * dangerous, be careful!
        /// @}
    ]
}
/// @}
