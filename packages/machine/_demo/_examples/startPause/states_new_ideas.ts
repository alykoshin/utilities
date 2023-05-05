import {Machine, Schema, States} from '../../../src'

export const initial = 'START';
export const final = ['END', 'ERROR'];

// export const states: States<string,string> = {
export const states = {
  START: {
    $id: 'start',
    $transitions: {},
    data: {
      $
      $to: 'START',
    },
    pause: 'PAUSED',
    end: 'END',
    error: 'ERROR',
    $exit: ()=>{},
  },
  PAUSED: {
    transitions: {
      pause: 'PAUSED',
      resume: 'START',
      error: 'ERROR',
    },
  },
  ERROR: {},
  END: {},
};
