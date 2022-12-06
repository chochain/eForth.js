///
/// Module - eForth prototype interfaces
///
/// Note: supported interface
///   > let vm = new Forth(), or
///   > let vm = Forth()
///
/// default module interface to JS engine
///
import * as io   from './io.js'
import * as dict from './dict.js'
import { VM }    from './vm.js'

export { default as embed_forth } from './embed.js'   ///< embedded Forth listener
export function Forth(output=console.log) {
    if (!(this instanceof Forth)) return new Forth(output);
    
    io.init(output)                        ///< intialize output port
    
    let vm   = new VM(io)                  ///< create VM instance
    let exec = (cmd)=>{                    ///< outer interpreter
        if (vm.dict.length==0) {           /// * lazy loading
            dict.init(vm)                  /// * construct dict now
        }
        cmd.split("\n").forEach(r=>{       /// * multi-line input
            io.set_tib(r)                  /// * capture into TIB
            for (let tok=io.nxtok(); tok != null; tok=io.nxtok()) {
                vm.outer(tok)
            }
        })
        io.log("ok\n")
    }
    return {
        ss:   vm.ss,                       ///< data stack
        rs:   vm.rs,                       ///< return stack
        dict: vm.dict,                     ///< dictionary
        exec: exec                         ///< outer interpreter
    }
}


