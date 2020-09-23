import {Machine, States}  from '../../'

import { OrderStatus, OrderTransitions, adminStatuses, courierStatuses, allStatuses, } from './states'


// if (require.main === module) {

async function run() {

  const machine = new Machine({
    states: allStatuses,
    initial: OrderStatus.STATUS_PENDING,
    final: [ OrderStatus.STATUS_CANCELLED, OrderStatus.STATUS_DELIVERED ],
  });


  console.log('validating...')
  await machine.validate();
  console.log('validated.')

  console.log(`machine.transition >> "${OrderStatus.STATUS_PLACED}"`);
  await machine.transition(OrderStatus.STATUS_PLACED);
  console.log(`machine.current :: "${machine.current}"`)
  if (machine.current !== OrderStatus.STATUS_PLACED) throw new Error(`"${OrderStatus.STATUS_PLACED}" expected`);

  console.log(`machine.transition >> "${OrderStatus.STATUS_PICKED_UP}"`)
  /*const res =*/ await machine.transition(OrderStatus.STATUS_PICKED_UP);
  console.log(`machine.current :: "${machine.current}"`)
  // @ts-ignore
  if (machine.current !== OrderStatus.STATUS_PICKED_UP) throw new Error(`"${STATUS_PICKED_UP}" status expected`);

  console.log('DONE')

}
run();
// }
