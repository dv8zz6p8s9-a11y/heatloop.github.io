import test from 'node:test';
import assert from 'node:assert/strict';
import {answer} from '../engine.mjs';
import {scenarios} from './scenarios.mjs';
assert.equal(scenarios.length,100,'Exactly 100 intent scenarios');
for(const [i,s] of scenarios.entries())test(`Scenario ${String(i+1).padStart(3,'0')}: ${String(s.question).slice(0,85)}`,()=>{
 const actual=answer(s.question,s.module,s.context);
 assert.equal(actual.kind,s.expected,JSON.stringify(actual));
 if(s.id)assert.equal(actual.article?.id,s.id);
 if(s.choices)assert.deepEqual(actual.choices.map(a=>a.id),s.choices);
});
