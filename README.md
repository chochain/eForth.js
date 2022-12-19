# eForth.js - <em>Forth in Javascript</em>

With a Javascript implementation, the entire Forth can be had in a single browser page on your desktop or cellphone.

Provided here is <em style='color:#fc4'>**eforth.js**</em>, the only file you need! Well, if you insist, maybe an extra <em>**index.html**</em> to wrap it up or to customize to your heart's content. Simply copy both of them from the root directory shown above to your local directory. Click on <em>**index.html**</em> and you have a Forth engine ready to play. Without surprise, you should get something like the left hand side snip below.

We've come a long way from the good old green terminal days. So, with some HTML stuffs, it can certainly be more mordern! Checkout src/eforth8.html as a demo that I'm still working on. With the same <em style='color:#fc4'>**eforth.js**</em>, you can create whatever presentation you fancy...
 <pre><img
   width='24%' src='https://chochain.github.io/eForth.js/docs/eforth8_snip_0.png'>.....<img
   width='36%' src='https://chochain.github.io/eForth.js/docs/eforth8_snip_1.png'></pre>

Should you plan to incorporate <em style='color:#fc4'>**eforth.js**</em> in a larger project, or maybe you care for modulization in fashion of the ES6's new feature i.e. ease of source code maintenance
* check the /modules directory for individual functional areas.
* <em>eforth_w_module.html</em> in the root is provided as an example to import modules
* note that, without a bundler (i.g. Webpack, Browsify, ...) to tie modules together, one will need a web server to push all the modules to your web-browser
  * a script serv.py in /tests directory is provided to kick off a Python3's simple server for the purpose. i.e.
    <pre>> <em>python3 tests/serv.py</em> from root directory to start you web server
    > enter <em>http://localhost:8000/eforth_w_module.html</em> into your browser
    </pre>

