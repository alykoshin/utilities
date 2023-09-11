/*

https://github.com/davidkpiano/xstate/tree/master/packages/xstate-fsm#machine-config

https://www.npmjs.com/package/@opuscapita/fsm-workflow-core#automatic-conditions

 */

import Debug from 'debug';
import {Deferred} from '@utilities/async';

import {
  EINVALID_CURRENT_STATE,
  EINVALID_EVENT,
  EINVALID_FINAL_STATE,
  EINVALID_START_STATE,
  EINVALID_STATE,
  EINVALID_STATE_ID_VALUE,
  EINVALID_TRANSITION,
  EINVALID_TRANSITION_ID,
  EINVALID_TRANSITION_TO,
  EMACHINE_ERROR,
  ETRANSITION_REJECTION
} from './errors';
import type {Context, InputEvent, InputEventId, ResolvedInputEvent, Schema,} from "./types";
import type {BaseStateId, ResolvedState, State, StateDefinition, States,} from "./States";
import type {StateEnterHandler, StateExitHandler} from "./States";
import type {
  BaseTransitionId,
  ResolvedTransitionContext,
  ResolvedTransitionObject,
  TransitionActionResult,
  TransitionDefinition,
  TransitionDefinitionObject
} from "./Transitions";
import {TransitionAfterHandler, TransitionBeforeHandler} from "./Transitions";
import {validate} from "./validate";

export {State, States, Schema}

export const debug = Debug('machine');


//

/*
export class BaseStateClass<StateId extends BaseStateId, TransitionId extends BaseTransitionId, DataModel, Options> {
  machine: Machine<StateId, TransitionId>
  dataModel: DataModel
  options: Options

  // energyExpense: 1
  constructor(machine: Machine<StateId, TransitionId>, dataModel: DataModel, options: Options) {
    this.machine = machine;
    this.dataModel = dataModel;
    this.options = options;
  }

  protected castEvent(event: InputEvent<StateId, TransitionId>) {
    return this.machine.transition(event);
  }
}
*/

//

// export type Nodes<NodeId extends BaseStateId, TransitionId extends BaseTransitionId> = {
//   [id in NodeId]: State<NodeId, TransitionId>
// }
//
//
// class Nodes <StateId extends BaseStateId,Node,Nodes> {
//   _nodes: Nodes
//   constructor ({ nodes }: { nodes: Nodes}) {
//     this._nodes = nodes;
//   }
//   protected _getNode(nodeId: NodeId): Node {
//     return this._nodes[nodeId];
//   }
// }

const stateToText = (state) => `${state.id}` + (state.name ? ` "${state.name}"` : ``)

interface BaseMachineConstructorArguments<S extends BaseStateId, T extends BaseTransitionId> {
  states: States<S, T>
  initial?: S
}

class BaseMachine<S extends BaseStateId, T extends BaseTransitionId> {
  protected _current: S
  public _states: States<S, T>

  constructor({states, initial}: BaseMachineConstructorArguments<S, T>) {
    this._current = initial;
    this._states = states;
  }

  // public getState(stateId: StateId): State<StateId, TransitionId>|never {
  //   return this._getState(stateId);
  // }

  // public async transition(id: TransitionId): StateId {
  //   const state = states[this.state];
  // }

}

//

interface MachineConstructorArguments<S extends BaseStateId, T extends BaseTransitionId> extends Schema<S, T> {
  context?: Context,
  validation?: boolean,
}


export class Machine<S extends BaseStateId, T extends BaseTransitionId> extends BaseMachine<S, T> {
  validation: boolean = true;
  protected readonly DEFAULT_START_STATE_NAME = <S>'start';
  protected readonly DEFAULT_FINAL_STATE_NAMES = <S[]>['final'];
  // protected states: States<StateId, TransitionId>
  public _initial: S = this.DEFAULT_START_STATE_NAME
  protected _context: Context;
  protected _deferredExecute: Deferred<TransitionActionResult<S, T>, EMACHINE_ERROR>

  constructor({states, initial, final, context, validation = true}: MachineConstructorArguments<S, T>) {
    super({states, initial});
    if (!states) throw new Error('parameter "states" must be defined.');
    this._states = states;   // state definitions
    this._initial = initial ?? <S>this.DEFAULT_START_STATE_NAME;
    this._final = Array.isArray(final)
      ? final
      : final
        ? [final]
        : <S[]>this.DEFAULT_FINAL_STATE_NAMES;
    this._current = /*current ||*/ this._initial;
    this._context = /*current ||*/ context;
    this.validation = validation;
    debug(`[constructor] initial: ${initial}, final: [${this._final.join(',')}]`);
  }

