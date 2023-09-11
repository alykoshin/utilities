import {BaseTransitionId, UnresolvedTransitionContext} from "../Transitions";
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
  'next',
  'cancel',
] as const;
export type SubTransitionId = typeof subTransitions[number];


interface MicroTransitionFn<S extends BaseStateId, T extends BaseTransitionId> {
  (this: MicroMachine<S, T>, args: UnresolvedTransitionContext<S, T>): Promise<S> | S
}

type MicroTransitions<S extends BaseStateId, T extends BaseTransitionId> = {
  [id in T]?: MicroTransitionFn<S, T>
}


interface MicroState<S extends BaseStateId, T extends BaseTransitionId> {
  exec: {
    (this: MicroMachine<S, T>, args: UnresolvedTransitionContext<S, T>): Promise<T> | T
  }
  transitions: MicroTransitions<S, T>
}

type MicroStates<S extends BaseStateId, T extends BaseTransitionId> = {
  [id in S]?: MicroState<S, T>
}


export interface MicroSchema<S extends BaseStateId, T extends BaseTransitionId> {
  initial?: S,
  final?: S | S[],
  states: MicroStates<S, T>,
}


interface MicroMachineConstructorArguments<S extends BaseStateId, T extends BaseTransitionId> {
  schema: MicroSchema<S, T>
}


export class MicroMachine<S extends BaseStateId, T extends BaseTransitionId> {
  _current: S;
  _schema: MicroSchema<S, T>

  constructor({schema}: MicroMachineConstructorArguments<S, T>) {
    this._schema = schema;
    this.init();
  }

  init<S extends BaseStateId, T extends BaseTransitionId>(): void {
    this._current = this._schema.initial;
  }

  async exec(eventId: T): Promise<void> {
    const sId1 = this._current;
    const sDef = this._schema.states[sId1];
    if (!sDef) throw new Error(`Invalid state "${sId1}"`);

    const tDef = sDef.transitions[eventId];
    if (!tDef) throw new Error(`Invalid event/transaction "${eventId}"`);

    const sId2 = await tDef.call(this, undefined);
    this._current = sId2;

    // console.log(`[${sId1}] -> ${eventId} -> [${sId2}]`)
    console.log(`${eventId} >> [${sId1}] -> [${sId2}]`)
  }

}


export const fsa: MicroSchema<SubStateId, SubTransitionId> = {
  initial: 'from',
  final: ['to'],
  states: {
    'from': {
      exec: (ctx): SubTransitionId => {
        if ('ctx.from.exit') {
          return "next"
        } else {
          return 'cancel';
        }
      },
      transitions: {
        'next': (): SubStateId => {
          return 'before';
        },
        'cancel': (): SubStateId => {
          return 'from';
        },
      },
    },
    'exiting': {
      transitions: {
        'next': (): SubStateId => {
          return 'before';
        },
        'cancel': (): SubStateId => {
          return 'from';
        },
      },
    },
    'before': {
      transitions: {
        'next': (): SubStateId => {
          return 'transition';
        },
        'cancel': (): SubStateId => {
          return 'from';
        },
      },
    },
    'transition': {
      transitions: {
        'next': (): SubStateId => {
          return 'after';
        },
      },
    },
    'after': {
      transitions: {
        'next': (): SubStateId => {
          return 'entering';
        },
      },
    },
    'entering': {
      transitions: {
        'next': (): SubStateId => {
          return 'to';
        },
      },
    },
    'to': {},
  },
};


async function run() {
  const m = new MicroMachine<SubStateId, SubTransitionId>({schema: fsa});
  await m.exec('next');
  // console.log(m);
}

run();

