/// @file
/// @brief Module - eForth interface to Javascript
///
/// Note: supported interface
///   > let vm = new Forth(), or
///   > let vm = Forth()
///
export { default as embed_forth } from './embed.js'   ///< embedded Forth listener
export function Forth(fout=console.log) {
    if (!(this instanceof Forth)) return new Forth(fout)
    
    io.init(fout)                          ///< initialize output port
    
    let vm   = new VM(io)                  ///< create VM instance
    let exec = (cmd)=>{                    ///< outer interpreter
        console.log('cmd=>'+cmd)
        if (vm.dict.length==0) {           /// * lazy loading
            dict_setup(vm)                 /// * construct dict now
        }
        cmd.split('\n').forEach(r=>{       /// * multi-line input
            vm.tib(r)                      /// * feed input stream into VM's TIB
            for (let tok=vm.word(); tok != null; tok=vm.word()) {
                vm.outer(tok)              /// * send token to outer intepreter
            }
        })
        vm.log('ok\n')
    }
    return {
        ss:   vm.ss,                       ///< data stack
        rs:   vm.rs,                       ///< return stack
        dict: vm.dict,                     ///< dictionary
        exec: exec,                        ///< outer interpreter
        base: ()=>{ return vm.base }
    }
}
///======================================================================
/// dictionary intialized with primitive words
///
import { Prim, purge } from './core.js'
import * as au  from './alu.js'
import * as io  from './io.js'
import * as li  from './literal.js'
import * as br  from './branch.js'
import * as mm  from './mem.js'
import * as me  from './meta.js'
import * as db  from './debug.js'
import * as os  from './os.js'
import { VM }   from './vm.js'

const dict_setup = (vm)=>{           ///< dictionary constructor
    vm.extend(au.voc(vm))            /// * ALU
    vm.extend(io.voc(vm))            /// * IO
    vm.extend(li.voc(vm))            /// * Literal
    vm.extend(br.voc(vm))            /// * Branching
    vm.extend(mm.voc(vm))            /// * Memory
    vm.extend(me.voc(vm))            /// * Meta compiler
    vm.extend(db.voc(vm))            /// * Debug
    vm.extend(os.voc(vm))            /// * OS
    vm.extend([                      /// * last fence
        new Prim('boot', c=>{        /// * purge all user words (i.e. upto 'boot')
            let b = vm.find('boot')
            purge(vm.dict, b, b)
            vm.reset()
        })
	])
}

