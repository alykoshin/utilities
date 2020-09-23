import Debug from 'debug';

import {Machine, States}  from '../../'

import states from './states.json'

Debug.enable('*');


const machine = new Machine({ states: states, initial: 'green', final: [] });

console.log('validating...')
machine.validate();
console.log('validated.')

setInterval(async () => {
  await machine.transition('timer');
  console.log(`-->`, machine.current);
}, 500);
console.log('timer started...')
