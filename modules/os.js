///=====================================================================
/// @defgroup OS functions
/// @{
export const clock = ()  =>{ return Date.now() }
export const sleep = (ms)=>(new Promise(rst=>setTimeout(rst,ms))).then(()=>{})
export const date  = ()  =>{ return (new Date()).toDateString() }
export const time  = ()  =>{ return (new Date()).toLocaleTimeString() }

export const js_eval = (js)=>eval(js)                 /// * dangerous, be careful!
/// @}
