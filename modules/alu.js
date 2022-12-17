/// @file
/// @brief eForth - ALU words
///
import { EPS, INT, BOOL, ZERO, Prim } from './core.js'

export const voc = (vm)=>{
    const push   = v    =>vm.ss.push(v)
    const pop    = ()   =>vm.ss.pop()
    const top    = (n=1)=>vm.ss[vm.ss.length - INT(n)]
    const remove = n    =>{
        let v=top(n)
        vm.ss.splice(vm.ss.length - n, 1)
        return v
    }
    return [
        /// @defgroup Stack ops
        /// @{
        new Prim('dup',   c=>push(top())),
        new Prim('drop',  c=>pop()),
        new Prim('over',  c=>push(top(2))),
        new Prim('swap',  c=>push(remove(2))),
        new Prim('rot',   c=>push(remove(3))),
        new Prim('-rot',  c=>vm.ss.splice(-2, 0, pop())),
        new Prim('pick',  c=>{ let i=pop(), n=top(i+1); push(n) }),
        new Prim('roll',  c=>{ let i=pop(), n=remove(i+1); push(n) }),
        new Prim('nip',   c=>remove(2)),
        new Prim('2dup',  c=>{ push(top(2)); push(top(2)) }),
        new Prim('2drop', c=>vm.ss.splice(-2)),
        new Prim('2over', c=>{ push(top(4)); push(top(4)) }),
        new Prim('2swap', c=>{ push(remove(4)); push(remove(4)) }),
        /// @}
        /// @defgroup Arithmetic ops
        /// @{
        new Prim('+',     c=>{ let n=pop(); push(pop() + n) }),
        new Prim('-',     c=>{ let n=pop(); push(pop() - n) }),
        new Prim('*',     c=>{ let n=pop(); push(pop() * n) }),
        new Prim('/',     c=>{ let n=pop(); push(pop() / n) }),
        new Prim('mod',   c=>{ let n=pop(); push(pop() % n) }),          // * note: 4.5 3 mod => 1.5
        new Prim('*/',    c=>{ let n=pop(); push(pop() * pop() / n) }),
        new Prim('*/mod', c=>{
            let n=pop(), m=pop() * pop();
            push(m % n); push(INT(m / n))
        }),
        /// @}
        /// @defgroup Bit-wise ops (auto convert to 32-bit by Javascript)
        /// @{
        new Prim('int',   c=>push(INT(pop()))),                          // * convert float to integer
        new Prim('and',   c=>push(pop() & pop())),
        new Prim('or',    c=>push(pop() | pop())),
        new Prim('xor',   c=>push(pop() ^ pop())),
        new Prim('negate',c=>push(-pop())),
        new Prim('abs',   c=>push(Math.abs(pop()))),
        /// @}
        /// @defgroup Logic ops
        /// @{
        new Prim('0=',    c=>push(ZERO(pop()))),
        new Prim('0<',    c=>push(BOOL(pop() < -EPS))),
        new Prim('0>',    c=>push(BOOL(pop() >  EPS))),
        new Prim('=',     c=>{ let n=pop(); push(ZERO(pop() - n)) }),
        new Prim('<',     c=>{ let n=pop(); push(BOOL((pop() - n) < -EPS)) }),
        new Prim('>',     c=>{ let n=pop(); push(BOOL((pop() - n) >  EPS)) }),
        new Prim('<>',    c=>{ let n=pop(); push(BOOL(ZERO(pop() - n)==0)) }),
        /// @}
    ]
}
