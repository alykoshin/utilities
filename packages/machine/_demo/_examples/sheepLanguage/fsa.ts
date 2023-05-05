import Debug from 'debug';

import {Machine, States, Schema, EINVALID_TRANSITION_ID }  from '../../../src'
import { initial, final, fsa, swapper, StateIds, InputVocabulary,  } from './states'

// Debug.enable('*');
const fsaMachine = new Machine(fsa);

function atFinal(machine: Machine<any,any>) {
  return machine.final.indexOf( machine.current ) >= 0;
}

async function test(input: string/*|string[]|number[]*/) {
  try {
    fsaMachine.init();
    for (const char of input) {
      await fsaMachine.transition(<InputVocabulary> char);
    }
  } catch(e) {
    if (e instanceof EINVALID_TRANSITION_ID) {
      // console.log('EINVALID_TRANSITION_ID');
      return false;
    }
    else throw e;
  }
  // console.log(`fsaMachine.current: ${fsaMachine.current}, fsaMachine.final: [${fsaMachine.final}]`);
  return atFinal(fsaMachine);
}


const context = {
  // result: '',
};
const swapTranduceMachine = new Machine({ ...swapper, context });

async function transduce(input: string) {
  let result = '';
  try {
    swapTranduceMachine.init();
    // context.result = '';
    for (const char of input) {
      const res = await swapTranduceMachine.transition(<InputVocabulary> char);
      result += res;
    }
  } catch(e) {
    if (e instanceof EINVALID_TRANSITION_ID) {
      // console.log('EINVALID_TRANSITION_ID', e);
      return false;
    }
  }
  return result;
  // return (swapTranduceMachine.final.indexOf( swapTranduceMachine.current ) >= 0);
}


async function run() {
  const words = [
    'ba!',
    'baa!',
    'baaa!',
    'baaaa!',
    'abb',
  ];
  for (const w of words) {
    console.log(`"${w}" ->`);
    console.log(`-> test:      "${ await test(w)      }"`);
    console.log(`=> transduce: "${ await transduce(w) }"`);
  }
}
run();
