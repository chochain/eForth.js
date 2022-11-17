#include <stdio.h>

int main() {
    printf("Hello World!\n");
    return 0;
}

//extern "C" {
int my_func(int n, char *str) {
    printf("my_func(%d, '%s') called\n", n, str);
    return 0;
}
//}
