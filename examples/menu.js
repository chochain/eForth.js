///
/// simulate jQuery
///
const $ = (s)=>s[0]=='#' && !s.includes(' ') ?
      document.querySelector(s) : document.querySelectorAll(s)
///
/// menu system
///
function menu_open(id) {
    $(".menu_pac").forEach(m=>{
        console.log(m)
        let sty = m.style
        if (m.id == id) {
            sty.opacity = 1;
            sty.pointerEvents = "all";
        }
        else {
            sty.opacity = 0;
            sty.pointerEvents = "none";
//            menu_reset(m.id)            /// reset other menu_pac 
        }
    })
}
function menu_reset(id) {
    setTimeout(function () {
        let mm  = $('#'+id + ' > .menu')
        let cnt = 0
        mm.forEach(m=>{
            if (cnt++==0) {
                m.style.transform = "translateX(0)"
                m.style.clipPath  = "polygon(0 0, 100% 0, 100% 100%, 0% 100%)"
            }
            else {
                m.style.transform = "translateX(100%)"
                m.style.clipPath  = "polygon(0 0, 0 0, 0 100%, 0% 100%)"
            }
        })
    }, 300);
}
function menu_next(e) {
    let m0 = $('#'+e.target.parentNode.id).style
    let m1 = $('#'+e.target.parentNode.nextElementSibling.id).style
    m0.transform = "translateX(-100%)"
    m0.clipPath  = "polygon(0 0, 0 0, 0 100%, 0% 100%)";
    m1.transform = "translateX(0)"
    m1.clipPath  = "polygon(0 0, 100% 0, 100% 100%, 0% 100%)"
}
function menu_prev(e) {
    let m1 = $('#'+e.target.parentNode.id).style
    let m0 = $('#'+e.target.parentNode.previousElementSibling.id).style
    m1.transform = "translateX(100%)"
    m1.clipPath  = "polygon(0 0, 0 0, 0 100%, 0% 100%)"
    m0.transform = "translateX(0)"
    m0.clipPath  = "polygon(0 0, 100% 0, 100% 100%, 0% 100%)"
}