  // protected _current: StateId = this.DEFAULT_START_STATE_NAME
  public get current(): S {
    return this._current
  }

  public _final: S[] = this.DEFAULT_FINAL_STATE_NAMES

  // reachable (fsm)
  // calculate all states can reach each other states. the result is in the form of {STATE1: {STATE2: [event path from S1 to S2]}}
  //
  // terminal (fsm)
  // return the list of states that cannot reach another state.
  //
  // livelock (fsm, [terminal])
  // get a list of states that cannot reach a terminal state.

  public get final(): S[] {
    return this._final
  }

  public async init(): Promise<void> {
    this._current = this._initial;
    this._deferredExecute = null;
    if (this.validation) {
      await validate(this);
    }
  }

  public async execute(): Promise<TransitionActionResult<S, T>> {
    await this.init();
    this._deferredExecute = new Deferred();
    return this._deferredExecute.promise;
  }

  public getState(stateId: S, E?: typeof EINVALID_STATE): ResolvedState<S, T> | never {
    if (typeof E === 'undefined') E = EINVALID_STATE;
    const stateDefinition = this._getState(stateId, E);
    return this._resolveState(stateId, stateDefinition);
  }

  public getTransition(stateId: S, transitionId: T): TransitionDefinition<S, T> {
    const state = this._getState(stateId);
    return this._getStateTransition(state, transitionId);
  }

  async _resolveTransition(event: ResolvedInputEvent<S, T>, from: State<S, T>, transitionId: T, transition: TransitionDefinition<S, T>): Promise<ResolvedTransitionObject<S, T>> {

    let resolvedTransition: ResolvedTransitionObject<S, T>;

    switch (typeof transition) {
      case 'string':
      case 'number':
      case 'boolean':
      case 'symbol':
      case 'bigint': {
        const transitionTo: S = transition;
        resolvedTransition = {
          id: transitionId,
          to: transitionTo,
        };
        break;
      }
      case 'object': {
        const transitionTo: S = await this._resolveTransitionTo({event, from, transition});
        resolvedTransition = {
          ...transition,
          id: transitionId,
          to: transitionTo,
        };
        // transitionObject = <TransitionDefinitionObject<StateId,TransitionId>> transition;
        break;
      }
      case 'function':
        // transitionObject = { to: transition };
        // debug(`[validate]     \\--> ${transitionId.padEnd(15)} --> function() /ignored during validation/`);
        // continue;
        // const result = await transition();
        resolvedTransition = await this._resolveTransition(event, from, transitionId, transition)
        break;
      case 'undefined':
      default:
        throw new EINVALID_TRANSITION();
    }
    // res1.id = transitionId;
    debug('_resolveTransition():', resolvedTransition);
    return resolvedTransition
  }

  async _execCancel(ctx: ResolvedTransitionContext<S, T>): Promise<void> {
    throw new ETRANSITION_REJECTION(`Transition ${ctx.transition.id} not allowed by from.exit()`);
    // return Promise.reject(new ETRANSITION_REJECTION(`Transition ${id} not allowed by from.exit()`));
    // return this._current;
  }

  // async _execStateExit(ctx: ResolvedTransitionContext<S, T>): Promise<void> {
  //   if (typeof ctx.from.exit === 'function') {
  //     const allowed = await ctx.from.exit(ctx);
  //     if (allowed === false) {
  //       debug(`[transition] from:exit reject from: "${this._current}" transition: "${ctx.transition.id}" to: "${ctx.transition.to}"`);
  //       await this._execCancel(ctx);
  //     }
  //   }
  // }
  //
  // async _execTransitionBefore(ctx: ResolvedTransitionContext<S, T>): Promise<void> {
  //   if (typeof ctx.transition.before === 'function') {
  //     const allowed = await ctx.transition.before(ctx);
  //     if (allowed === false) {
  //       debug(`[transition] transition:before reject from: "${this._current}" transition: "${ctx.transition.id}" to: "${ctx.transition.to}"`);
  //       await this._execCancel(ctx);
  //       // throw new ETRANSITION_REJECTION(`Transition ${ctx.transition.id} not allowed by transition.before()`);
  //       // // return Promise.reject(new ETRANSITION_REJECTION(`Transition ${id} not allowed by transition.before()`));
  //       // // return this._current;
  //     }
  //   }
  // }

