import {Machine, States}  from '../../../src'

import { OrderStatus, OrderTransitions, adminStatuses, courierStatuses, allStatuses, } from './states'


// if (require.main === module) {

async function run() {

  const machine = new Machine({
    states: allStatuses,
    initial: OrderStatus.STATUS_PENDING,
    final: [ OrderStatus.STATUS_CANCELLED, OrderStatus.STATUS_DELIVERED ],
  });


  process.stdout.write('validating... ')
  await machine.validate();
  process.stdout.write('OK.\n')

  process.stdout.write(`machine.transition -> "${OrderStatus.STATUS_PLACED}"`);
  await machine.transition(OrderStatus.STATUS_PLACED);
  process.stdout.write(` (actual: "${machine.current}")\n`)
  if (machine.current !== OrderStatus.STATUS_PLACED) throw new Error(`"${OrderStatus.STATUS_PLACED}" expected`);

  process.stdout.write(`machine.transition -> "${OrderStatus.STATUS_PICKED_UP}"`)
  /*const res =*/ await machine.transition(OrderStatus.STATUS_PICKED_UP);
  process.stdout.write(` (actual: "${machine.current}")\n`)
  //
  // workaround for TypeScript error checking
  // @ts-ignore
  if (machine.current !== OrderStatus.STATUS_PICKED_UP) throw new Error(`"${STATUS_PICKED_UP}" status expected`);

  console.log('DONE')

}
run();
// }
