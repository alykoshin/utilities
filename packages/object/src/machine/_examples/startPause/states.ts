import {Machine, States}  from '../../'

export const initial = 'START';
export const final = ['END', 'ERROR'];

export const states: States<string,string> = {
  START: {
    transitions: {
      data: {
        to: 'START',
      },
      pause: 'PAUSED',
      end: 'END',
      error: 'ERROR'
    }
  },
  PAUSED: {
    transitions: {
      pause  : 'PAUSED',
      resume : 'START',
      error  : 'ERROR'
    },
  },
  ERROR: {},
  END: {},
};
