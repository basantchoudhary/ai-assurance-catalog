#!/usr/bin/env node
/*
 * Smoke-tests the built page's client script against a DOM stub that returns
 * null for ids with no markup — exactly as a browser does.
 *
 * Written after shipping a page whose catalog list was empty: a checkbox was
 * referenced in JS but never added to the markup, so attaching listeners threw
 * before render() ran. An earlier stub auto-created every element, which is
 * why it passed. A test harness more forgiving than the browser is worse than
 * no harness.
 */
const fs=require("fs");
const s=fs.readFileSync(process.argv[2],"utf8");
const js=s.split("<script>").pop().split("</script>")[0];
const payload=JSON.parse(s.split("window.__AAC__ = ")[1].split("</script>")[0].replace(/;\s*$/,""));
const present=new Set([...s.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));
const els={};
const mk=id=>{
  if(!present.has(id)) return null;              // <-- the whole point
  return els[id]||(els[id]={id,innerHTML:"",textContent:"",value:"",checked:false,dataset:{},
    addEventListener(t,f){(this._h=this._h||{})[t]=f},
    querySelectorAll:()=>[],closest:()=>null,setAttribute(){}});
};
global.window={__AAC__:payload};
global.document={getElementById:mk,querySelectorAll:()=>[]};
new Function("window","document",js)(global.window,global.document);
const out=els["catalog-out"];
if(!out||!out.innerHTML.length) { console.error("FAIL: catalog list is empty"); process.exit(1); }
console.log("cards:",(out.innerHTML.match(/class="case"/g)||[]).length,"| count:",els["count"].textContent,
            "| build rows:",(els["buildtbl"].innerHTML.match(/<tr/g)||[]).length);
els["tabs"]._h.click({target:{closest:()=>({dataset:{a:"A3"},setAttribute(){}})}});
console.log("A3 tab ->",els["count"].textContent);
els["howonly"].checked=true; els["q"]._h.input();
console.log("has build options ->",els["count"].textContent);
console.log("OK");