  async _execPreMethod(method: StateExitHandler<S, T> | TransitionBeforeHandler<S, T> | undefined, ctx: ResolvedTransitionContext<S, T>): Promise<void> {
    // if (typeof ctx.transition.after === 'function') {
    //   await ctx.transition.after(ctx);
    // }
    if (typeof method === 'function') {
      const allowed = await method(ctx);
      if (allowed === false) {
        debug(`[transition] from:exit or transition:before reject from: "${this._current}" transition: "${ctx.transition.id}" to: "${ctx.transition.to}"`);
        await this._execCancel(ctx);
        // throw new ETRANSITION_REJECTION(`Transition ${ctx.transition.id} not allowed by transition.before()`);
        // // return Promise.reject(new ETRANSITION_REJECTION(`Transition ${id} not allowed by transition.before()`));
        // // return this._current;
      }
    }
  }

  // async __resolve(action: )

  async _execTransitionAction(ctx: ResolvedTransitionContext<S, T>): Promise<TransitionActionResult<S, T>> {
    let result = undefined;

    if (typeof ctx.transition.action === 'function') {
      result = await ctx.transition.action(ctx);

    } else if (['string', 'number', 'undefined'].indexOf(typeof ctx.transition.action) >= 0) {
      result = ctx.transition.action;
      debug(`[transition] action: "${ctx.transition.action}"`);

    } else {
      throw new EINVALID_TRANSITION(`Invalid transition action type: "${typeof ctx.transition.action}"`)

    }
    return result;
  }

  async _execPostMethod(method: TransitionAfterHandler<S, T> | StateEnterHandler<S, T> | undefined, ctx: ResolvedTransitionContext<S, T>): Promise<void> {
    if (typeof ctx.transition.after === 'function') {
      await ctx.transition.after(ctx);
    }
  }

  // async _execPostMethod2(method: 'transition.after'|'to.enter', ctx: ResolvedTransitionContext<S, T>): Promise<void> {
  //   if (typeof ctx.transition.after === 'function') {
  //     await ctx.transition.after(ctx);
  //   }
  // }

  // async _execTransitionAfter(ctx: ResolvedTransitionContext<S, T>): Promise<void> {
  //   // if (typeof ctx.transition.after === 'function') {
  //   //   await ctx.transition.after(ctx);
  //   // }
  //   return this._execPostMethod(ctx.transition.after, ctx);
  //   // return this._execPostMethod2('transition.after', ctx);
  // }
  //
  // async _execStateEnter(ctx: ResolvedTransitionContext<S, T>): Promise<void> {
  //   // if (typeof ctx.to.enter === 'function') {
  //   //   await ctx.to.enter(ctx);
  //   // }
  //   return this._execPostMethod(ctx.to.enter, ctx);
  // }

  async _executeTransition(ctx: ResolvedTransitionContext<S, T>): Promise<TransitionActionResult<S, T>> {

    // await this._execStateExit(ctx);
    // await this._execTransitionBefore(ctx);
    await this._execPreMethod(ctx.from.exit, ctx);
    await this._execPreMethod(ctx.transition.before, ctx);

    const result = await this._execTransitionAction(ctx);

    this._current = ctx.transition.to;

    // await this._execTransitionAfter(ctx);
    // await this._execStateEnter(ctx);
    await this._execPostMethod(ctx.transition.after, ctx);
    await this._execPostMethod(ctx.to.enter, ctx);

    return result;
  }

  //

  _resolveInputEvent(event: InputEvent<S, T>): ResolvedInputEvent<S, T> {

    let resolvedEvent: ResolvedInputEvent<S, T>;

    switch (typeof event) {
      case 'string':
      case 'number':
      case 'boolean':
      case 'symbol':
      case 'bigint':
        const eventId: InputEventId<S, T> = event;
        resolvedEvent = {
          id: eventId,
        };
        break;
      case 'object':
        if (typeof event.id === 'undefined') throw new EINVALID_EVENT('Event object must have id property');
        resolvedEvent = {
          ...event,
          // id: eventId,
        };
        break;
      case 'function':
      //   resolvedEvent = await this._resolveInputEvent(from, transitionId, transition)
      //   break;
      case 'undefined':
      default:
        throw new EINVALID_EVENT();
    }

    return resolvedEvent;
  }

