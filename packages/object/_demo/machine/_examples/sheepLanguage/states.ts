/**
 *
 * https://gawron.sdsu.edu/compling/course_core/lectures/transducer_intro.htm
 * https://people.cs.umass.edu/~brenocon/inlp2014/lectures/09-fsa.pdf
 *
 */

import {Machine, States, Schema}  from '../../../../src/machine/'

const stateIds = [
  0, 1, 2, 3, 4,
] as const;
export type StateIds = typeof stateIds[number];

const inputVocabulary = [
  'b', 'a', '!',
] as const;
export type InputVocabulary = typeof inputVocabulary[number];

export const initial: StateIds = 0;
export const final: StateIds[] = [4];

export const fsa: Schema<StateIds,InputVocabulary> = {
  initial,
  final,
  states: {
    0: {
      transitions: {
        'b': 1
      }
    },
    1: {
      transitions: {
        'a': 2
      }
    },
    2: {
      transitions: {
        'a': 3
      }
    },
    3: {
      transitions: {
        'a': 3,
        '!': 4,
      }
    },
    4: {
    },
  },
};

export const swapper: Schema<StateIds,InputVocabulary> = {
  initial,
  final,
  states: {
    0: {
      transitions: {
        'b': {
          to: 1,
          action: 'a', // b:a
        }
      }
    },
    1: {
      transitions: {
        'a': {
          to: 2,
          action: 'b', // a:b
        }
      }
    },
    2: {
      transitions: {
        'a': {
          to: 3,
          action: 'b', // a:b
        }
      }
    },
    3: {
      transitions: {
        'a': {
          to: 3,
          action: 'b', // a:b
        },
        '!': {
          to: 4,
          action: '!', // !:!
        }
      }
    },
    4: {
    },
  },
};
