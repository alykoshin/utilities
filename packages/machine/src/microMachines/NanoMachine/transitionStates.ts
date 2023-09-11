import {MicroStateMachine, NanoSchema} from "./index";
import {ResolvedTransitionContext} from "../../Transitions";
import {EINVALID_TRANSITION} from "../../errors";
import {debug} from "../../index";

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

type SubContext = ResolvedTransitionContext<any, any>

const cancel = (cancelTo: SubStateId, ctx: SubContext): SubStateId => {
  console.log(`! cancel >> [${cancelTo}]`)
  return cancelTo;
}

export const fsa: NanoSchema<SubStateId, SubContext> = {
  initial: 'from',
  // final: ['to'],
  states: {

    'from': (ctx: SubContext): SubStateId => {
      console.log('ctx?.from?.exit:', ctx?.from?.exit)
      if (typeof ctx?.from?.exit !== 'function' || ctx?.from?.exit(ctx)) {
        return "exiting" // next
      } else {
        // return 'from'; // cancel
        return cancel('from', ctx)
      }
    },

    'exiting': (ctx: SubContext): SubStateId => {
      console.log('ctx?.transition?.before:', ctx?.transition?.before)
      if (typeof ctx?.transition?.before !== 'function' || ctx?.transition?.before(ctx)) {
        return "before" // next
      } else {
        // return 'from'; // cancel
        return cancel('from', ctx)
      }
    },

    'before': (ctx: SubContext): SubStateId => {
      return "transition";
    },

    'transition': async (ctx: SubContext): Promise<SubStateId> => {
      if (typeof ctx.transition.action === 'function') {
        await ctx.transition.action(ctx);
      } else if (['string', 'number', 'undefined'].indexOf(typeof ctx.transition.action) >= 0) {
        await ctx.transition.action;
        debug(`[transition] action: "${ctx.transition.action}"`);
      } else {
        throw new EINVALID_TRANSITION(`Invalid transition action type: "${typeof ctx.transition.action}"`);
      }
      return "after";
    },

    'after': (ctx: SubContext): SubStateId => {
      return "exiting";
    },

    'entering': (ctx: SubContext): SubStateId => {
      return "to";
    },

    'to': _ => undefined,
  },
};


async function run() {

  const context: SubContext = {
    from: {
      exit: () => false, // true,
    },
    event: {id: 'id'},
    transition: {id: 'id', to: 'to'},
    to: {},
    context: null,
  }
  const m = new MicroStateMachine<SubStateId, ResolvedTransitionContext<any, any>>({schema: fsa, context});
  await m.exec();
  // console.log(m);
}

run();

