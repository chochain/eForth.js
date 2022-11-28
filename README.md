# eForth.js - eForth in Javascript

With Javascript implementation, Forth can be run from within a single web page.

Good news! **eforth.js** is the only file you need! Well, if you insist, maybe an extra index.html to wrap it up. Copy both of them from the root directory shown above to your local directory. Click on index.html and you have a Forth engine ready to play.

## History - a project with interesting lineage.
* It started back in 2011 when **Cheahshen Yap** from Taiwan FIG sent the 100-line kernel, named jeForth, to **Dr. Ting**.
* **Sam Suan Chen**, took over the codebase (called project-k) and produced a graphic demo in SVFIG. The project took on its own path [here](https://github.com/hcchengithub/project-k) now.
* **Brad Nelson**, introduced a web front-end to Dr. Ting sourcing from his ESP32Forth project.
* It sat on the shelf for years until Dr. Ting restarted his interest in Jan. 2021, completed **jeforth614**, and presented in SVFIG in May *[ppt here](https://chochain.github.io/eForth.js/docs/jeforth614.ppt).
* In Aug. 2021, after working with Dr. Ting on his objectization of **ooeForth** (aka EForth.java) for a month, without knowing jeforth614's existance, I took interest in the 10 year old jeforth_301 and wiped it up to jeforth400. Presented to Dr. Ting on 2021/8/8 (Taiwanese Father's Day) just for a kick and a potential project path forward.
  > <img width="70%" src="https://chochain.github.io/eForth.js/docs/jeforth400_snip1.png">
* Dr. Ting did not like the flashy front-end at all. He striped the sidebar, dropped dependency to CodeMirror, and renamed it jeforth615.js. He, however, did include it in the published document **ceforth_403.doc*** and was kind enough to put me along side with him as the authors. *(see ref. below)
* After he merged html and js into one file [jeforth616.html](./orig/jeforth616.html), Dr. Ting and I switched focus onto upgrading **ceForth** (C-based Forth) for Windows and ESP32 *[here](https://github.com/chochain/eforth), and finally targeting an FPGA with Don and Demitri of [AI & Robotics project](https://www.facebook.com/groups/1304548976637542). He worked tirelessly even from his sickbed and did not ever stop. Not until he finally succumb to the illness 2022/5/30.
* A few months of head-down cranking on [tensorForth](https://github.com/chochain/tensorForth), it is finally taking shape. I decided to take a breather and came back to review all the projects I've worked with Dr. Ting for the past year. In Thanksgiving Day, after looking at jeforth615 again, I've decided to call it **eForth.js** in memory of Dr. Ting.

Though I've never had the chance to meet him in person, the years of dedication and contribution he has to the Forth community is something I'll carry with me. As I told him once in the e-mail: "The name **eForth** will forever be associated with you, Dr. Ting".

### Documentation
* view [ceforth_403.doc in HTML format](https://chochain.github.io/eForth.js/docs/ceforth_403.html) or download [ceforth_403.pdf](https://chochain.github.io/eForth.js/docs/ceforth_403.pdf) of Dr. Ting's final work.

### Original
* [try jeforth_301 in your browser](https://chochain.github.io/eForth.js/orig/index_301.html) by Shawn Chen, 2010
* [try jeforth616 in your browser](https://chochain.github.io/eForth.js/orig/jeforth616.html) by Dr. Ting, 2021
* [download Word document ceforth_403.doc](https://chochain.github.io/docs/ceforth_403.doc) by Dr. Ting, 2021
