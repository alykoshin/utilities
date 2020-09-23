/**
 *
 * http://www.btechonline.org/2012/12/finite-state-machine-that-adds-two.html
 *
 */

import {Machine, States, Schema}  from '../../../../src/machine/'

const stateIds = [
  'q0', // carry bit = 0
  'q1', // carry bit = 1
] as const;
export type StateIds = typeof stateIds[number];

const inputs = [
  '00',
  '01',
  '10',
  '11',
] as const;
export type Inputs = typeof inputs[number];

export const fsa: Schema<StateIds,Inputs> = {
  initial: 'q0',
  final: [ 'q0', 'q1' ],
  states: {
    'q0': {
      transitions: {
        '00': {
          to: 'q0',
          action: 0,
        },
        '01': {
          to: 'q0',
          action: 1,
        },
        '10': {
          to: 'q0',
          action: 1,
        },
        '11': {
          to: 'q1',
          action: 0,
        },
      },
    },
    'q1': {
      transitions: {
        '00': {
          to: 'q0',
          action: 1,
        },
        '01': {
          to: 'q1',
          action: 0,
        },
        '10': {
          to: 'q1',
          action: 0,
        },
        '11': {
          to: 'q1',
          action: 1,
        },
      },
    },
  },
};
