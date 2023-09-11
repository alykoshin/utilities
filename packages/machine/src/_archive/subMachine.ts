import {Schema} from "../types";
import {BaseTransitionId, TransitionResolverFn} from "../Transitions";
import {BaseStateId} from "../States";

const subStates = [
  'from',
  'exiting',
  'before',
  'transition',
  'after',
  'entering',
  'to',
] as const;
export type SubStateId = typeof subStates[number];

const subTransitions = [
  'exit',
  'before',
  'transition',
  'after',
  'enter',
  'cancel',
] as const;
export type SubTransitionId = typeof subTransitions[number];

export const fsa: Schema<SubStateId, SubTransitionId> = {
  initial: 'from',
  final: ['to'],
  states: {
    'from': {
      transitions: {
        // 'exit': 'exiting',
        'exit': {
          to: "exiting",
          // before: args =>  true,
        },
      },
    },
    'exiting': {
      transitions: {
        'before': 'before',
        'cancel': 'from',
      },
    },
    'before': {
      transitions: {
        'transition': 'transition',
        'cancel': 'from',
      },
    },
    'transition': {
      transitions: {
        'after': 'after',
      },
    },
    'after': {
      transitions: {
        'enter': 'entering',
      },
    },
    'entering': {
      transitions: {
        'after': 'to',
      },
    },
    'to': {},
  },
};
