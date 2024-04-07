# eForth.js - <em>Forth in Javascript</em>

eForth implemented in 100% Javascript. An interfactive Forth shell can be run from within a single web page on your desktop or even cellphone.

There is a good collection of prior art (at the bottom of this page). Here is my version of a new wheel, <em style='color:#fc4'>**eforth.js**</em>, the only file you need! Well, maybe an extra <em>**index.html**</em> to wrap it up is nicer. So, simply copy both of them from the root directory shown above to your local directory. Click on <em>**index.html**</em> and you have a live Forth engine ready to play with. Without surprise, you should get something like the left hand side snip below. Try the live demo [here](https://chochain.github.io/eForth.js/index.html) which runs 100% in your brower once fetched.

The good old green screen days are long gone. Add some HTML stuffs and your work looks instantly better!Just point your <script> tag to <em style='color:#fc4'>**eforth.js**</em> and you can create whatever presentation you fancy...  Check **src/eforth8.html**, my work in progress but is quite usable as a template. 
 <pre><img
   width='32%' src='https://chochain.github.io/eForth.js/docs/eforth8_snip_0.png'>.....<img
   width='48%' src='https://chochain.github.io/eForth.js/docs/eforth8_snip_1.png'></pre>

## Installation - <font size=-0.2>Simple as 1-2-3</font>.
1. From root directory shown above, download or cut-n-paste <em style='color:#fc4'>**eforth.js**</em> and <em style='color:#fc4'>**index.html**</em> to any of your local directory,
2. Find the <em style='color:#fc4'>**index.html**</em> we've just saved in your FileExplorer (Windows), iFile (Mac OS), or Files (Linux),
3. Open it with your favorite browser. It should bring on the eForth page like the left-hand snip shown above.

<b>It's that easy. Have fun!</b>

## Fancier UI - with CodeMirror, tooltips, ...
As shown in the right-hand side picture above
1. Clone this repository to your local directory,
2. In your FileExplore, find <em style='color:#fc4'>**src/eforth8.html**</em> below the root directory,
3. Click it, and there you have it. A nicer UI, and optionally, you can open browser's Web Developer Tools on the side to monitor console output. The editor shows up once you click the 'pencil icon' in the function bar atop. You can try this live demo [src/eforth8.html](https://chochain.github.io/eForth.js/src/eforth8.html)

  |icon|description|
  |---|---|
  |home|clear text|
  |file+|create new file in your local directory|
  |file|open a file|
  |file<-|save your updated file to your local directory|
  |boot|forget all words defined and clear text|
  |down arrow|execute selected/high-lighted section of Forth code|
  |run|execute entire file shown|

Note if you kick-off the **eforth8.html** page from a webserver (as described below), the embedded Forth in the page also can be executed.

## Javascript Modules
Should you plan to incorporate <em style='color:#fc4'>**eforth.js**</em> in a larger project, or maybe you care for modulization in fashion of the ES6's new feature i.e. ease of source code maintenance
* check the /modules directory for individual functional areas.
* <em>eforth_w_module.html</em> in the root is provided as an example to import modules
* note that, without a bundler (i.g. Webpack, Browsify, ...) to tie modules together, one will need a web server to push all the modules to your web-browser
* Python3 has a simple built-in http server that you can use. i.e.

From root directory starting your web server

    python3 -m http.server

On you browser, enter

    http://localhost:8000/eforth_w_module.html

## Performance
Javascript brings us the simplicity. Just point the web page to your *eforth.js* and that's it. Open the DevTool in your browser, you can trace, benchmark, even single-step the code.
But what about the performance compared to WASM trans-coded from pure C implementation? Well, it's slow! Running at about 1/5 of WASM, and about 1/10 to raw C executable. I think it's OK to have a shell that one can interact with on the browser. However, only you know what you need the best. So, if a faster eForth on the web is required, check my <b>weForth</b> [here](https://github.com/chochain/weForth)

## Documentation
* The genesis and philosophy of eForth, [eForth and Zen](https://chochain.github.io/eforth/docs/eForthAndZen.pdf) by Dr. Ting
* Download [jeforth614.ppt](https://chochain.github.io/eForth.js/docs/jeforth614.ppt) or [jeforth614.doc](https://chochain.github.io/eForth.js/docs/jeforth614.doc) by Dr. Ting, 2021, or
* Read Dr. Ting's final work [ceforth_403.pdf](https://chochain.github.io/eforth/docs/ceforth_403.pdf)

## History - <font size=-0.2>The lineage</font>
* It started back in 2011 when **Cheahshen Yap** from Taiwan FIG sent the 100-line kernel, named **jeForth**, to **Dr. Chen-Hanson Ting**, the master of **eForth** family.
* **Sam Suan Chen**, took over the codebase (called project-k) and produced a graphic demo in SVFIG. The project took on its own path [here](https://github.com/hcchengithub/project-k) now.
* **Brad Nelson**, introduced a web front-end to Dr. Ting sourcing from his ESP32Forth project.
* It sat on the shelf for years until Dr. Ting restarted his interest in Jan. 2021, completed **jeforth614**, and presented in SVFIG in May *(see ref. below)
* In Aug. 2021, after working with Dr. Ting on his objectization of **ooeForth** (aka EForth.java) for a month, without knowing *jeforth614*'s existance, I took interest in the 10 year old *jeforth_301* and wiped it up to **jeforth400**. Presented to Dr. Ting on 2021/8/8 (Taiwanese Father's Day) just for a kick and a potential project path forward.
  > <img width="70%" src="https://chochain.github.io/eForth.js/docs/jeforth400_snip1.png">
* Dr. Ting did not like the flashy front-end at all. He striped the sidebar, dropped dependency to CodeMirror, and renamed it jeforth615.js. He, however, did include it in the published document **ceforth_403.doc*** and was kind enough to put me along side with him as the authors. *(see ref. below)
* After he merged html and js into one file [jeforth616.html](https://chochain.github.io/orig/jeforth616.html), Dr. Ting and I switched focus onto upgrading **ceForth** (C-based Forth) for Windows and ESP32 [here](https://github.com/eforth), and finally targeting an FPGA with Don and Demitri of [AI & Robotics project](https://www.facebook.com/groups/1304548976637542). He worked tirelessly even from his sickbed and did not ever stop. Not until he finally succumb to the illness 2022/5/30.
* After a few months of head-down cranking on [tensorForth](https://github.com/chochain/tensorForth), I felt that it's time to take a look at all the projects I've worked with Dr. Ting before my memory starting to fade. In Thanksgiving Day, after reviewing jeforth615, I've decided to call it **eForth.js** in memory of Dr. Ting.

Though I've never had the chance to meet him in person, the years of dedication and contribution he has to the Forth community is something I'll carry with me. As I told him once in the e-mail: "The name **eForth** will forever be associated with you, Dr. Ting".

### Dr. Ting's Original jeForth live demo
* [jeforth](https://github.com/yapcheahshen/jeforth) by Cheah Shen Yap and Sam Chen, 2012, [try jeforth_301 here](https://chochain.github.io/eForth.js/orig/index_301.html)
* [try jeforth616 in your browser](https://chochain.github.io/eForth.js/orig/jeforth616.html) by Dr. Ting, 2021

### Prior Art (on GitHub)
  Many others have the same idea as well, each with a little different implemenation. Proof of the saying in the Forth community, instead of seen one seen them all, here you see many of the ones!
* [jorth](https://github.com/ramunas/jorth) by Ramunas Forsberg Gutkovas, 2012 (small and clean)
* [FORTH-on-browser](https://github.com/nishio/FORTH-on-browser) by Nishio Hirokazu, 2012 (detailed with jQuery)
* [fjs](https://github.com/mark-hahn/fjs) by Mark Hahn, 2013 (scoped beyond Forth, more like Factor)
* [EasyForth](https://github.com/skilldrick/easyforth) by Nick Morgan, 2015, with instructions [try it here](https://skilldrick.github.io/easyforth)
* [jsforth](https://github.com/eatonphil/jsforth) by Phil Eaton, 2015 (short word list)
* [hjsorth](https://github.com/RauliL/hjsorth) by Rauli Laine, 2015 (formal and fully documented)
* [jsforth](https://github.com/rjose/jsforth) by Rino Jose, 2015 (C like, handles HTML) 
* [ForthHub/forth](https://github.com/ForthHub/forth) or [here](https://github.com/drom/forth) by Aliaksei Chapyzhenka, 2015
* [jsForth](https://github.com/paxl13/jsForth) by Xavier LaRue, 2016 (jonesForth and more)
* [jsForth](https://github.com/brendanator/jsForth) by Brendan Maginnis, 2016, [try it  here](https://brendanator.github.io/jsForth)
* [jsforth](https://github.com/Bushmills/jsforth) by Bushmills, 2019, [try it here](http://forthworks.com/temp/jsforth/jsforth80x25.html)
* [simpleForth](https://github.com/ajlopez/SimpleForth) by AJ Lopez, 2020 (inspired by fjs)
* [sforth](https://github.com/tptb/sforth) by Bernd Amend 2022 (Forth like script, compiled to JS)

Other Refs From Lars Brinkhoff's 2017 list
* https://github.com/marianoguerra/ricardo-forth, 2016 (WASM, based on Buzzard2)
* https://github.com/fatman2021/forthjs (a few lines)
* https://github.com/cmwt/forth-js (just started)
* https://github.com/connorberry/forth4js (4 functions)
* https://github.com/graham/fifth (a few functions)

