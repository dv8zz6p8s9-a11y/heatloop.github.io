import {mountHelp} from './widget.mjs';
const css=new URL('./help.css',import.meta.url);if(!document.querySelector('link[data-heatloop-help]')){const link=document.createElement('link');link.rel='stylesheet';link.href=css.href;link.dataset.heatloopHelp='';document.head.append(link);}
mountHelp(document,{standalone:!!document.getElementById('help-root')});
