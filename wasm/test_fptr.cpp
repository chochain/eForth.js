#include <stdio.h>

typedef uint16_t        U16;   ///< unsigned 16-bit integer
typedef uint16_t        IU;    ///< instruction pointer unit

#if 0
struct fop { virtual void operator()() = 0; };
template<typename F>
struct XT : fop {           ///< universal functor
    F fp;
    XT(F &f) : fp(f) {
        printf("%8p:XT(%8p)=%8p ", this, &f, &fp);  /// f is a temp
        uint8_t *cp = (uint8_t*)this;
        for (int i=0; i<8; i++) {
            printf("%02x ", *cp++);
        }
        printf("|fp=");
        cp = (uint8_t*)&fp;
        for (int i=0; i<8; i++) {
            printf("%02x ", *cp++);
        }
        printf("\n");
    }
    void operator()() __attribute__((always_inline)) { fp(); }
};
typedef fop* FPTR;          ///< lambda function pointer
struct Code {
    union {                 ///< either a primitive or colon word
        FPTR xt = 0;        ///< lambda pointer
        struct {            ///< a colon word
            U16 def:  1;    ///< colon defined word
            U16 immd: 1;    ///< immediate flag
            U16 len:  14;   ///< len of pfa
            IU  pfa;        ///< offset to pmem space
        };
    };
    const char *name = 0;   ///< name field
    
    template<typename F>    ///< template function for lambda
    Code(const char *n, F f, bool im=false) : name(n), xt(new XT<F>(f)) {
//        immd = im ? 1 : 0;
    }
};
#else
typedef void (*FPTR)();     ///< function pointer
struct Code {
    union {
        FPTR xt = 0;        ///< lambda pointer
        struct {            ///< a colon word
            IU  pfa;        ///< offset to pmem space (16-bit for 64K range)
            U16 len:  14;   ///< reserved
            U16 immd: 1;    ///< immediate flag
            U16 def:  1;    ///< colon defined word
        };
    };
    const char *name = 0;   ///< name field
    
    Code(const char *n, FPTR f, bool im=false) : name(n), xt(f) {
        immd = im ? 1 : 0;
    }
    Code() {}               ///< create a blank struct (for initilization)
};
#endif

static Code prim[] = {
    Code("abc", [](){ printf("abc"); }, true),
    Code("def", [](){ printf("def"); })
};

int main(int ac, char* av[]) {
    printf("here...\n");
    return 0;
}

extern "C" {
void forth(int i, char *cmd) {
    Code &c = prim[i];
    uint8_t *cp = (uint8_t*)&prim[i];
    printf("&c=%8p, cp=%8p, xt=%8p def=%d, imm=%d name=%8p name=%s ",
           &c, cp, (FPTR)((uintptr_t)c.xt & 0x3fffffff), c.def, c.immd, c.name, c.name);
    for (int i=0; i < 16; i++) {
        printf("%02x ", *cp++);
    }
    printf("|xt=");
    cp = (uint8_t*)((uintptr_t)c.xt & 0x3fffffff);
    for (int i=0; i < 8; i++) {
        printf("%02x ", *cp++);
    }
    printf(" => ");
    ((FPTR)((uintptr_t)c.xt & 0x3fffffff))();
    printf("\n");
}
}


