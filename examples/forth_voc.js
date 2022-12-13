var _forth_voc = {
    "'"       : [ 'cm', '( -- w ) Return token of next synonym outside colon synonym' ],
    '-'       : [ 'au', '( a b -- c ) Subtract tos from 2nd item' ],
    '!'       : [ 'mm', '( n w -- ) Store n in variable at w' ],
    ','       : [ 'cm', '( n -- ) Compile number n to pf field of newest word' ],
    '."'      : [ 'li', '( -- ) Compile next synonym as a string literal for display' ],
    '.s'      : [ 'db', '( -- ) Display data stack content' ],
    's"'      : [ 'li', '( -- w ) Compile next synonym as a string literal' ],
    '('       : [ 'li', '( -- ) Comment to the next )' ],
    '*'       : [ 'au', '( a b -- c ) Multiply two tos items' ],
    '*/'      : [ 'au', '( a b c -- d ) d = a * b / c' ],
    '*/mod'   : [ 'au', '( a b c -- d e ) d = (a*b) % c, e = (a*b)/c' ],
    '.'       : [ 'io', '( a -- ) Display number or string a on tos' ],
    '.('      : [ 'li', '( -- ) Display next synonym up to next )' ],
    '.r'      : [ 'io', '( a n -- ) Display a in n columns' ],
    '/'       : [ 'au', '( a b -- c ) Divide 2nd item by tos' ],
    ':'       : [ 'cm', '( -- ) Define a new colon word' ],
    ';'       : [ 'cm', '( -- ) Terminate a colon word' ],
    '?'       : [ 'mm', '( w -- ) Display contents in variable w' ],
    '@'       : [ 'mm', '( w -- a ) Return contents of a variable' ],
    '['       : [ 'cm', '( -- ) Change to interpreting mode' ],
    '\\'      : [ 'li', '( -- ) Comment to the end of line' ],
    ']'       : [ 'cm', '( -- ) Change to compiling mode' ],
    '+'       : [ 'au', '( a b -- c ) Add two tos items' ],
    '+!'      : [ 'mm', '( n w -- ) Add n to the variable at w' ],
    '<'       : [ 'eq', '( a b -- f ) Return true if a<b' ],
    '<='      : [ 'eq', '( a b -- f ) Return true if a<=b' ],
    '<>'      : [ 'eq', '( a b -- f ) Return true if a is not equal to b' ],
    '='       : [ 'eq', '( a b -- f ) Return true if a=b' ],
    '>'       : [ 'eq', '( a b -- f ) Return true if a>b' ],
    '>='      : [ 'eq', '( a b -- f ) Return true if a>=b' ],
    '>r'      : [ 'br', '( a -- ) Push tos to return stack' ],
    '0<'      : [ 'eq', '( a -- f ) Return true if a<0' ],
    '0='      : [ 'eq', '( a -- f ) Return true if a=0' ],
    '0>'      : [ 'eq', '( a -- f ) Return true if a>0' ],
    '0branch' : [ 'br', '( f -- ) Branch to the following address if tos is 0' ],
    '2drop'   : [ 'ss', '( a b -- ) Discard two tos items' ],
    '2dup'    : [ 'ss', '( a b -- a b a b ) Duplicate top 2 items of tos' ],
    '2over'   : [ 'ss', '( a b c d -- a b c d a b ) Duplicate second pair tos items' ],
    '2swap'   : [ 'ss', '( a b c d -- c d a b ) Swap two pairs of tos items' ],
    '4dup'    : [ 'ss', '( a b c d -- a b c d a b c d ) Duplicate top quad tos items' ],
    'abs'     : [ 'au', '( a -- b ) Return absolute of tos' ],
    'acos'    : [ 'ex', '( a -- b ) Return arc cosine of tos' ],
    'aft'     : [ 'br', '( -- ) Skip loop once for the first time' ],
    'again'   : [ 'br', '( -- ) Repeat the begin loop' ],
    'allot'   : [ 'cm', '( n -- ) Allocate n item to the current array. Init values are 0' ],
    'and'     : [ 'au', '( a b -- c ) Bitwise AND of two tos items' ],
    'array!'  : [ 'mm', '( n w i -- ) Store n into ith item of array w' ],
    'array@'  : [ 'mm', '( w i -- b ) Return contents of the ith item in array w' ],
    'n!'      : [ 'mm', '( n w i -- ) Store n into ith item of array w' ],
    'n@'      : [ 'mm', '( w i -- b ) Return contents of the ith item in array w' ],
    'asin'    : [ 'ex', '( a -- b ) Return arc sine of tos' ],
    'atan2'   : [ 'ex', '( a b -- c ) Return arc tangent of a/b' ],
    'base!'   : [ 'io', '( a -- ) Make a the current base' ],
    'base@'   : [ 'io', '( -- a ) Return current base' ],
    'begin'   : [ 'br', '( -- ) Start a begin loop structure' ],
    'boot'    : [ 'os', '( -- ) Trim dictionary back to the fence' ],
    'branch'  : [ 'br', '( -- ) Branch to following address' ],
    'ceil'    : [ 'ex', '( a -- n ) Ceiling tos to integer' ],
    'constant': [ 'cm', '( a -- ) Create a new constant with value a' ],
    'cos '    : [ 'ex',  '( a -- b ) Return cosine of tos' ],
    'clock'   : [ 'os', '( n -- ) Delay n milliseconds' ],
    'cr'      : [ 'io', '( -- ) Display a carriage return' ],
    'create'  : [ 'cm', '( -- ) Create a new array' ],
    'date'    : [ 'os', '( -- ) Display data-time string' ],
    'decimal' : [ 'io', '( -- ) Change to decimal base' ],
    'delay'   : [ 'os', '( n -- ) wait n milliseconds' ],
    'does'    : [ 'cm', '( -- ) Assign following token list to the new word just created' ],
    'dolit'   : [ 'li', '( -- ) Push next token on stack' ],
    'donext'  : [ 'br', '( -- ) Loop to the following address' ],
    'dostr'   : [ 'li', '( -- w ) Return token of next string' ],
    'dotstr'  : [ 'li', '( -- ) Display next compiled string' ],
    'drop'    : [ 'ss', '( a -- ) Discard tos' ],
    'dump'    : [ 'db', '( -- ) Display all word objects in dictionary' ],
    'dup'     : [ 'ss', '( a -- a a ) Duplicate tos' ],
    'else'    : [ 'br', '( -- ) Take the next false branch' ],
    'emit'    : [ 'io', '( a -- ) Display an ASCII character' ],
    'execute' : [ 'cm', '( -- ) Process parsed token' ],
    'exec'    : [ 'cm', '( -- ) Process parsed token' ],
    'exit'    : [ 'os', '( -- ) Unnest a list' ],
    'exp'     : [ 'ex', '( a -- b ) Return exponential of tos' ],
    'eval'    : [ 'os', '( -- ) Javascript.eval string on tos (dangerous, use with care)' ],
    'find'    : [ 'db', '( -- w ) Return token of next synonym' ],
    'floor'   : [ 'ex', '( a -- n ) Floor tos to integer' ],
    'for'     : [ 'br', '( n -- ) Repeat following loop n+1 times' ],
    'forget'  : [ 'db', '( -- ) Trim dictionary back to the following synonym' ],
    'here'    : [ 'db', '( -- w ) Return top of dictionary' ],
    'hex'     : [ 'io', '( -- ) Change to hexadecimal base' ],
    'i'       : [ 'br', '( -- a ) Duplicate top of return stack to tos' ],
    'if'      : [ 'br', '( f -- ) Skip the next true branch if tos is 0' ],
    'int'     : [ 'au', '( a -- n ) Change tos to integer' ],
    'is'      : [ 'cm', '( w -- ) Force next word to execute w. interpret only' ],
    'key'     : [ 'io', '( -- n) fetch one keystoke from input terminal' ],
    'log'     : [ 'ex', '( a -- b ) Return logarithmic of tos' ],
    'max'     : [ 'au', '( a b -- c ) Return larger of two tos items' ],
    'min'     : [ 'au', '( a b -- c ) Return smaller of two tos items' ],
    'mod'     : [ 'au', '( a b -- c ) Modulus 2nd item by tos' ],
    'ms'      : [ 'os', '( n -- ) Delay n milliseconds' ],
    'negate'  : [ 'au', '( a -- b ) Negate tos' ],
    'next'    : [ 'br', '( -- ) Decrement top of return stack. Exit loop if top of return stack is negative' ],
    'nip'     : [ 'ss', '( a b -- a ) Discard 2nd tos item' ],
    'or'      : [ 'au', '( a b -- c ) Bitwise OR of two tos items' ],
    'over'    : [ 'ss', '( a b -- a b a ) Duplicate 2nd tos item' ],
    'parse'   : [ 'cm', '( -- ) Prase out next token in input buffer' ],
    'pi'      : [ 'ex', '( -- pi ) Return PI' ],
    'pick'    : [ 'ss', '( i -- a ) Copy ith tos item to top' ],
    'pow'     : [ 'ex', '( a b -- c ) Return a to the bth power' ],
    'q@'      : [ 'cm', '( i -- a ) Return value of ith item in qf field of current word' ],
    'quit'    : [ 'os', '( -- ) Outer interpreter' ],
    'r@'      : [ 'br', '( -- a ) Duplicate top of return stack to tos' ],
    'r>'      : [ 'br', '( -- a ) Pop  return stack to tos' ],
    'random'  : [ 'ex', '( -- a ) Return a random number betwee 0 and 1' ],
    'repeat'  : [ 'br', '( -- ) Repeat begin loop' ],
    'roll'    : [ 'ss', '( i -- a ) Roll ith tos item to top' ],
    'rot'     : [ 'ss', '( a b c -- b c a ) Rotata 3rd tos item to top' ],
    '-rot'    : [ 'ss', '( a b c -- c a b ) Rotate tos to 3rd position' ],
    'see'     : [ 'db', '( -- ) Disassemble the following synonym' ],
    'sin'     : [ 'ex', '( a -- b ) Return sine of tos' ],
    'space'   : [ 'io', '( -- ) Display a space' ],
    'spaces'  : [ 'io', '( n -- ) Display n spaces' ],
    'sqrt'    : [ 'ex', '( a -- b ) Return square root of tos' ],
    'swap'    : [ 'ss', '( a b -- b a ) Swap two tos items' ],
    'tan'     : [ 'ex', '( a -- b ) Return tangent of tos' ],
    'then'    : [ 'br', '( -- ) Terminate an if-else-then branch structure' ],
    'time'    : [ 'os', '( -- ) Display system time string' ],
    'to'      : [ 'cm', '( n -- ) Change the value of next constant token to n. compile only' ],
    'u.r'     : [ 'io', '( a n -- ) Display unsinged a in n columns' ],
    'ucase!'  : [ 'io', '( n -- ) set input case sensitivity n=0 not sensitive' ],
    'until'   : [ 'br', '( f -- ) Repeat begin loop if tos  is 0' ],
    'variable': [ 'cm', '( -- ) Create a new variable with initial value of 0' ],
    'while'   : [ 'br', '( f -- ) Skip the following true branch if tos is 0' ],
    'words'   : [ 'db', '( -- ) Display names of all words in dictionary' ],
    'xor'     : [ 'au', '( a b -- c ) Bitwise XOR of two tos items' ]
}
function _category(name) {
    const _cat = {                            ///< category desc lookup
        ss: "Stack",  au: "ALU",    eq: "Compare", io: "IO",    li: "Literal",
        br: "Branch", mm: "Memory", cm: "Compile", db: "Debug", os: "OS",
        ex: "Math Ext."
    }
    const voc = _forth_voc[name] || null
    return voc ? _cat[voc[0]] : 'User Def.'
}
function _tooltip(name) {
    const voc = _forth_voc[name] || [ 'User', 'user defined' ]
    return `<li><a href="#"><div class="tip">${name}` +
        `<span class="tiptip">${voc[1]}</span></div></a></li>`
}
function _voc_tree(dict) {
    const voc = dict.reduce((r,v)=>{
        const c = _category(v.name)                ///< get category
        if (r[c]) r[c].push(v); else r[c] = [ v ]
        return r
    }, {})
    let div = ''
    Object.keys(voc).sort().forEach(k=>{
        div += `<ul class="tree"><li><a href="#">${k}</a><ul>`
        voc[k].forEach(v=>{ div += _tooltip(v.name) })
        div += '</ul></li></ul>'
    })
    return div
}
function show_voc(div) {
    div.innerHTML = _voc_tree(vm.dict)
    let tree = document.querySelectorAll('ul.tree a:not(:last-child)')
    tree.forEach(ul=>{
        ul.onclick = e=>{
            var pa = e.target.parentElement
            var cl = pa.classList
            if(cl.contains("open")) {
                cl.remove('open')
                pa.querySelectorAll(':scope .open').forEach(c=>{
                    c.classList.remove('open')
                })
            }
            else cl.add('open')
            e.preventDefault()
        }
    })
}
function colon_words() {
    let div = '<ul>'
    for (let i = vm.dict.length - 1;
         i >= 0 && vm.dict[i].name != 'boot'; --i) {
        div += `<li>${vm.dict[i].name}</li>`
    }
    return div+'</ul>'
}