  async prepareTransition(originalEvent: InputEvent<S, T>): Promise<ResolvedTransitionContext<S, T>> {
    const resolvedEvent = this._resolveInputEvent(originalEvent);
    const eventId = resolvedEvent.id;

    const context = this._context;

    const fromState = this._getCurrentState(this._current);

    const transitionDefinition = this._getStateTransition(fromState, eventId);
    const resolvedTransition = await this._resolveTransition(resolvedEvent, fromState, eventId, transitionDefinition);

    const toState = this.getState(resolvedTransition.to);

    debug(`[transition] from: "${stateToText(fromState)}" transition: "${eventId}" to: "${stateToText(toState)}"`);

    return {event: resolvedEvent, from: fromState, transition: resolvedTransition, to: toState, context};
  }

  public async transition(originalEvent: InputEvent<S, T>): Promise<TransitionActionResult<S, T>> {
    const ctx = await this.prepareTransition(originalEvent);

    const result = await this._executeTransition(ctx);

    // if we came to one of `final` states, resolve `execute` promise (if set)

    if (this._final.indexOf(this._current) >= 0) {
      if (this._deferredExecute) {
        // this._deferredExecute.resolve({from, transition: resolvedTransition, to, context});
        this._deferredExecute.resolve(result);
      }
    }

    // return this._current;
    return Promise.resolve(result);
  }

  public _getState(stateId: S, E?: typeof EINVALID_STATE): State<S, T> | never {
    if (typeof E === 'undefined') E = EINVALID_STATE;
    const state = this._states[stateId];
    if (!state) throw new E(`stateId: ${stateId}`, stateId);
    return state;
  }

  protected _getCurrentState(stateId: S, E?: typeof EINVALID_STATE): State<S, T> | never {
    if (typeof E === 'undefined') E = EINVALID_CURRENT_STATE;
    const stateDefinition = this._getState(this._current, E);
    return this._resolveState(stateId, stateDefinition);
  }

  //

  protected _resolveState(stateId: S, state: StateDefinition<S, T>): ResolvedState<S, T> {
    if ('id' in state) {
      if (state.id !== stateId) throw new EINVALID_STATE_ID_VALUE();
    } else {
      state.id = stateId;
    }
    return <ResolvedState<S, T>>state;
  }

  public _getStateTransition(state: State<S, T>, transitionId: T, E?: typeof EINVALID_TRANSITION): TransitionDefinition<S, T> | never {
    if (typeof E === 'undefined') E = EINVALID_TRANSITION_ID;
    const transition = state?.transitions?.[transitionId];
    if (!transition) throw new E(`transitionId: ${transitionId}`, {state, transitionId});
    return transition;
  }

