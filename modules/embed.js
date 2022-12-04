///
/// embedded Forth processor (this changes window object)
///
export default function listen(exec) {
    window.addEventListener('load', async ()=>{             ///< load event handler
        let slst = document.getElementsByTagName('script')  ///< get HTMLcollection
        for (let i = 0; i < slst.length; i++) {             /// * walk thru script elements
            let s = slst[i]
            if (s.type != 'application/forth') continue     /// * handle embedded Forth 
            if (s.src) {                                    /// * handle nested scripts
                await fetch(s.src)                          /// * fetch remote Forth script
                    .then(r=>r.text())                      /// * get Forth commands
                    .then(cmd=>exec(cmd))               /// * send it to Forth VM
            }
            else exec(s.innerText)
        }
    })
}
