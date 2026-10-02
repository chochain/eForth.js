function file_new(fname) {
    let fn = prompt('Create new file', 'untitled.f')
    if (fn) $(fname).innerHTML = fn
}
function file_load(flst, fname) {
    if (flst.length != 1) return
    let fn = flst[0]
    $('#fname').innerHTML = fn.name
    let rdr = new FileReader()
    rdr.onload = (e)=>cm.setValue(e.target.result)
    rdr.readAsText(fn);
}
function file_save(fsave, content, fn_default) {
    let blob = new Blob([ content ], { type: 'text/plain' })
    let lnk  = $(fsave)
    let fn   = prompt('Save to file name', $(fn_default).innerHTML)
    if (!fn) return
    lnk.download = fn
    lnk.href = window.webkitURL ?
        window.webkitURL.createObjectURL(blob) :
        window.URL.createObjectURL(blob)
    lnk.click()
}
