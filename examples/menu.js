///
/// simulate jQuery
///
const $ = (s)=>s[0]=='#' && !s.includes(' ') ?
      document.querySelector(s) : document.querySelectorAll(s)
///
/// menu system
///
const SHOW = 'polygon(0 0, 0 0, 0 100%, 0% 100%)'
const HIDE = 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)'
function menu_open(id) {
    $('.menu_pac').forEach(m=>{
        let sty = m.style
        if (m.id == id) {
            sty.opacity = 1
            sty.pointerEvents = 'all'
        }
        else {
            sty.opacity = 0
            sty.pointerEvents = 'none'
            menu_reset(m.id)            /// reset other menu_pac 
        }
    })
}
function menu_reset(id) {
    setTimeout(function () {
        let mm = $('#'+id + ' > .menu')
        for (let i=0; i < mm.length; i++) {
            let sty = mm[i].style
            sty.transform = `translateX(${i ? 100 : 0}%)`
            sty.clipPath  = i ? SHOW : HIDE
        }
    }, 300);
}
function menu_next(e) {
    let p  = e.target.parentNode
    let m0 = $('#'+p.id).style
    let m1 = $('#'+p.nextElementSibling.id).style
    m0.transform = 'translateX(-100%)'
    m0.clipPath  = SHOW
    m1.transform = 'translateX(0)'
    m1.clipPath  = HIDE
}
function menu_prev(e) {
    let p  = e.target.parentNode
    let m1 = $('#'+p.id).style
    let m0 = $('#'+p.previousElementSibling.id).style
    m1.transform = 'translateX(100%)'
    m1.clipPath  = SHOW
    m0.transform = 'translateX(0)'
    m0.clipPath  = HIDE
}
