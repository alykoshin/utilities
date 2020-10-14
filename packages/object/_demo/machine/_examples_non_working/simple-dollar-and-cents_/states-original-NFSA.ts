/**
 *
 * http://spraakdata.gu.se/svedd/teaching/finite-state-technology-nlp2015.pdf
 *
 */

import {Machine, States, Schema}  from '../../../../src/machine/'

const stateIds = [
  'q0',
  'q1',
  'q2',
  'q3',
  'q4',
  'q5',
  'q6',
  'q7',
] as const;
export type StateIds = typeof stateIds[number];

const inputs = [
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  //
  'ten',
  'twenty',
  'thirty',
  'forty',
  'fifty',
  'sixty',
  'seventy',
  'eighty',
  'ninety',
  //
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'eighteen',
  'nineteen',
] as const;
export type Inputs = typeof inputs[number];

export const fsa: Schema<StateIds,Inputs> = {
  initial: 'q0',
  final: [ 'q3', 'q7' ],
  states: {
    'q0': {          // if "0" carry from previous step
      transitions: {
        'one': 'q2',
        'two': 'q2',
        'three': 'q2',
        'four': 'q2',
        'five': 'q2',
        'six': 'q2',
        'seven': 'q2',
        'eight': 'q2',
        'nine': 'q2',
        //
        'ten': 'q2',
        'twenty': 'q2',
        'thirty': 'q2',
        'forty': 'q2',
        'fifty': 'q2',
        'sixty': 'q2',
        'seventy',
        'eighty',
        'ninety',
        //
        'eleven',
        'twelve',
        'thirteen',
        'fourteen',
        'fifteen',
        'sixteen',
        'eighteen',
        'nineteen',

      },
    },
  },
};
