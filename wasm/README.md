### C code
<pre>
#include <stdio.h>

int main() {
    printf("Hello World!\n");
    return 0;
}

int my_func(int n, char *str) {
    printf("my_func(%d, '%s') called\n", n, str);
    return 0;
}
</pre>

### JS glue
<pre>
    {{{ SCRIPT }}}
    <button id='my-button'>Click me</button>
    <script type='text/javascript'>
      document.getElementById('my-button').addEventListener('click', () => {
          var my_func = Module.cwrap('my_func', 'number', ['number', 'string'])
          my_func(123, 'my string')
          my_func(456, 'string2')
      })
    </script>
</pre>

### To compile
> emcc -o hello.html hello.c --shell-file minimal.html -sEXPORTED_FUNCTIONS=_main,_my_func -sEXPORTED_RUNTIME_METHODS=ccall,cwrap
