import {BaseTransitionId} from "../../Transitions";
import {BaseStateId} from "../../States";

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

// const subTransitions = [
//   'next',
//   'cancel',
// ] as const;
// export type SubTransitionId = typeof subTransitions[number];


// interface MicroTransitionFn<S extends BaseStateId, T extends BaseTransitionId> {
// (this: MicroMachine<S>, args: UnresolvedTransitionContext<S, T>): Promise<S> | S
interface MicroTransitionFn<S extends BaseStateId> {
  (this: MicroMachine<S>, args: any): Promise<S> | S
}

// type MicroTransitions<S extends BaseStateId, T extends BaseTransitionId> = {
//   [id in T]?: MicroTransitionFn<S, T>
// }


// interface MicroState<S extends BaseStateId, T extends BaseTransitionId> {
//   exec: {
//     (this: MicroMachine<S, T>, args: UnresolvedTransitionContext<S, T>): Promise<T> | T
//   }
//   transitions: MicroTransitions<S, T>
// }

// type MicroStates<S extends BaseStateId, T extends BaseTransitionId> = {
// [id in S]?: MicroTransitionFn<S, T>
type MicroStates<S extends BaseStateId> = {
  [id in S]?: MicroTransitionFn<S>
}


// export interface MicroSchema<S extends BaseStateId, T extends BaseTransitionId> {
export interface MicroSchema<S extends BaseStateId> {
  initial?: S,
  final?: S | S[],
  states: MicroStates<S>,
}


interface MicroMachineConstructorArguments<S extends BaseStateId> {
  schema: MicroSchema<S>
}


// export class MicroMachine<S extends BaseStateId, T extends BaseTransitionId> {
export class MicroMachine<S extends BaseStateId> {
  _current: S;
  _schema: MicroSchema<S>

  constructor({schema}: MicroMachineConstructorArguments<S>) {
    this._schema = schema;
    this.init();
  }

  init(): void {
    this._current = this._schema.initial;
  }

  async _exec(fromStateId: S): Promise<S> {
    const fromState = this._schema.states[fromStateId];
    if (!fromState) throw new Error(`Invalid event/transaction "${fromStateId}"`);

    const sId2 = await fromState.call(this, undefined);

    console.log(`[${fromStateId}] >> [${sId2}]`);
    return sId2;
  }

  async exec(): Promise<void> {
    this._current = await this._exec(this._current);
  }

}


export const fsa: MicroSchema<SubStateId> = {
  initial: 'from',
  final: ['to'],
  states: {
    'from': (ctx: any): SubStateId => {
      if ( ctx?.from?.exit !== 'function' || !ctx?.from?.exit(ctx) ) {
        return "exiting" // next
      } else {
        return 'from'; // cancel
      }
    },
    'exiting': (ctx): SubStateId => {
      if ('ctx.transition.before') {
        return "before"
      } else {
        return 'from';
      }
    },
    'before': (ctx): SubStateId => {
      return "transition";
    },
    'transition': (ctx): SubStateId => {
      return "after";
    },
    'after': (ctx): SubStateId => {
      return "exiting";
    },
    'entering': (ctx): SubStateId => {
      return "to";
    },
    'to': _ => undefined,
  },
};


async function run() {
  const m = new MicroMachine<SubStateId>({schema: fsa});
  await m.exec();
  // console.log(m);
}

run();

