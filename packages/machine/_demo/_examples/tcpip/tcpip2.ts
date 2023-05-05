import Debug from 'debug'
import 'json5/lib/register';
import {Machine, Schema, States}  from '../../../src'
// import JSON5 from 'json5'

Debug.enable('*');

const states: States<string,string> = require ('./states.json5');

// if (require.main === module) {

  const events = [
    'activeOpen',
    'rcvSyn',
    'rcvAckOfSyn',
    'close',
    'rcvAckOfFin',
    'rcvFin',
    'timeout',
  ];

  async function run() {

    const machine2 = new Machine({ states: states, initial: 'closed', final: ['closed'] });
    // machine2.validate();
    for (const evt of events) {
      console.log(evt)
      setTimeout(() => {
        machine2.transition(evt);
      },1);
    }
    await machine2.execute();
    if (machine2.current !== 'closed') throw new Error('closed state expected');

  }
  run();
// }

