///
/// Module - eForth Virtual Machine
/// Note: supported interface
///   > let vm = new ForthVM(), or
///   > let vm = ForthVM()
///
/// default module interface to JS engine
///
export { default as Forth }       from './vm.js'
export { default as embed_forth } from './embed.js'

