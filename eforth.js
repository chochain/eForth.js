'use strict';
///
/// eForth.js Virtual Machine factory function
///
window.ForthVM = function(output=console.log) {
    let SPC=' ', CR='\n'                  ///< string constants
    let EPS=1.0e-6                        ///< comparison epsilon
    ///
    /// Virtual Machine instance variables
    ///
    let _ss    = []                       ///< data stack
    let _rs    = []                       ///< return stack
    let _wp    = 0                        ///< word pointer
    let _base  = 10                       ///< numeric radix
    ///
    /// VM state control
    ///
    let _compi = false                    ///< compile flag
    let _ucase = false                    ///< case sensitive find
    let _tib   = '', _ntib = 0            ///< input buffer
    let _fence = 0                        ///< dict length control
    /// @}
    ///==============================================================
    /// Inner interpreter (use catch for does and exit)
    ///
    const _run = (p)=>{ try { p.forEach(w=>w.exec()) } catch {} }
    ///
    /// Primitive and Immediate word classes (to simplify Dr. Ting's)
    ///
    class Prim {
        constructor(name, xt) {
            this.name  = name             ///< name of the word
            this.xt    = xt               ///< function pointer
            this.immd  = false            ///< immediate flag
            this.token = _fence++         ///< word
        }
        exec() { this.xt(this) }
    }
    class Immd extends Prim {
        constructor(name, xt) { super(name, xt); this.immd=true }
    }
    ///
    /// Colon word class
    ///
    class Code {
        constructor(name, v=false, xt=null) {
            this.name  = name             ///< name of the word
            this.xt    = xt               ///< function pointer
            this.immd  = false            ///< immediate flag
            this.pf    = []               ///< parameter field

            if (xt==null) {
                let w = find(name);
                if (w != null) this.xt = w.xt
            }
            if (typeof(v)=='boolean' && v) this.token = _fence++  // new user defined word
            else if (typeof(v)=='string')  this.qf = [ v ]
            else if (typeof(v)=='number')  this.qf = [ v ]

            this.pf.tail = function() { return this[this.length-1] }
        }
        exec() {                         /// run colon word
            if (this.xt == null) {       /// * user define word
                _rs.push(_wp)            /// * setup call frame
                _wp = this.token
                _run(this.pf)
                _wp = _rs.pop()          /// * restore call frame
            }
            else this.xt(this);          /// * build-it words
        }
    }
    ///=====================================================================
    /// @defgroup IO functions
    /// @{
    const log    = (s)=>output(s)
    const NA     = (s)=>s+' not found! '
    const nxtok  = (d=SPC)=>{            /// assumes tib ends with a blank
        while (d==SPC &&                 /// skip leading blanks and tabs
               (_tib[_ntib]==SPC || _tib[_ntib]=='\t')) _ntib++
        let i = _tib.indexOf(d, _ntib)
        let s = (i==-1) ? (_tib='',null) : _tib.substring(_ntib, i)
        _ntib = i+1
         return s
    }
    const dot_r = (n, v)=>{
        let s = v.toString(_base)
        for(let i=0; i+s.length < n; i++) log(SPC)
        log(s)
    }
    const sleep  = (ms)=>{
        return new Promise(rst=>setTimeout(rst,ms))
    }
    /// @}
    /// @defgroup Compiler functions
    /// @{
    const compile= (w)=>dict.tail().pf.push(w)      ///< add word to pf[]
    const nvar   = (xt, v)=>{
        compile(new Code('dovar', v))
        let t = dict.tail(), w = t.pf[0]            ///< last work and its pf
        t.val   = w.qf                              /// * create a val func
        w.xt    = xt                                /// * set internal func
        w.token = t.token                           /// * copy token
    }
    const find   = (s)=>{                           ///< search through dictionary
        for (let i=dict.length-1; i>=0; --i) {      /// * search reversely
            if (s.localeCompare(                    /// * case insensitive
                dict[i].name, undefined,
                { sensitivity: _ucase ? 'case' : 'base' }
            )==0) {
                return dict[i]                      /// * return indexed word
            }
        }
        return null                                 /// * not found
    }
    const tok2w  = ()=>{                            ///< convert token to word
        let s=nxtok()
        if (s==null) { log('name? '); throw 'need name' }
        let w = find(s)
        if (w==null) throw NA(s);
        return w
    }
    /// @}
    /// @defgroup data conversion functions
    /// @{
    const INT    = v=>(v | 0)                        ///< OR takes 32-bit integer
    const UINT   = v=>(v & 0x7fffffff)               ///< unsigned int
    const BOOL   = t=>(t ? -1 : 0)                   ///< Forth true = -1 
    const ZERO   = v=>BOOL(Math.abs(v) < EPS)        ///< zero floating point
    /// @}
    /// @defgroup Stack op short-hand functions (macros)
    /// @{
    const top    = (n=1)=>_ss[_ss.length - INT(n)]
    const push   = v    =>_ss.push(v)
    const pop    = ()   =>_ss.pop()
    const remove = n    =>{ let v=top(n); _ss.splice(length - n, 1); return v }
    const rtop   = (n=1)=>_rs[_rs.length - INT(n)]
    const dec_i  = ()   =>_rs[_rs.length - 1] -= 1
    /// @}
    /// @defgroup Built-in (branching, looping) functions
    /// @{
    const _docon = c=>push(c.qf[0])
    const _dovar = c=>push(c.token)
    const _dostr = c=>{
        let s = nxtok('"')
        if (s==null) { log('one quote? '); return }
        if (_compi) compile(new Code('_dolit', s))
        else push(s)                               /// push string object
    }
    const _bran  = c=>_run(ZERO(pop()) ? c.pf1 : c.pf)
    const _again = c=>{
        while (true) {
            _run(c.pf)                             /// begin.{pf}.
            if (c.stage==0 && INT(pop())!=0) break /// until
            if (c.stage==1) continue               /// again
            if (c.stage==2 && ZERO(pop())) break   /// while
            _run(c.pf1)                            /// .{pf1}.until
        }
    }
    const _dofor = c=>{
        do { _run(c.pf) } while (
            c.stage==0 && dec_i() >= 0)            /// for.{pf}.next only
        while (c.stage>0) {                        /// aft
            _run(c.pf2)                            /// aft.{pf2}.next
            if (dec_i() < 0) break
            _run(c.pf1)                            /// then.{pf1}.next
        }
        _rs.pop()                                  /// pop off I
    }
    /// @}
    /// @defgroup Debug functions (can be implemented in front-end)
    /// @{
    const _spaces= (n=1)=>{ for (let i=0; i<n; i++) log(SPC) }
    const _words = ()=>{
        let sz = 0
        dict.forEach((w,i)=>{
            if (w.name[0] != '_') {                 /// * skip hidden words
                log(w.name+SPC)
                sz += w.name.length + 1
                if (sz > 52) { log(CR); sz = 0 }
            }
        })
        log(CR)
    }
    const _dump = (n0, sz)=>{
        for (let i = n0; i <= n0+sz; i++) {
            let w = dict[i]
            log('['+i+(w.immd ? ']*=' : ']="') + w.name + '", ')
            if (w.xt) log(w.xt)
            else      log('pf='+JSON.stringify(w.pf))   /// * user defined word
            log(CR)
        }
    }
    const _see = (w, n=0)=>{
        const _show_pf = (pf)=>{
            if (pf == null || pf.length == 0) return
            log('['+CR); _spaces(2*(n+1))          /// * indent section
            pf.forEach(w1=>_see(w1, n+1))          /// * recursive call
            log('] ')                              /// * close section
        }
        log(w.name+' ')                            /// * display word name
        if (w.qf != null && w.qf.length > 0) {     /// * display qf array
            log('='+JSON.stringify(w.qf)+' ')
        }
        _show_pf(w.pf)                             /// * if.{pf}, for.{pf}, or begin.{pf}
        _show_pf(w.pf1)                            /// * else.{pf1}.then, or .then.{pf1}.next
        _show_pf(w.pf2)                            /// * aft.{pf2}.next
    }
    /// @}
    ///======================================================================
    /// dictionary intialized with primitive words
    ///
    let dict = [
        /// @defgroup Stack ops
        /// @{
        new Prim('dup',   c=>push(top())),
        new Prim('drop',  c=>pop()),
        new Prim('over',  c=>push(top(2))),
        new Prim('swap',  c=>push(remove(2))),
        new Prim('rot',   c=>push(remove(3))),
        new Prim('pick',  c=>{ let i=pop(), n=top(i+1); push(n) }),
        new Prim('roll',  c=>{ let i=pop(), n=remove(i+1); push(n) }),
        new Prim('nip',   c=>remove(2)),
        new Prim('2dup',  c=>{ push(top(2)); push(top(2)) }),
        new Prim('2drop', c=>_ss.splice(-2)),
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
        new Prim('max',   c=>{ let a=pop(), b=pop(); push(a > b ? a : b) }),
        new Prim('min',   c=>{ let a=pop(), b=pop(); push(a > b ? b : a) }),
        new Prim('2*',    c=>push(pop() * 2)),
        new Prim('2/',    c=>push(pop() / 2)),
        new Prim('1+',    c=>push(pop() + 1)),
        new Prim('1-',    c=>push(pop() - 1)),
        /*
          TODO: u., u<, u>
        */
        /// @}
        /// @defgroup Bit-wise ops (auto convert to 32-bit by Javascript)
        /// @{
        new Prim('int',   c=>push(INT(pop()))),                          // * convert float to integer
        new Prim('and',   c=>push(pop() & pop())),
        new Prim('or',    c=>push(pop() | pop())),
        new Prim('xor',   c=>push(pop() ^ pop())),
        new Prim('negate',c=>push(-pop())),
        new Prim('invert',c=>push(pop() ^ -1)),
        new Prim('abs',   c=>push(Math.abs(pop()))),
        new Prim('rshift',c=>{ let n=pop(); push(pop() >> n) }),
        new Prim('lshift',c=>{ let n=pop(); push(pop() << n) }),
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
        new Prim('u<',    c=>{ let n=pop(); push(BOOL(UINT(pop()) < UINT(n)))}),
        new Prim('u>',    c=>{ let n=pop(); push(BOOL(UINT(pop()) > UINT(n)))}),
        /// @}
        /// @defgroup IO ops
        /// @{
        new Prim('ucase!',c=>_ucase=BOOL(ZERO(pop()))),
        new Prim('base@', c=>push(INT(_base))),
        new Prim('base!', c=>_base=INT(pop())),          /// * between 2~36
        new Prim('decimal',c=>_base=10),
        new Prim('hex',   c=>_base=16),
        new Prim('bl',    c=>log(SPC)),
        new Prim('cr',    c=>log(CR)),
        new Prim('.',     c=>log(pop().toString(_base)+SPC)),
        new Prim('u.',    c=>log(UINT(pop()).toString(_base)+SPC)),
        new Prim('.r',    c=>{ let n=pop(); dot_r(n, pop()) }),
        new Prim('u.r',   c=>{ let n=pop(); dot_r(n, UINT(pop())) }),
        new Prim('key',   c=>push(nxtok()[0])),
        new Prim('emit',  c=>log(String.fromCharCode(pop()))),
        new Prim('space', c=>log(SPC)),
        new Prim('spaces',c=>_spaces(pop())),
        /// @}
        /// @defgroup Literal ops
        /// @{
        new Prim('_dotstr',c=>log(c.qf[0])),   /// display string
        new Prim('_dolit', c=>push(c.qf[0])),  /// integer literal or string
        new Immd('."',    c=>{
            let s = nxtok('"')
            if (_compi) compile(new Code('_dotstr', s))
            else log(s)
        }),
        new Immd('s"',    c=>_dostr()),        /// * push string as TOS
        new Immd('"',     c=>_dostr()),        /// * non-Forth standard
        new Immd('(',     c=>nxtok(')')),
        new Immd('.(',    c=>log(nxtok(')'))),
        new Immd('\\',    c=>_ntib=_tib.length),
        /// @}
        /// @defgroup Branching - if.{pf}.then, if.{pf}.else.{pf1}.then
        /// @{
        new Immd('if',    c=>{
            let w = new Code('_bran', false, _bran)  // encode branch opcode
            w.pf1=[]; w.stage=0                      // stage for branching
            compile(w)
            dict.push(new Code('_tmp'))              // as dict.tail()
        }),
        new Immd('else',  c=>{
            let w=dict.last(), tmp=dict.tail()
            w.pf.push(...tmp.pf); w.stage=1
            tmp.pf.length = 0
        }),
        new Immd('then',  c=>{
            let w=dict.last(), tmp=dict.tail()
            if (w.stage==0) {
                w.pf.push(...tmp.pf)                 // copy tmp.pf into branch
                dict.pop()                           // drop tmp
            }
            else {
                w.pf1.push(...tmp.pf)
                if (w.stage==1) dict.pop()           // drop tmp
                else tmp.pf.length=0                 // for...aft...then
            }
        }),
        /// @}
        /// @defgroup Loop ops
        /// @brief begin.{pf}.again, begin.{pf}.until, begin.{pf}.while.{pf1}.repeat
        /// @{
        new Immd('begin', c=>{
            compile(new Code('_again', false, _again)) /// encode _again opcode
            dict.push(new Code("tmp"))                 /// create a tmp holder
            let w = dict.last()
            w.pf1=[]; w.stage=0                        /// create branching pf
        }),
        new Immd('while', c=>{
            let w=dict.last(), tmp=dict.tail()
            w.pf.push(...tmp.pf); w.stage=2            /// begin.{pf}.f.while
            tmp.pf.length = 0
        }),
        new Immd('repeat', c=>{
            let w=dict.last(), tmp=dict.tail()
            w.pf1.push(...tmp.pf)                      /// while.{pf1}.repeat
            dict.pop()
        }),
        new Immd('again', c=>{
            let w=dict.last(), tmp=dict.tail()
            w.pf.push(...tmp.pf); w.stage=1            /// begin.{pf}.again
            dict.pop()
        }),
        new Immd('until', c=>{
            let w=dict.last(), tmp=dict.tail()
            w.pf.push(...tmp.pf)                       /// begin.{pf}.f.until
            dict.pop()
        }),
        /// @}
        /// @defgroup Loop ops
        /// @brief for.{pf}.next, for.{pf}.aft.{pf1}.then.{pf2}.next
        /// @{
        new Immd('for',   c=>{                         /// for...next
            compile(new Code('>r'));                   /// push I onto rstack
            compile(new Code('_dofor', false, _dofor)) /// encode _for opcode
            dict.push(new Code('_tmp'))                /// create tmp holder
            let w=dict.last()
            w.stage=0; w.pf1=[]
        }),
        new Immd('aft',   c=>{
            let w=dict.last(), tmp=dict.tail()
            w.pf.push(...tmp.pf); w.stage=3; w.pf2=[]  /// for.{pf}.aft
            tmp.pf.length=0
        }),
        new Immd('next',  c=>{
            let w=dict.last(), tmp=dict.tail()
            if (w.stage==0) w.pf.push(...tmp.pf)       /// for.{pf}.next
            else            w.pf2.push(...tmp.pf)      /// .then.{pf2}.next
            dict.pop()
        }),
        /*
          TODO: do, loop, +loop, j
        */
        new Prim('>r',    c=>_rs.push(pop())),         /// push into rstack
        new Prim('r>',    c=>push(_rs.pop())),         /// pop from rstack
        new Prim('r@',    c=>push(rtop())),            /// fetch from rstack
        new Prim('i',     c=>push(rtop())),            /// same as r@
        new Prim('exit',  c=>{ throw 'exit' }),        /// exit inner interpreter
        /// @}
        /// @defgroup Memory Access ops
        /// @{
        new Prim('?',     c=>log(dict[pop()].val[0].toString(_base)+SPC)),
        new Prim('@',     c=>push(dict[pop()].val[0])),                              // w -- n
        new Prim('!',     c=>{ let w=pop(); dict[w].val[0]=pop() }),                 // n w  --
        new Prim('+!',    c=>{ let w=pop(); dict[w].val[0]+=pop() }),                // n w --
        new Prim('n@',    c=>{ let i=pop(); let w=pop(); push(dict[w].val[i]) }),    // w i -- n
        new Prim('n!',    c=>{ let i=pop(); let w=pop(); dict[w].val[i]=pop() }),    // n w i --
        /// @}
        /// @defgroup Word Defining ops
        /// @{
        new Immd('[',        c=>_compi=false ),
        new Prim(']',        c=>_compi=true ),
        new Prim("'",        c=>{ let w=tok2w(); push(w.token) }),
        new Immd('exec',     c=>dict[pop()].exec()),
        new Prim(':',        c=>_compi=dict.add()),            // new colon word
        new Immd(';',        c=>_compi=false),                 // semicolon
        new Immd('variable', c=>dict.add() ? nvar(_dovar, 0) : null),
        new Immd('constant', c=>dict.add() ? nvar(_docon, pop()) : null),
        new Prim("create",   c=>dict.add()),                   // create new word
        new Prim(',',        c=>{                              // push TOS into qf
            let pf = dict.tail().pf
            if (pf.length) pf[0].qf.push(pop())                // append more values
            else           nvar(_dovar, pop())                 // 1st value in qf
        }),
        new Prim('allot',    c=>{                              // n --
            let w = dict.tail()
            nvar(_dovar, 0)                                    // create qf array
            for (let n=pop(), i=1; i<n; i++) w.val[i]=0        // fill all slot with 0
        }),
        new Prim('does>',     c=>{
            let w=dict.tail(), src=dict[_wp].pf
            for (var i=0; i < src.length; i++) {
                if (src[i].name=='does>') {
                    w.pf.push(...src.slice(i+1))
                    break
                }
            }
            throw 'does>'                                      // break from inner interpreter
        }),
        new Prim('to',       c=>tok2w().val[0]=pop()),         // update constant
        new Prim('is',       c=>{                              // n -- alias a word
            if (dict.add()) dict.tail().pf = dict[pop()].pf
        }),
        /// @}
        /// @defgroup Debugging ops
        /// @{
        new Prim('here',     c=>push(dict.tail().token)),
        new Prim('.s',       c=>log(JSON.stringify(_ss)+CR)),
        new Prim('words',    c=>_words()),
        new Prim('dump',     c=>{ let n=pop(); _dump(pop(), n) }),
        new Prim('see',      c=>{ let w=tok2w(); console.log(w); _see(w) }),
        new Prim('forget',   c=>{
            _fence=Math.max(tok2w().token, find('boot').token+1)
            dict.splice(_fence)
        }),
        new Prim('abort',    c=>{ _rs.length = _ss.length = 0 }),
        /// @}
        /// @defgroup System ops
        /// @{
        new Prim('ms',       c=>{ let n = Date.now(); push(n) }),
        new Prim('delay',    c=>sleep(pop()).then(()=>{})),
        new Prim('date',     c=>push((new Date()).toDateString())),
        new Prim('time',     c=>push((new Date()).toLocaleTimeString())),
        new Prim('eval',     c=>eval(pop())),                  /// * dangerous, be careful!
        /// @}
        new Prim('boot',     c=>{
            dict.splice(_fence=find('boot').token+1)
            _wp   = _rs.length = _ss.length = 0
            _base = 10
        })
        /// @}
    ]
    ///
    /// @defgroup add dictionary access methods
    /// @{
    dict.add  = function()    {                        ///< create a new word
        let s = nxtok();                               ///< fetch an input token
        if (s==null) { log('name? '); return false }
        if (find(s) != null) log(s + ' reDef? ')       /// * warning
        dict.push(new Code(s, true))
        return true                                    /// * success
    }
    dict.tail = function(i=1) { return this[this.length-i]    }
    dict.last = function()    { return dict.tail(2).pf.tail() }
    /// @}
    ///
    /// expose data structure to JS engine
    ///
    this.ss    = _ss
    this.rs    = _rs
    this.dict  = dict
    this.base  = ()=>{ return _base }
    this.isNum = (s)=>{                       ///> check number in range
        const mx = (c)=>c+'-'+String.fromCharCode(c.charCodeAt() + (_base - 11))
        const st = _base > 10
              ? '^[0-9|'+mx('a')+'|'+mx('A')+']+$'
              : '^[0-'+(_base-1).toString()+']+$'
        let r = new RegExp(st).test(s)
        return r
    }
    ///
    /// outer interpreter method
    /// @param tok - one token (or idiom) from input buffer
    ///
    this.outer = (tok)=>{
        let w = find(tok)                     /// * search throug dictionary
        if (w != null) {                      /// * word found?
            if(!_compi || w.immd) {           /// * in interpret mode?
                try       { w.exec() }        ///> execute word
                catch (e) { log(e) }
            }
            else compile(w)                   ///> or compile word
            return
        }
        let n = _base!=10                     ///> not word, try as number
            ? parseInt(tok, _base)
            : parseFloat(tok)
        if (isNaN(n) || !this.isNum(tok)) {   ///> * is it a number?
            log(tok + '? ')                   ///>> display prompt
            _compi=false                      ///>> restore interpret mode
        }
        else if (_compi) {                    ///> in compile mode?
            compile(new Code('_dolit', n))    ///>> compile the number
        }
        else push(n)                          ///>> or, push number onto stack top
    }
    this.exec = (cmd)=>{
        cmd.split('\n').forEach(r=>{          /// * multi-line input
            _tib=r + SPC; _ntib=0             /// * capture into TIB
            let tok = ''                      ///< input idiom
            while ((tok=nxtok()) != null) {   /// * loop thru all idioms
                this.outer(tok)
            }
        })
        log('ok'+CR)
    }
    ///
    /// embedded Forth processor
    ///
    window.addEventListener('load', async ()=>{              ///< load event handler
        let slst = document.getElementsByTagName('script')   ///< get HTMLcollection
        for (let i = 0; i < slst.length; i++) {              /// * walk thru script elements
            let s = slst[i]
            if (s.type != 'application/forth') continue      /// * handle embedded Forth 
            if (s.src) {                                     /// * handle nested scripts
                await fetch(s.src)                           /// * fetch remote Forth script
                    .then(r=>r.text())                       /// * get Forth commands
                    .then(cmd=>this.exec(cmd))               /// * send it to Forth VM
            }
            else this.exec(s.innerText)
        }
    })
}