  // const resolveTo = async (transitionTo: StateId | TransitionResolverFn<StateId, TransitionId>): Promise< StateId > => {
  protected async _resolveTransitionTo({event, from, transition}: {
    event: ResolvedInputEvent<S, T>,
    from: State<S, T>,
    transition: TransitionDefinitionObject<S, T>
  }): Promise<S> {
    if (typeof transition.to === 'function') {
      return transition.to({
        event,
        from,
        transition: transition,
        to: undefined,
        context: this._context,
      });
    }
    return transition.to;
  }


//
//   _getInOneOfStates(stateName: string, stateNamesArray: string[]): boolean {
//     stateNamesArray = stateNamesArray || [];
//     return stateNamesArray.indexOf(stateName) >= 0;
//   };
//
//   _ensureInOneOfStates(stateName: string, allowedStatesNamesArray: string[]): void|never {
//     console.warn('machine:machine._ensureStateAllowed: deprecated');
//     if ( ! this._getInOneOfStates(stateName, allowedStatesNamesArray) ) {
//       throw new Error(`Invalid State: "${stateName}". Allowed States are: [ ${allowedStatesNamesArray.join(', ')} ].`);
//     }
//   };
//
//   __getStateByName(stateId: string): State|undefined {
//     // const states = this.states;
//     // for (let p in states) {
//     //   //console.log('_getStateByName: p:', p, ', states[p]: ', states[ p ]);
//     //   if (states.hasOwnProperty(p) && states[ p ].id === stateId) {
//     //     return states[ p ];
//     //   }
//     // }
//     return this.states[ stateId ];
//     // console.warn(`_getStateByName: state with id "${stateId}" not found`);
//     // return null;
//   };
//
//   _getStateByName(stateId: string): State {
//     const state = this.__getStateByName(stateId);
//     // if (!state && this._start) {
//     //   return this.__getStateByName(this._start);
//     // }
//     return state;
//   };
//
// //_getDefaultState() {
// //   return this._getStateByName('default');
// //}
//
//   _getStateNamesArray(): string[] {
//     const states = this.states;
//     const acc = [];
//     for (let p in states)
//       if (states.hasOwnProperty(p)) {
//         acc.push(p);
//       }
//     return acc;
//   };
//
// // For Select element
//   _stateSelectArray(): SelectArray {
//     const states = this.states;
//     const acc = [];
//     for (let p in states)
//       if (states.hasOwnProperty(p))
//         acc.push({
//           value: p,
//           text:  states[p].name,
//         });
//     return acc;
//   };
//
//
//   _getCurrentTransitions(roles): Transitions {
//     //const states = this.states;
//     const currentState = this._getStateByName(this.current);
//     //console.log('_getCurrentTransitions: currentStateName:', this.current, ', currentState', currentState)
//     return currentState?.transitions ?? {};
//   };
//
//
//   _getTransitions(currentStateName: string, roles): Transitions {
//     //const states = this.states;
//     const currentState = this._getStateByName(currentStateName);
//     //console.log('_getTransitions: currentStateName:', currentStateName, ', currentState', currentState)
//     return currentState?.transitions ?? {};
//   };
//
//
//   _getTransitionById(currentStateName: string, transitionId: string, roles): Transition {
//     const availTrans = this._getTransitions(currentStateName, roles);
//     //console.log('_getTransitionById: transitionId:', transitionId, ', availTrans', availTrans)
//     //const res = availTrans.find(t => t.id === transitionId);
//     let res = null;
//     // const keys = Object.keys(availTrans);
//     // for (let i=0; i<keys.length; i++) {
//     //   if (availTrans[i]?.id === transitionId) {
//     //     if (res) {
//     //       console.error(`_getTransitionById: Duplicate transitionId "${transitionId}" at state "${currentStateName}"`);
//     //     } else {
//     //       res = availTrans[ i ];
//     //     }
//     //   }
//     // }
//
//
//     if (!res) console.warn(`_getTransitionById: transitionId "${transitionId}" not found for state "${currentStateName}"`);
//     //console.log('_getTransitionById: res', res);
//     return res;
//   };
//
//
// //_getTransitionIds(currentStateName: string, roles): string[] {
// //  const transitions = this._getTransitions(currentStateName, roles);
// //  return transitions.map(t => t.id);
// //};
// //
// //
// //_getTransitionNames(currentStateName, roles): string[] {
// //  const transitions = this._getTransitions(currentStateName, roles);
// //  return transitions.map(t => t.name);
// //};
//
//
// // For Select element
//   _transitionsSelectArray(currentStateName: string, roles): SelectArray {
//     const transitions = this._getTransitions(currentStateName, roles);
//
//     return Object.keys(transitions).map(k => {
//       const t = transitions[k];
//       const toState = this._getStateByName(t.to);
//       return {
//         value: k,
//         text:  t.name || (t.to && toState?.name) || k,
//       };
//     });
//
//     //const acc = [];
//     //for (let i=0; i<transitions.length-1; i++) {
//     //  const transition = transitions[i];
//     //  const toState = states[transition.to];
//     //  acc.push({
//     //    value: transition.id,
//     //    text:  transition.name || (transition.to && toState.name) || transition.id,
//     //  });
//     //}
//     //return acc;
//   };
//
//
//   getHasState(stateName: string): boolean {
//     const stateNames = this._getStateNamesArray();
//     return _InOneOfStateNames( stateName, stateNames );
//   };
//
//   _ensureHasState(stateName: string): void|never {
//     if ( ! this.getHasState(stateName) ) {
//       throw new Error(`Undefined State: "${stateName}". Expected one of following: [ ${this._getStateNamesArray().join(', ')} ].`);
//     }
//   }
//
//   _ensureTransitionAllowed( currentStateName: string, newStateName: string): boolean | never {
//     const currentState = this._getStateByName(currentStateName);
//     if ( ! currentState ) {
//       throw new Error(`Invalid State: "${currentStateName}". Allowed States are: [ ${this._getStateNamesArray().join(', ')} ]`);
//     }
//
//     const currentTransitions = currentState?.transitions || {};
//     const keys = Object.keys(currentTransitions);
//     for (let i=0; i<keys.length-1; i++) {
//       if (currentTransitions[i].to === newStateName) return true;
//     }
//
//     return false;
//   };


}


