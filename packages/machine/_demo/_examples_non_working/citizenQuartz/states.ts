/**
 *
 * https://www.inf.ed.ac.uk/teaching/courses/seoc/2005_2006/resources/statecharts.pdf
 * https://pdfs.semanticscholar.org/f874/bc7089c924961385e956a7eddcf2f4709c57.pdf
 */

import {Machine, Schema, States}  from '../../../src'

const alarmDisplayStateIds = [
  'on',
  'off',
  'exit_alarm1',
  'exit_update1',
] as const;
type AlarmDisplayStateIds = typeof alarmDisplayStateIds[number];

const buttonIds = [
  'a',
  'b',
  'c',
  'd',
] as const;
type ButtonIds = typeof buttonIds[number];

// union type equivalent
const displayStateIds = [
  'time',
  'date',
  'alarm1',
  'alarm2',
  'chime',
  'stopwatch',
] as const;
type DisplayStateIds = typeof displayStateIds[number];

const displayTransitionIds/*: Partial<ButtonIds>[]*/ = [
  'a',
  'd',
  'timer2min',
] as const;
type DisplayTransitionIds = typeof displayTransitionIds[number];

const timerIds/*: Partial<ButtonIds>[]*/ = [
  'timer2min',
] as const;
type TimerIds = typeof timerIds[number];



export const start: DisplayStateIds = 'time';
export const final: DisplayStateIds[] = [];

export const displayStates: States<DisplayStateIds, ButtonIds|TimerIds> = {
// export const displayStates: Schema<ButtonIds, DisplayTransitionIds> = {
//   initial: 'time',
//   final: [],
//   states: {
  time: {
    transitions: {
      d: 'date',
      a: 'alarm1',
    }
  },
  date: {
    transitions: {
      d: 'time',
      timer2min: 'time',
    },
  },
  alarm1: {
    transitions: {
      a: 'alarm2',
      // ':after': 'alarm2',
      // c: [
      //   'alarm1states',
      //   ({context}) => context.alarm1 ? 'off' : 'on',
      // ],
      // c: ({context}) => context.alarm1 ? 'alarm1states.on' : 'alarm1states.off',
    },
    // states: alarm1,
  },
  alarm2: {
    transitions: {
      a: 'chime',
    },
  },
  chime: {
    transitions: {
      a: 'stopwatch',
    },
  },
  stopwatch: {
    transitions: {
      a: 'time',
    },
  },
  // },
};


const alarm1: Schema<AlarmDisplayStateIds,ButtonIds|TimerIds> = {
  // initial: ({ context }) => context.alarm1 ? 'on' : 'off',
  final: [ 'exit_alarm1' ],
  states: {
    off: {
      transitions: {
        d: 'on',
        c: 'exit_update1',
        a: 'exit_alarm1',
      },
    },
    on: {
      transitions: {
        d: 'on',
        c: 'exit_update1',
        a: 'exit_alarm1',
        // ____: 'exit',
        // _: {
        //   emit: 'a',
        // },
      },
    },
    exit_alarm1: {

    },
    exit_update1: {
      states: update1,
    }
  },
};
console.log('alarm1:', alarm1)

const update: Schema<string,ButtonIds|TimerIds> = {
  initial: 'sec',
  final: [ 'exit' ],
  states: {
    'sec': {
      transitions: {
        c: '1min',
        b: 'alarm1',
      },
    },
    '1min': {
      transitions: {
        c: '10min',
        b: 'alarm1',
      },
    },
    '10min': {
      transitions: {
        c: 'hr',
        b: 'alarm1',
      },
    },
    'hr': {
      transitions: {
        c: 'mon',
        b: 'time',
      },
    },
    'mon': {
      transitions: {
        c: 'date',
        b: 'time',
      },
    },
    'date': {
      transitions: {
        c: 'day',
        b: 'time',
      },
    },
    'day': {
      transitions: {
        c: 'year',
        b: 'time',
      },
    },
    'year': {
      transitions: {
        c: 'mode',
        b: 'time',
      },
    },
    'mode': {
      transitions: {
        c: 'exit',
        b: '../time',
      },
    },
    'exit': {
    },
  },
};

const update1: Schema<string,ButtonIds|TimerIds> = {
  initial: '',
  final: [],
  states: {
    'hr': {
      transitions: {
        c: '10min',
        b: 'alarm1',
      },
    },
    '10min': {
      transitions: {
        c: '1min',
        b: 'alarm1',
      },
    },
    '1min': {
      transitions: {
        c: 'alarm1states',
        b: 'alarm1',
      },
    },
  },
};


interface Context {
  alarm1: boolean,
  t1: string,
  alarm2: boolean,
  t2: string,
}

const context: Context = {
  alarm1: true,
  t1: '15:00',
  alarm2: true,
  t2: '16:00',
}

export const displayBeepStates: States<string,string> = {
  display: {
    transitions: {
      // t1: {
      //   before: ({ context }) => context.alarm1 && (!context.alarm2 || context.t1 !== context.t2),
      //   to: 'alarm1beeps',
      // },
      t1: {
        to: ({ context }) => {
          if ( context.alarm1 && (!context.alarm2 || context.t1 !== context.t2) ) return 'alarm1-beeps';
          else if ( context.alarm2 && (!context.alarm1 || context.t1 !== context.t2) ) return 'both-beeps';
          else return undefined;
        },
      },
      t2: {
        before: ({ context }) => context.alarm1 || (!context.alarm2 && context.t1 !== context.t2),
        to: 'alarm2-beeps',
      },
    },
  },
  // 'alarms-beeps': {
  //   transitions: {
  'alarm1-beeps': {
    transitions: {
      to: '',
    },
    // states: {
    //   activated:
    // }
  },
  'alarm2-beeps': {
    transitions: {
    },
  },
  'both-beeps': {
    transitions: {
    },
  },
  // },
  // },
}
