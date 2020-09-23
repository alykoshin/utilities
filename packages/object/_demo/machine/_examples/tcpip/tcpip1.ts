import Debug from 'debug';
import {Machine, States}  from '../../../../src/machine/'
import 'json5/lib/register';

Debug.enable('*');

const states: States<string,string> = require ('./states.json5');

// if (require.main === module) {

  async function run() {

    const machine1 = new Machine({ states: states, initial: 'closed', final: ['closed'] });
    console.log('validating...')
    machine1.validate();
    console.log('validated.')

    if (machine1.current !== 'closed') throw new Error('"closed" state expected');

    console.log('sending "activeOpen"');
    await machine1.transition('activeOpen');
    // @ts-ignore
    if (machine1.current !== 'synSent') throw new Error('"synSent" state expected');

    console.log('sending "rcvSyn"')
    /*const res =*/ await machine1.transition('rcvSyn');
    // @ts-ignore
    if (machine1.current !== 'synRcvd') throw new Error('"synRvd" state expected');

    console.log('DONE')

  }
  run();
// }

