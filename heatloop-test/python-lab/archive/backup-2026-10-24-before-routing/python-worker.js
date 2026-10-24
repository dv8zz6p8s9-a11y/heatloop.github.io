// HeatLoop Python LAB: Python/Shapely really executes in the browser Web Worker.
const VERSION='314.0.7';
let runtime;
let ready=false;
const commands=[];
const INDEX=`https://cdn.jsdelivr.net/pyodide/v${VERSION}/full/`;
async function boot(){
  try{
    self.postMessage({kind:'progress',message:'Pobieranie interpretera Python…'});
    const {loadPyodide}=await import(`${INDEX}pyodide.mjs`);
    runtime=await loadPyodide({indexURL:INDEX});
    self.postMessage({kind:'progress',message:'Ładowanie biblioteki Shapely / GEOS…'});
    await runtime.loadPackage('shapely');
    const response=await fetch(new URL('./geometry.py',import.meta.url),{cache:'no-store'});
    if(!response.ok)throw Error(`Brak kodu silnika Python: HTTP ${response.status}`);
    const source=await response.text();
    runtime.runPython(source);
    const versions=runtime.runPython("import sys, shapely; sys.version.split()[0]+' / Shapely '+shapely.__version__");
    ready=true;
    self.postMessage({kind:'ready',versions});
    for(const m of commands.splice(0))evaluate(m);
  }catch(err){self.postMessage({kind:'error',message:String(err?.message||err)});}
}
function evaluate(data){
  try{
    if(!ready){commands.push(data);return;}
    runtime.globals.set('payload_json',JSON.stringify(data.payload));
    const raw=runtime.runPython(`import json\n_input=json.loads(payload_json)\n_rules=CircuitRules(**_input['rules'])\n_output=preflight(_input['room'], _input['route'], _rules)\njson.dumps(_output, allow_nan=False)`);
    runtime.globals.delete('payload_json');
    self.postMessage({kind:'result',seq:data.seq,result:JSON.parse(raw)});
  }catch(err){
    self.postMessage({kind:'eval-error',seq:data.seq,message:String(err?.message||err)});
  }
}
self.addEventListener('message',e=>{if(e.data?.kind==='calculate')evaluate(e.data)});
boot();
