/**
 *
 * https://barrgroup.com/embedded-systems/how-to/introduction-hierarchical-state-machines
 *
 * https://xstate.js.org/docs/guides/hierarchical.html
 *
 */

import Debug from 'debug';
import {Machine, Schema, States}  from '../../'

Debug.enable('*');


const pedestrianStateIds = [
  'walk',
  'wait',
  'stop',
  'blinking',
] as const;
export type PedestrianStateIds = typeof pedestrianStateIds[number];

const mainStateIds = [
  'green',
  'yellow',
  'red',
  'red.blinking',
] as const;
export type MainStateIds = typeof mainStateIds[number];

const eventIds = [
  'timer',
  'PED_COUNTDOWN',
  'POWER_OUTAGE',
  'POWER_RESTORED',
] as const;
export type EventIds = typeof eventIds[number];


const pedestrianStates: Schema<PedestrianStateIds,EventIds> = {
  initial: 'walk',
  states: {
    walk: {
      transitions: {
        PED_COUNTDOWN: 'wait'
      }
    },
    wait: {
      transitions: {
        PED_COUNTDOWN: 'stop'
      }
    },
    stop: {},
    blinking: {}
  }
};


const schema: Schema<MainStateIds,EventIds> = {
  initial: 'green',
  final: [],
  states: {
    "green": {
      "transitions": {
        "timer": "yellow",
        POWER_OUTAGE: 'red.blinking',
        // POWER_RESTORED: 'red',
      },
    },
    "yellow": {
      "transitions": {
        "timer": "red",
        POWER_OUTAGE: 'red.blinking',
      },
    },
    "red": {
      "transitions": {
        "timer": "green",
        POWER_OUTAGE: 'red.blinking',
      },
    },
    "red.blinking": {
      "transitions": {
        POWER_OUTAGE: 'red.blinking',
        POWER_RESTORED: 'red',
      },
    },
  },
  // on: {
  //   POWER_OUTAGE: 'red.blinking',
  //   POWER_RESTORED: 'red',
  // },
}


async function run() {
  const machine = new Machine(schema);

  console.log('validating...')
  machine.validate();
  console.log('validated.')

  setInterval(async () => {
    await machine.transition('timer');
    console.log(`-->`, machine.current);
  }, 500);
  console.log('timer started...')
}
run();
