/**
 *
 * http://www.btechonline.org/2012/12/finite-state-machine-that-adds-two.html
 *
 */

import {Machine, States, Schema}  from '../../../src'

const stateIds = [
  'q0', // carry bit = 0
  'q1', // carry bit = 1
] as const;
export type StateIds = typeof stateIds[number];

const inputs = [
  '00', // 0+0
  '01', // 0+1
  '10', // 1+0
  '11', // 1+1
] as const;
export type Inputs = typeof inputs[number];

export const fsa: Schema<StateIds,Inputs> = {
  initial: 'q0',
  final: [ 'q0', 'q1' ],
  states: {
    'q0': {          // if "0" carry from previous step
      transitions: {
        '00': {      // 0+0
          to: 'q0',  // carry "0"
          action: 0, // result bit is "0"
        },
        '01': {      // 0+1
          to: 'q0',  // carry "0"
          action: 1, // result bit is "1"
        },
        '10': {      // 1+0
          to: 'q0',  // carry "0"
          action: 1, // result bit is "1"
        },
        '11': {      // 1+1
          to: 'q1',  // carry is "1"
          action: 0, // result bit is "0"
        },
      },
    },
    'q1': {          // if "1" carry from previous step
      transitions: {
        '00': {      //
          to: 'q0',  //
          action: 1, //
        },
        '01': {      //
          to: 'q1',  //
          action: 0, //
        },
        '10': {      //
          to: 'q1',  //
          action: 0, //
        },
        '11': {      //
          to: 'q1',  //
          action: 1, //
        },
      },
    },
  },
};
