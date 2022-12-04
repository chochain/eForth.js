import { log } from './io.js'
///
/// @defgroup Memory Access ops
/// @{
export const at        = (c)=>{ return c.val[0] }
export const store     = (c, v)=>c.val[0]=v
export const storeplus = (c, v)=>c.val[0]+=v
export const arr_at    = (c, i)=>{ return c.val[i] }
export const arr_store = (c, i, v)=>c.val[i]=v
/// @}
