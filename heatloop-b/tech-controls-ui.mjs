import {projectSignature} from './tech-controls.mjs';

export function mountControls(state,onChange){
  const $=id=>document.getElementById(id);
  const fields={tEnabled:'enabled',tMode:'mode',tThread:'thread',tInternet:'internet'};
  function table(){
    $('tRooms').replaceChildren();
    state.controls.entries.forEach((entry,index)=>{
      const tr=document.createElement('tr');
      for(const [key,label] of [['room','Pomieszczenie'],['zone','Strefa'],['loops','Liczba pętli']]){
        const td=document.createElement('td'),input=document.createElement('input');
        input.type='text';input.value=entry[key];input.maxLength=key==='loops'?3:80;
        if(key==='loops')input.inputMode='numeric';
        input.setAttribute('aria-label',label+' '+(index+1));
        input.addEventListener('input',()=>{entry[key]=input.value;onChange()});
        td.append(input);tr.append(td);
      }
      const td=document.createElement('td'),button=document.createElement('button');
      button.type='button';button.textContent='Usuń';button.setAttribute('aria-label','Usuń pomieszczenie '+(index+1));
      button.onclick=()=>{state.controls.entries.splice(index,1);table();onChange()};td.append(button);tr.append(td);$('tRooms').append(tr);
    });
  }
  function refresh(){
    for(const [id,key] of Object.entries(fields)){
      if($(id).type==='checkbox')$(id).checked=state.controls[key];else $(id).value=state.controls[key];
    }
    $('tSettings').hidden=!state.controls.enabled;
    $('tInternet').disabled=state.controls.mode!=='wireless';
    table();
  }
  for(const [id,key] of Object.entries(fields))$(id).addEventListener('change',()=>{
    state.controls[key]=$(id).type==='checkbox'?$(id).checked:$(id).value;
    if(state.controls.mode==='wired')state.controls.internet=false;
    refresh();onChange();
  });
  $('tAdd').onclick=()=>{
    if(state.controls.entries.length>=200)return;
    state.controls.entries.push({room:'',zone:'',loops:''});table();onChange();
  };
  $('tFromProject').onclick=()=>{
    if(state.controls.entries.length&&!window.confirm('Zastąpić przypisania stref pomieszczeniami z projektu? Liczby pętli trzeba będzie wpisać ponownie.'))return;
    const rooms=[...state.rooms,...state.polygons].filter(r=>r.heatingType!=='radiators');
    state.controls.entries=rooms.map((r,i)=>({room:r.name,zone:r.name+' ['+(i+1)+']',loops:''}));
    state.controls.projectSignature=projectSignature(rooms);table();onChange();
  };
  refresh();return {refresh};
}
