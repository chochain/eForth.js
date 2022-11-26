# eForth.js - eForth in Javascript

With Javascript implementation, Forth can be run in a web page. **eforth.js** is the one file you need.


## History - this is a project with interesting lineage.
* It started back in 2010 when **Cheahshen Yap** from Taiwan FIG sent the 100-line kernel, named **KsanaVM**, to **Dr. Ting**.
* **Shawn Chen** then took over the codebase and produced a graphic demo in SVFIG.
* **Brad Nelson** then introduced a web front-end to Dr. Ting sourcing from his ESP32Forth project.
* After working with Dr. Ting on his objectization of **ooeForth** and **EForth** for a month, I took interest in the 10 year old jeforth_301 and wiped up jeforth400 presented to Dr. Ting on 2021/8/8 (Taiwanese Father's Day) just for a kick and potential path forward.

  > <img src="https://chochain.github.io/eForth.js/docs/jeforth400_snip1.png">
* Dr. Ting didn't like the flashy front-end. He striped the sidebar, dropped dependency to CodeMirror, renamed it to jeforth614.js, but did included in his published document ceforth_403.doc and was kind enough to put me along side with him as the authors. (see ref below)
* After a minor touch-up to [jeforth615.js](./orig/jeforth615.html), Dr. Ting and I then switched focus on upgrading **ceForth** (C-based Forth) for Windows and ESP32, and finally targeting an FPGA with Don and Demitri of [AI & Robotics project](https://www.facebook.com/groups/1304548976637542). He worked tirelessly even from his sickbed and did not ever stop. Not until he finally succumb to the illness 2022/5/30.
* A few months of head-down cranking on [tensorForth](https://github.com/chochain/tensorForth), it is finally taking shape. I decided to take a breather and came back to review all the projects I've worked with Dr. Ting for the past year. In Thanksgiving Day, after looking at jeforth615 again, I've decided to call it **eForth.js** in memory of Dr. Ting.

Though I've never have the luck to meet him in person, the years of dedication and contribution he has to the Forth community is something I'll carry with me. As I told him once in the e-mail: "The name **eForth** will forever be associated with you, Dr. Ting".

### Documentation
* [ceforth_403.html](https://chochain.github.io/eForth.js/docs/ceforth_403.html) Dr. Ting's final work.

### Original
* [jeforth_301](https://chochain.github.io/eForth.js/orig/index_301.html) by Shawn Chen, 2010
* [jeforth615](https://chochain.github.io/eForth.js/orig/jeforth615.html) by Dr. Ting, 2021
* [download Word document ceforth_403.doc](.docs/ceforth_403.doc) by Dr. Ting, 2021
