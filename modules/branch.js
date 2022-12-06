import { Prim, Immd, Code } from './core.js'
/// @}
/// @defgroup Branching - if.{pf}.then, if.{pf}.else.{pf1}.then
/// @{
const _if = (vm)=>{
    vm.compile("_bran", false, vm._bran)       /// * encode branch opcode
    vm.dict.push(new Code("tmp"))              /// * as dict.tail()
    let w = vm.last()
    w.pf1=[]; w.stage=0                        /// * stage for branching
}
const _else = (vm)=>{
    let w=vm.last(), tmp=vm.tail()
    w.pf.push(...tmp.pf); w.stage=1
    tmp.pf.length = 0
}
const _then = (vm)=>{
    let w=vm.last(), tmp=vm.tail()
    if (w.stage==0) {
        w.pf.push(...tmp.pf)                   /// * copy tmp.pf into branch
        vm.dict.pop()                          /// * drop tmp
    }
    else {
        w.pf1.push(...tmp.pf)
        if (w.stage==1) vm.dict.pop()          /// * drop tmp
        else tmp.pf.length=0                   /// * for...aft...then
    }
}
/// @}
/// @defgroup Loop ops
/// @brief begin.{pf}.again, begin.{pf}.until, begin.{pf}.while.{pf1}.repeat
/// @{
const _begin = (vm)=>{
    vm.compile("_loop", false, vm._loop)       /// * encode _loop opcode
    vm.dict.push(new Code("tmp"))              /// * create a tmp holder
    let w = vm.last()
    w.pf1=[]; w.stage=0                        /// * create branching pf
}
const _while = (dict)=>{
    let w=vm.last(), tmp=vm.tail()
    w.pf.push(...tmp.pf); w.stage=2            /// * begin.{pf}.f.while
    tmp.pf.length = 0
}
const _repeat = (vm)=>{
    let w=vm.last(), tmp=vm.tail()
    w.pf1.push(...tmp.pf)                      /// * while.{pf1}.repeat
    vm.dict.pop()
}
const _again = (vm)=>{
    let w=vm.last(), tmp=vm.tail()
    w.pf.push(...tmp.pf); w.stage=1            /// * begin.{pf}.again
    vm.dict.pop()
}
const _until = (vm)=>{
    let w=vm.last(), tmp=vm.tail()
    w.pf.push(...tmp.pf)                       /// * begin.{pf}.f.until
    vm.dict.pop()
}
/// @}
/// @defgroup Loop ops
/// @brief for.{pf}.next, for.{pf}.aft.{pf1}.then.{pf2}.next
/// @{
const _for = (vm)=>{
    vm.compile(">r", false)                    /// * push I onto rstack
    vm.compile("_for", false, vm._for)         /// * encode _for opcode
    vm.dict.push(new Code("tmp"))              /// * create tmp holder
    let w=vm.last()
    w.stage=0; w.pf1=[]
}
const _aft = (vm)=>{
    let w=vm.last(), tmp=vm.tail()
    w.pf.push(...tmp.pf); w.stage=3; w.pf2=[]  /// * for.{pf}.aft
    tmp.pf.length=0
}
const _next = (vm)=>{
    let w=vm.last(), tmp=vm.tail()
    if (w.stage==0) w.pf.push(...tmp.pf)       /// * for.{pf}.next
    else            w.pf2.push(...tmp.pf)      /// * .then.{pf2}.next
    vm.dict.pop()
}
export const voc = (vm)=>{
    return [
        /// @defgroup Branching - if.{pf}.then, if.{pf}.else.{pf1}.then
        /// @{
        new Immd("if",    "br", c=>_if(vm)),
        new Immd("else",  "br", c=>_else(vm)),
        new Immd("then",  "br", c=>_then(vm)),
        /// @}
        /// @defgroup Loop ops
        /// @brief begin.{pf}.again, begin.{pf}.until, begin.{pf}.while.{pf1}.repeat
        /// @{
        new Immd("begin", "br", c=>_begin(vm)),
        new Immd("while", "br", c=>_while(vm)),
        new Immd("repeat","br", c=>_repeat(vm)),
        new Immd("again", "br", c=>_again(vm)),
        new Immd("until", "br", c=>_until(vm)),
        /// @}
        /// @defgroup Loop ops
        /// @brief for.{pf}.next, for.{pf}.aft.{pf1}.then.{pf2}.next
        /// @{
        new Immd("for",   "br", c=>_for(vm)),
        new Immd("aft",   "br", c=>_aft(vm)),
        new Immd("next",  "br", c=>_next(vm)),
        new Prim(">r",    "br", c=>vm.rs.push(pop())),   /// * push into rstack
        new Prim("r>",    "br", c=>push(vm.rs.pop())),   /// * pop from rstack
        new Prim("r@",    "br", c=>push(rtop())),        /// * fetch from rstack
        new Prim("i",     "br", c=>push(rtop())),        /// * same as r@
        new Prim("exit",  "br", c=>{ throw 'exit' }),    /// * exit inner interpreter
        /// @}
    ]
}