## Installation - <font size=-0.2>Simple as 1-2-3</font>.
1. Save or cut-n-paste [eforth.js](https://raw.githubusercontent.com/chochain/eForth.js/master/eforth.js) and [index.html](https://raw.githubusercontent.com/chochain/eForth.js/master/index.html) to any of your local directory,
2. Find the <em>**index.html**</em> we've just saved in your FileExplorer (Windows), iFile (Mac OS), or Files (Linux),
3. Click it, and your favorate browser should open automatically with a page with eForth screen shown.
It's that easy. Have fun!

## Documentation - <font size=-0.2>It stays with Dr. Ting's explaination and word list mostly.</font>
* download [jeforth614.ppt](https://chochain.github.io/eForth.js/docs/jeforth614.ppt) or [jeforth614.doc](https://chochain.github.io/eForth.js/docs/jeforth614.doc) by Dr. Ting, 2021, or
* view [ceforth_403.pdf](https://chochain.github.io/eForth.js/docs/ceforth_403.pdf), Dr. Ting's final work.

## TODO List
* 3D Turtle
  + consult https://github.com/andonutts/donatello
* ESP32 interface - add digital and analog IO (for LED, Servo,...)

## History - <font size=-0.2>An interesting lineage</font>
* It started back in 2011 when **Cheahshen Yap** from Taiwan FIG sent the 100-line kernel, named jeForth, to **Dr. Ting**.
* **Sam Suan Chen**, took over the codebase (called project-k) and produced a graphic demo in SVFIG. The project took on its own path [here](https://github.com/hcchengithub/project-k) now.
* **Brad Nelson**, introduced a web front-end to Dr. Ting sourcing from his ESP32Forth project.
* It sat on the shelf for years until Dr. Ting restarted his interest in Jan. 2021, completed **jeforth614**, and presented in SVFIG in May *(see ref. below)
* In Aug. 2021, after working with Dr. Ting on his objectization of **ooeForth** (aka EForth.java) for a month, without knowing jeforth614's existance, I took interest in the 10 year old jeforth_301 and wiped it up to jeforth400. Presented to Dr. Ting on 2021/8/8 (Taiwanese Father's Day) just for a kick and a potential project path forward.
  > <img width="70%" src="https://chochain.github.io/eForth.js/docs/jeforth400_snip1.png">
* Dr. Ting did not like the flashy front-end at all. He striped the sidebar, dropped dependency to CodeMirror, and renamed it jeforth615.js. He, however, did include it in the published document **ceforth_403.doc*** and was kind enough to put me along side with him as the authors. *(see ref. below)
* After he merged html and js into one file [jeforth616.html](./orig/jeforth616.html), Dr. Ting and I switched focus onto upgrading **ceForth** (C-based Forth) for Windows and ESP32 *[here](https://github.com/chochain/eforth), and finally targeting an FPGA with Don and Demitri of [AI & Robotics project](https://www.facebook.com/groups/1304548976637542). He worked tirelessly even from his sickbed and did not ever stop. Not until he finally succumb to the illness 2022/5/30.
* A few months of head-down cranking on [tensorForth](https://github.com/chochain/tensorForth), it is finally taking shape. I decided to take a breather and came back to review all the projects I've worked with Dr. Ting for the past year. In Thanksgiving Day, after looking at jeforth615 again, I've decided to call it **eForth.js** in memory of Dr. Ting.

Though I've never had the chance to meet him in person, the years of dedication and contribution he has to the Forth community is something I'll carry with me. As I told him once in the e-mail: "The name **eForth** will forever be associated with you, Dr. Ting".

### Dr. Ting's Original jeForth live demo
* [jeforth](https://github.com/yapcheahshen/jeforth) by Cheah Shen Yap and Sam Chen, 2012 [try jeforth_301 here](https://chochain.github.io/eForth.js/orig/index_301.html)
* [try jeforth616 in your browser](https://chochain.github.io/eForth.js/orig/jeforth616.html) by Dr. Ting, 2021

### Prior Art (on GitHub) - Many others have the same idea as well, each with a little different implemenation. You see one!
* [jorth](https://github.com/ramunas/jorth) by Ramunas Forsberg Gutkovas, 2012 (small and clean)
* [FORTH-on-browser](https://github.com/nishio/FORTH-on-browser) by Nishio Hirokazu, 2012 (detailed with jQuery)
* [fjs](https://github.com/mark-hahn/fjs) by Mark Hahn, 2013 (scoped beyond Forth, more like Factor)
* [EasyForth](https://github.com/skilldrick/easyforth) by Nick Morgan, 2015, with instructions [try it here](https://skilldrick.github.io/easyforth)
* [jsforth](https://github.com/eatonphil/jsforth) by Phil Eaton, 2015 (short word list)
* [hjsorth](https://github.com/RauliL/hjsorth) by Rauli Laine, 2015 (formal and fully documented)
* [jsforth](https://github.com/rjose/jsforth) by Rino Jose, 2015 (C like, handles HTML) 
* [ForthHub/forth](https://github.com/ForthHub/forth) or [here](https://github.com/drom/forth) by Aliaksei Chapyzhenka, 2015
* [jsForth](https://github.com/paxl13/jsForth) by Xavier LaRue, 2016 (jonesForth and more)
* [jsForth](https://github.com/brendanator/jsForth) by Brendan Maginnis, 2016, [try it  here](https://brendanator.github.io/jsForth/)
* [jsforth](https://github.com/Bushmills/jsforth) by Bushmills, 2019, [try it here](http://forthworks.com/temp/jsforth/jsforth80x25.html)
* [simpleForth](https://github.com/ajlopez/SimpleForth) by AJ Lopez, 2020 (inspired by fjs)
* [sforth](https://github.com/tptb/sforth) by Bernd Amend 2022 (Forth like script, compiled to JS)

Other Refs From Lars Brinkhoff's 2017 list
* https://github.com/marianoguerra/ricardo-forth, 2016 (WASM, based on Buzzard2)
* https://github.com/fatman2021/forthjs (a few lines)
* https://github.com/cmwt/forth-js (just started)
* https://github.com/connorberry/forth4js (4 functions)
* https://github.com/graham/fifth (a few functions)
* https://github.com/12pt/fifth.js (started)

