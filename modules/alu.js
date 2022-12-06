import { INT, BOOL, ZERO, Prim } from './core.js'

export const voc = (vm)=>{
    const top    = (n=1)=>vm.ss[vm.ss.length - INT(n)]
    const push   = v    =>vm.ss.push(v)
    const pop    = ()   =>vm.ss.pop()
    const remove = n    =>{
        let v=top(n)
        vm.ss.splice(vm.ss.length - n, 1)
        return v
    }
    return [
        /// @defgroup Stack ops
        /// @{
        new Prim("dup",   "ss", c=>push(top())),
        new Prim("drop",  "ss", c=>pop()),
        new Prim("over",  "ss", c=>push(top(2))),
        new Prim("swap",  "ss", c=>push(remove(2))),
        new Prim("rot",   "ss", c=>push(remove(3))),
        new Prim("-rot",  "ss", c=>vm.ss.splice(-2, 0, pop())),
        new Prim("pick",  "ss", c=>{ let i=pop(), n=top(i+1); push(n) }),
        new Prim("roll",  "ss", c=>{ let i=pop(), n=remove(i+1); push(n) }),
        new Prim("nip",   "ss", c=>remove(2)),
        new Prim("2dup",  "ss", c=>{ push(top(2)); push(top(2)) }),
        new Prim("2drop", "ss", c=>vm.ss.splice(-2)),
        new Prim("2over", "ss", c=>{ push(top(4)); push(top(4)) }),
        new Prim("2swap", "ss", c=>{ push(remove(4)); push(remove(4)) }),
        /// @}
        /// @defgroup Arithmetic ops
        /// @{
        new Prim("+",     "au", c=>{ let n=pop(); push(pop() + n) }),
        new Prim("-",     "au", c=>{ let n=pop(); push(pop() - n) }),
        new Prim("*",     "au", c=>{ let n=pop(); push(pop() * n) }),
        new Prim("/",     "au", c=>{ let n=pop(); push(pop() / n) }),
        new Prim("mod",   "au", c=>{ let n=pop(); push(pop() % n) }),          // * note: 4.5 3 mod => 1.5
        new Prim("*/",    "au", c=>{ let n=pop(); push(pop() * pop() / n) }),
        new Prim("*/mod", "au", c=>{
            let n=pop(), m=pop() * pop();
            push(m % n); push(INT(m / n))
        }),
        /// @}
        /// @defgroup Bit-wise ops (auto convert to 32-bit by Javascript)
        /// @{
        new Prim("int",   "au", c=>push(INT(pop()))),                          // * convert float to integer
        new Prim("and",   "au", c=>push(pop() & pop())),
        new Prim("or",    "au", c=>push(pop() | pop())),
        new Prim("xor",   "au", c=>push(pop() ^ pop())),
        new Prim("negate","au", c=>push(-pop())),
        new Prim("abs",   "au", c=>push(Math.abs(pop()))),
        /// @}
        /// @defgroup Logic ops
        /// @{
        new Prim("0=",    "eq", c=>push(ZERO(pop()))),
        new Prim("0<",    "eq", c=>push(BOOL(pop() < -EPS))),
        new Prim("0>",    "eq", c=>push(BOOL(pop() >  EPS))),
        new Prim("=",     "eq", c=>{ let n=pop(); push(ZERO(pop() - n)) }),
        new Prim("<",     "eq", c=>{ let n=pop(); push(BOOL((pop() - n) < -EPS)) }),
        new Prim(">",     "eq", c=>{ let n=pop(); push(BOOL((pop() - n) >  EPS)) }),
        new Prim("<>",    "eq", c=>{ let n=pop(); push(BOOL(ZERO(pop() - n)==0)) }),
        /// @}
    ]
}