// const _stateByName = function(statesObject: States, stateName: string): State {
//   console.warn('machine:_stateByName: deprecated');
//   const machine = new Machine({ states: statesObject });
//   return machine._getStateByName(stateName);
// };
//
//
// const _stateNamesArray = function(statesObject: States): string[] {
//   console.warn('machine:_stateNamesArray: deprecated');
//   const machine = new Machine({ states: statesObject });
//   return machine._getStateNamesArray();
// };
//
// // For Select element
// const _stateSelectArray = function(statesObject: States) {
//   console.warn('machine:_stateSelectArray: deprecated');
//   const machine = new Machine({ states: statesObject });
//   return machine._stateSelectArray();
// };
//
// // For Select element
// const _transitionsSelectArray = function(statesObject: States, currentStateName: string, roles) {
//   console.warn('machine:_transitionsSelectArray: deprecated');
//   const machine = new Machine({ states: statesObject });
//   return machine._transitionsSelectArray(currentStateName, roles);
// };
//
//
// const _InOneOfStateNames = function(stateName: string, stateNamesArray: string[]) {
//   console.warn('machine:_InOneOfStateNames: deprecated');
//   const machine = new Machine({ states: {} });
//   return machine._getInOneOfStates(stateName, stateNamesArray);
// };
//
//
// const _InOneOfStates = function(stateName, statesArray) {
//   console.warn('machine:_InOneOfStates: deprecated');
//   const machine = new Machine({ states: {} });
//   const stateNames = statesArray.map(item => item.id);
//   return machine._getInOneOfStates(stateName, stateNames);
// };
//
//
// const _ensureStateDefined = function(statesObject, stateName) {
//   console.warn('machine:_ensureStateDefined: deprecated');
//   const machine = new Machine({ states: statesObject });
//   return machine._ensureHasState(stateName);
//   //const stateNames = _stateNamesArray(statesObject);
//   ////if ( !statesObject.hasOwnProperty(stateName) ) {
//   //if ( !_InOneOfStateNames( stateName, stateNames ) ) {
//   //  throw new Error(`Undefined State: "${stateName}". Expected one of following: ${_stateNamesArray(statesObject).join(', ')}.`);
//   //}
// };
//
//
// const _ensureStateAllowed = function(stateName: string, allowedStatesIds: string[]) {
//   console.warn('_ensureStateAllowed: deprecated');
//   console.log('_ensureStateAllowed: stateName:',stateName,'; allowedStatesIds:', allowedStatesIds);
//   const machine = new Machine({ states: {} });
//   const stateNames = allowedStatesIds;//.map(item => item.id);
//   return machine._ensureInOneOfStates(stateName, stateNames);
//   //if ( ! _InOneOfStates(stateName, allowedStatesIds) ) {
//   //  //console.error(`Merchant State: ${stateName}`);
//   //  throw new Error(`Invalid State: "${stateName}". Allowed States are: ${allowedStatesIds.join(', ')}.`);
//   //}
// };
//
//
// const _ensureTransitionAllowed = function(statesObject: States, currentStateName: string, newStateName: string) {
//   console.warn('_ensureTransitionAllowed: deprecated');
//   const machine = new Machine({ states: statesObject });
//   return machine._ensureTransitionAllowed(currentStateName, newStateName);
//
//   //const currentState = _stateByName(statesObject, currentStateName);
//   //if ( ! currentState ) {
//   //  throw new Error(`Invalid State: "${currentStateName}". Allowed States are: ${_stateNamesArray(statesObject).join(', ')}.`);
//   //}
//   //
//   //const currentTransitions = currentState.transitions;
//   //for (let i=0; i<currentTransitions.length-1; i++) {
//   //  if (currentTransitions[i].id === newState.id) return true;
//   //}
//   //
//   //return false;
// };


// module.exports = Machine;
//
// module.exports._stateNamesArray          = _stateNamesArray;
// module.exports._stateSelectArray         = _stateSelectArray;
// module.exports._transitionsSelectArray   = _transitionsSelectArray;
// module.exports._InOneOfStates            = _InOneOfStates;
// module.exports._ensureStateDefined       = _ensureStateDefined;
// module.exports._ensureStateAllowed       = _ensureStateAllowed;
// module.exports._ensureTransitionAllowed  =  _ensureTransitionAllowed;


//const t = async() => {}

// let a = 1;
// function changeValue(value) {
//   a = value
// }
// if (a!==1) throw new Error('!1');
// changeValue(2);
// if (a!==2) throw new Error('!2');
//

// class Test {
//   public value: number = 1
//   setValue(value: number) {
//     this.value = value;
//   }
// }
// const test = new Test();
// if (test.value !== 1) throw new Error('!1');
// test.setValue(2);
// if (test.value !== 2) throw new Error('!2');

