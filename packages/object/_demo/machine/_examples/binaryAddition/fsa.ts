import Debug from 'debug';
// Debug.enable('*');
const debug = Debug('machine');

import {Machine, States, Schema, EINVALID_TRANSITION_ID }  from '../../../../src/machine/'
import { fsa, StateIds, Inputs,  } from './states'

const fsaMachine = new Machine(fsa);

function atFinal(machine: Machine<any,any>) {
  return machine.final.indexOf( machine.current ) >= 0;
}

const context = {
  // result: '',
};

async function run() {

  function dec2bin(dec){
    return (dec >>> 0).toString(2);
  }

  const testCases: { n1: number, n2: number, expected: number}[] = [
    { n1: 0b0000, n2: 0b0000, expected: 0b0000, },
    { n1: 0b0000, n2: 0b0001, expected: 0b0001, },
    { n1: 0b0001, n2: 0b0000, expected: 0b0001, },
    { n1: 0b0001, n2: 0b0001, expected: 0b0010, },

    { n1: 0b1111, n2: 0b0000, expected: 0b1111, },
    { n1: 0b0000, n2: 0b1111, expected: 0b1111, },
    { n1: 0b0011, n2: 0b1100, expected: 0b1111, },

    { n1: 0b0011, n2: 0b0011, expected: 0b0110, },
    { n1: 12, n2: 34, expected: 46, },
  ];
  for (const testCase of testCases) {
    const addiator = new Machine({ ...fsa, context });
    const { n1, n2, expected } = testCase;

    process.stdout.write(`${n1}(10)/${dec2bin(n1)}(2) + ${n2}(10)/${dec2bin(n2)}(2)  =`);

    let b1 = 0;
    let t1 = n1;
    let t2 = n2;
    let b2 = 0;

    let resultBinStr = '';
    let oneMorePass = false;
    do {

      const shiftRight = (b: number) => { return {
        value: Math.trunc(t1 / 2),
        carry: t1 % 2,
      }; };

      b1 = t1 % 2;
      t1 = Math.trunc(t1 / 2);

      b2 = t2 % 2;
      t2 = Math.trunc(t2 / 2);

      const resultBit = await addiator.transition(<Inputs> (''+b1+b2));

      // resultBinStr = resultBinStr+resultBit;
      resultBinStr = resultBit + resultBinStr;

      // if ( t1 === 0 && t2 === 0) {
      //   if (!oneMorePass) {
      //     oneMorePass = !oneMorePass;
      //   } else {
      //     break
      //   }
      // }

      // console.log(`t1:${t1}, b1:${b1}, t2:${t2}, b2:${b2}, `)

    // } while (true);
    } while ( (t1!==0 || t2!==0) || (b1!==0 || b2!==0) );

    process.stdout.write(`  ${parseInt(resultBinStr,2)}(10) / ${resultBinStr}(2) -- expected: ${expected}(10) \n`);
    if (parseInt(resultBinStr,2) !== expected) throw new Error('Result doesn\'t match expected value');

    // for (let i=0; i<bits; i++) {
    //
    //   console.log(`-> test:      "${await test(w)}"`);
    //   console.log(`=> transduce: "${await transduce(w)}"`);
    // }
  }
}
run();
