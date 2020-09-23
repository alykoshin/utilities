/*

https://github.com/davidkpiano/xstate/tree/master/packages/xstate-fsm#machine-config

https://www.npmjs.com/package/@opuscapita/fsm-workflow-core#automatic-conditions

 */

import Debug from 'debug';
const debug = Debug('machine');

import {Deferred} from '@utilities/async';

//

type InputEventId<StateId extends BaseStateId, TransitionId extends BaseTransitionId> = TransitionId

interface InputEventObject<StateId extends BaseStateId, TransitionId extends BaseTransitionId> {
  id: InputEventId<StateId, TransitionId>
  data?: any
}

interface ResolvedInputEvent<StateId extends BaseStateId, TransitionId extends BaseTransitionId> extends InputEventObject<StateId, TransitionId> {
}

type InputEvent<StateId extends BaseStateId, TransitionId extends BaseTransitionId> = InputEventId<StateId, TransitionId> | InputEventObject<StateId, TransitionId>

//

interface BaseTransitionHandlerArguments<StateId extends BaseStateId, TransitionId extends BaseTransitionId> {
  event: ResolvedInputEvent<StateId, TransitionId>
  from: State<StateId, TransitionId>
  // transition: TransitionDefinition<StateId, TransitionId>
  to: State<StateId, TransitionId>
  context: Context
}

interface UnresolvedTransitionHandlerArguments<StateId extends BaseStateId, TransitionId extends BaseTransitionId> extends BaseTransitionHandlerArguments<StateId,TransitionId> {
  // from: State<StateId, TransitionId>,
  transition: TransitionDefinition<StateId, TransitionId>,
  // to: State<StateId, TransitionId>,
  // context: Context,
}

interface ResolvedTransitionHandlerArguments<StateId extends BaseStateId, TransitionId extends BaseTransitionId> extends BaseTransitionHandlerArguments<StateId,TransitionId> {
  // from: State<StateId, TransitionId>,
  transition: ResolvedTransitionObject<StateId, TransitionId>,
  // to: State<StateId, TransitionId>,
  // context: Context,
}

// interface TransitionResolverArguments<StateId extends BaseStateId, TransitionId extends BaseTransitionId> extends TransitionHandlerData<StateId, TransitionId> {
//   // from: State<StateId, TransitionId>,
//   // transition: Transition<StateId, TransitionId>,
//   to: undefined,
//   context: Context,
// }

interface TransitionResolverFn<StateId extends BaseStateId, TransitionId extends BaseTransitionId> {
  (args: UnresolvedTransitionHandlerArguments<StateId, TransitionId>): Promise<StateId>|StateId|undefined
}

interface StateExitHandler<StateId extends BaseStateId, TransitionId extends BaseTransitionId> {
  (args: UnresolvedTransitionHandlerArguments<StateId, TransitionId>): Promise<boolean>|boolean
}

//

interface TransitionBeforeHandler<StateId extends BaseStateId, TransitionId extends BaseTransitionId> {
  (args: ResolvedTransitionHandlerArguments<StateId, TransitionId>): Promise<boolean>|boolean
}

interface StateEnterHandler<StateId extends BaseStateId, TransitionId extends BaseTransitionId> {
  (args: ResolvedTransitionHandlerArguments<StateId, TransitionId>): Promise<void>|void
}

interface TransitionAfterHandler<StateId extends BaseStateId, TransitionId extends BaseTransitionId> {
  (args: ResolvedTransitionHandlerArguments<StateId, TransitionId>): Promise<void>|void
}

// interface TransitionHandler<StateId extends BaseStateId, TransitionId extends BaseTransitionId> {
//   (args: TransitionHandlerData<StateId, TransitionId>): Promise<void>
// }
// interface TransitionEvent { (): boolean }

// Transitions

type BaseTransitionId = string | number

//
//
// interface StateExitHandler<StateId extends BaseStateId, TransitionId extends BaseTransitionId> {
//   (args: UnresolvedTransitionHandlerArguments<StateId, TransitionId>): Promise<boolean>|boolean
// }
//
// interface TransitionBeforeHandler<StateId extends BaseStateId, TransitionId extends BaseTransitionId> {
//   (args: UnresolvedTransitionHandlerArguments<StateId, TransitionId>): Promise<boolean>|boolean
// }

interface TransitionActionHandler<StateId extends BaseStateId, TransitionId extends BaseTransitionId> {
  (args: ResolvedTransitionHandlerArguments<StateId, TransitionId>): ActionResult<StateId, TransitionId>
}

type ActionResult<StateId extends BaseStateId, TransitionId extends BaseTransitionId> = Promise<any> | any

// interface TransitionAfterHandler<StateId extends BaseStateId, TransitionId extends BaseTransitionId> {
//   (args: ResolvedTransitionHandlerArguments<StateId, TransitionId>): Promise<void>
// }
//
// interface TransitionExecutionHandler<StateId extends BaseStateId, TransitionId extends BaseTransitionId> {
//   (args: ResolvedTransitionHandlerArguments<StateId, TransitionId>): Promise<any>
// }
//
//

interface BaseTransitionObject<StateId extends BaseStateId, TransitionId extends BaseTransitionId> {
  // id:      string
  // to:      StateId

  name?:   string
  data?:   any

  before?: TransitionBeforeHandler<StateId, TransitionId>
  action?: TransitionActionHandler<StateId, TransitionId> | string | number // string for demo purposes and simple transducers
  after?:  TransitionAfterHandler<StateId, TransitionId>
}

interface TransitionDefinitionObject<StateId extends BaseStateId, TransitionId extends BaseTransitionId> extends BaseTransitionObject<StateId, TransitionId> {
  // id:      string
  to:      StateId | TransitionResolverFn<StateId, TransitionId>

  // name?:   string
  // data?:   any
  //
  // before?: TransitionBeforeHandler<StateId, TransitionId>
  // action?: TransitionActionHandler<StateId, TransitionId> | string | number // string for demo purposes
  // after?:  TransitionAfterHandler<StateId, TransitionId>
}

interface ResolvedTransitionObject<StateId extends BaseStateId, TransitionId extends BaseTransitionId> extends BaseTransitionObject<StateId,TransitionId> {
  id:      TransitionId
  to:      StateId

  // name?:   string
  // data?:   any
  //
  // before?: TransitionBeforeHandler<StateId, TransitionId>
  // action?: TransitionActionHandler<StateId, TransitionId> | string | number // string for demo purposes
  // after?:  TransitionAfterHandler<StateId, TransitionId>
}

export type TransitionDefinition<StateId extends BaseStateId, TransitionId extends BaseTransitionId> =
  StateId |
  TransitionDefinitionObject<StateId, TransitionId> |
  TransitionResolverFn<StateId, TransitionId>

export type TransitionDefinitions<StateId extends BaseStateId, TransitionId extends BaseTransitionId> = {
  [id in TransitionId]?: TransitionDefinition<StateId, TransitionId>;
};

// States

type BaseStateId = string | number

interface BaseStateObject<StateId extends BaseStateId, TransitionId extends BaseTransitionId> {

  transitions?: TransitionDefinitions<StateId, TransitionId>

  id?:         StateId // if set, must be equal to the key of this state in states object
  name?:       string
  data?:       any

  enter?:      StateEnterHandler<StateId, TransitionId>
  exit?:       StateExitHandler<StateId, TransitionId>
}

interface StateDefinition<StateId extends BaseStateId, TransitionId extends BaseTransitionId> extends BaseStateObject<StateId, TransitionId> {
  id?:         StateId // if set, must be equal to the key of this state in states object
}

interface ResolvedState<StateId extends BaseStateId, TransitionId extends BaseTransitionId> extends BaseStateObject<StateId, TransitionId> {
  id:         StateId // if set, must be equal to the key of this state in states object
}


export type State<StateId extends BaseStateId, TransitionId extends BaseTransitionId> = StateDefinition<StateId, TransitionId>

export type States<StateId extends BaseStateId, TransitionId extends BaseTransitionId> = {
  [id in StateId]: State<StateId, TransitionId>
}

//

export interface Schema<StateId extends BaseStateId, TransitionId extends BaseTransitionId> {
  initial?: StateId,
  final?: StateId|StateId[],
  states: States<StateId, TransitionId>,
}

//

class EMACHINE_ERROR extends Error {
  code: string
  info?: any
  constructor (msg?: string, info?: any, code?: string) {
    // if (typeof info === 'undefined') {
    //
    // }
    code = code || 'EMACHINE_ERROR'
    super(msg || code);
    this.code = code;
    this.info = info;
  }
}

class EINVALID_EVENT extends EMACHINE_ERROR {
  constructor (msg?: string, info?: any, code?: string) { super(msg, info, code || 'EINVALID_EVENT'); }
}


class EINVALID_STATE extends EMACHINE_ERROR {
  constructor (msg?: string, info?: any, code?: string) { super(msg, info, code || 'EINVALID_STATE'); }
}

export class EINVALID_CURRENT_STATE extends EINVALID_STATE {
  constructor (msg?: string, info?: any, code?: string) { super(msg, info, code || 'EINVALID_CURRENT_STATE'); }
}

export class EINVALID_START_STATE extends EINVALID_STATE {
  constructor (msg?: string, info?: any, code?: string) { super(msg, info, code || 'EINVALID_START_STATE'); }
}

export class EINVALID_FINAL_STATE extends EINVALID_STATE {
  constructor (msg?: string, info?: any, code?: string) { super(msg, info, code || 'EINVALID_FINAL_STATE'); }
}

export class EINVALID_STATE_ID_VALUE extends EINVALID_STATE {
  constructor (msg?: string, info?: any, code?: string) { super(msg, info, code || 'EINVALID_STATE_ID_VALUE'); }
}

//

class EINVALID_TRANSITION extends EMACHINE_ERROR {
  constructor (msg?: string, info?: any, code?: string) { super(msg, info, code || 'EINVALID_TRANSITION_ID'); }
}

export class EINVALID_TRANSITION_ID extends EINVALID_TRANSITION {
  constructor (msg?: string, info?: any, code?: string) { super(msg, info, code || 'EINVALID_TRANSITION_ID'); }
}

export class EINVALID_TRANSITION_TO extends EINVALID_TRANSITION {
  constructor (msg?: string, info?: any, code?: string) { super(msg, info, code || 'EINVALID_TRANSITION_TO'); }
}

export class ETRANSITION_REJECTION extends EINVALID_TRANSITION {
  constructor (msg?: string, info?: any, code?: string) { super(msg, info, code || 'ETRANSITION_REJECTION'); }
}

//

type SelectArray = { value: string, text: string }[];

//

export class BaseStateClass<StateId extends BaseStateId, TransitionId extends BaseTransitionId, DataModel, Options> {
  machine: Machine<StateId,TransitionId>
  dataModel: DataModel
  options: Options
  // energyExpense: 1
  constructor(machine: Machine<StateId,TransitionId>, dataModel: DataModel, options: Options) {
    this.machine = machine;
    this.dataModel = dataModel;
    this.options = options;
  }
  protected castEvent(event: InputEvent<StateId,TransitionId>) {
    return this.machine.transition(event);
  }
}

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

class BaseMachine<StateId extends BaseStateId, TransitionId extends BaseTransitionId> {
  protected _current: StateId
  protected states: States<StateId, TransitionId>

  constructor({ states, initial }: { states: States<StateId, TransitionId>, initial?: StateId }) {
    this._current = initial;
    this.states = states;
  }

  // public getState(stateId: StateId): State<StateId, TransitionId>|never {
  //   return this._getState(stateId);
  // }

  // public async transition(id: TransitionId): StateId {
  //   const state = states[this.state];
  // }

}

//

type Context = any;

//

interface MachineConstructorArguments<StateId extends BaseStateId, TransitionId extends BaseTransitionId> extends Schema<StateId,TransitionId> {
  context?: Context,
}


export class Machine<StateId extends BaseStateId, TransitionId extends BaseTransitionId> extends BaseMachine<StateId,TransitionId> {
  protected readonly DEFAULT_START_STATE_NAME = <StateId> 'start';
  protected readonly DEFAULT_FINAL_STATE_NAMES = <StateId[]> ['final'];

  // protected states: States<StateId, TransitionId>
  // protected _current: StateId = this.DEFAULT_START_STATE_NAME
  public get current(): StateId { return this._current }
  protected _initial: StateId = this.DEFAULT_START_STATE_NAME
  protected _final: StateId[] = this.DEFAULT_FINAL_STATE_NAMES
  public get final(): StateId[] { return this._final }
  protected _context: Context;
  protected _deferredExecute: Deferred< ActionResult<StateId, TransitionId>, EMACHINE_ERROR >

  // reachable (fsm)
  // calculate all states can reach each other states. the result is in the form of {STATE1: {STATE2: [event path from S1 to S2]}}
  //
  // terminal (fsm)
  // return the list of states that cannot reach another state.
  //
  // livelock (fsm, [terminal])
  // get list of states that cannot reach a terminal state.

  constructor({ states, initial, final, context }: MachineConstructorArguments<StateId,TransitionId>) {
    super({ states, initial });
    if (!states) throw new Error('parameter "states" must be defined.');
    this.states  = states;   // state definitions
    this._initial = initial ?? <StateId> this.DEFAULT_START_STATE_NAME;
    this._final = Array.isArray( final )
      ? final
      : final
        ? [ final ]
        : <StateId[]> this.DEFAULT_FINAL_STATE_NAMES;
    this._current = /*current ||*/ this._initial;
    this._context = /*current ||*/ context;
    debug(`[constructor] initial: ${initial}, final: [${this._final.join(',')}]`);
  }

  public init() {
    this._current = this._initial;
    this._deferredExecute = null;
  }

  public async execute(): Promise<ActionResult<StateId, TransitionId>> {
    this.init();
    this._deferredExecute = new Deferred();
    return this._deferredExecute.promise;
  }

  protected _getState(stateId: StateId, E?: typeof EINVALID_STATE): State<StateId, TransitionId>|never {
    if (typeof E === 'undefined') E = EINVALID_STATE;
    const state = this.states[stateId];
    if (!state) throw new E(`stateId: ${stateId}`, stateId);
    return state;
  }

  protected getCurrentState(stateId: StateId, E?: typeof EINVALID_STATE): State<StateId, TransitionId>|never {
    if (typeof E === 'undefined') E = EINVALID_CURRENT_STATE;
    const stateDefinition = this._getState(this._current, E);
    return this._resolveState(stateId, stateDefinition);
  }

  public getState(stateId: StateId, E?: typeof EINVALID_STATE): ResolvedState<StateId, TransitionId>|never {
    if (typeof E === 'undefined') E = EINVALID_STATE;
    const stateDefinition = this._getState(stateId, E);
    return this._resolveState(stateId, stateDefinition);
  }

  protected _resolveState(stateId: StateId, state: StateDefinition<StateId, TransitionId>): ResolvedState<StateId, TransitionId> {
    if ('id' in state) {
      if (state.id !== stateId) throw new EINVALID_STATE_ID_VALUE();
    } else {
      state.id = stateId;
    }
    return <ResolvedState<StateId, TransitionId>> state;
  }

  //

  protected _getStateTransition(state: State<StateId, TransitionId>, transitionId: TransitionId, E?: typeof EINVALID_TRANSITION ): TransitionDefinition<StateId, TransitionId>|never {
    if (typeof E === 'undefined') E = EINVALID_TRANSITION_ID;
    const transition = state?.transitions[transitionId];
    if (!transition) throw new E(`transitionId: ${transitionId}`, {state, transitionId});
    return transition;
  }

  public getTransition(stateId: StateId, transitionId: TransitionId): TransitionDefinition<StateId, TransitionId> {
    const state = this._getState(stateId);
    return this._getStateTransition(state, transitionId);
  }

  // const resolveTo = async (transitionTo: StateId | TransitionResolverFn<StateId, TransitionId>): Promise< StateId > => {
  protected async _resolveTransitionTo ({ event, from, transition }: { event: ResolvedInputEvent<StateId,TransitionId>, from: State<StateId,TransitionId>, transition: TransitionDefinitionObject<StateId,TransitionId> }): Promise< StateId > {
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


  async _resolveTransition(event: ResolvedInputEvent<StateId, TransitionId>, from: State<StateId,TransitionId>, transitionId: TransitionId, transition: TransitionDefinition<StateId,TransitionId>): Promise< ResolvedTransitionObject<StateId,TransitionId> > {

    let resolvedTransition: ResolvedTransitionObject<StateId,TransitionId>;

    switch (typeof transition) {
      case 'string':
      case 'number':
      case 'boolean':
      case 'symbol':
      case 'bigint': {
        const transitionTo: StateId = transition;
        resolvedTransition = {
          id: transitionId,
          to: transitionTo,
        };
        break;
      }
      case 'object': {
        const transitionTo: StateId = await this._resolveTransitionTo({ event, from, transition });
        resolvedTransition = {
          ...transition,
          to: transitionTo,
          id: transitionId,
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


  async _executeTransition({ event, from, transition, to, context }: ResolvedTransitionHandlerArguments<StateId, TransitionId>): Promise< ActionResult<StateId,TransitionId> > {

    let result = undefined;

    // execute from.exit()

    if (typeof from.exit === 'function') {
      if (await from.exit({ event, from, transition, to, context }) === false) {
        debug(`[transition] from:exit:reject from: "${this._current}" transition: "${transition.id}" to: "${transition.to}"`);
        throw new ETRANSITION_REJECTION(`Transition ${transition.id} not allowed by from.exit()`);
        // return Promise.reject(new ETRANSITION_REJECTION(`Transition ${id} not allowed by from.exit()`));
        // return this._current;
      }
    }

    // execute transition.before()

    if (typeof transition.before === 'function') {
      if (await transition.before({ event, from, transition, to, context }) === false) {
        debug(`[transition] transition:before:reject from: "${this._current}" transition: "${transition.id}" to: "${transition.to}"`);
        throw new ETRANSITION_REJECTION(`Transition ${transition.id} not allowed by transition.before()`);
        // return Promise.reject(new ETRANSITION_REJECTION(`Transition ${id} not allowed by transition.before()`));
        // return this._current;
      }
    }

    // execute transition.action

    if (typeof transition.action === 'function') {
      result = await transition.action({ event, from, transition, to, context });

    } else if (['string', 'number', 'undefined'].indexOf(typeof transition.action) >= 0) {
      result = transition.action;
      debug(`[transition] action: "${transition.action}"`);

    } else {
      throw new EINVALID_TRANSITION(`Invalid typeof transition action: "${typeof transition.action}"`)

    }

    this._current = transition.to;

    // execute transition.after

    if (typeof transition.after === 'function') {
      await transition.after({ event, from, transition, to, context });
    }

    // execute to.enter

    if (typeof to.enter === 'function') {
      await to.enter({ event, from, transition, to, context });
    }

    return result;
  }

  //

  _resolveInputEvent(event: InputEvent<StateId,TransitionId>): ResolvedInputEvent<StateId, TransitionId> {

    let resolvedEvent:  ResolvedInputEvent<StateId, TransitionId>;

    switch (typeof event) {
      case 'string':
      case 'number':
      case 'boolean':
      case 'symbol':
      case 'bigint':
        const eventId: InputEventId<StateId, TransitionId> = event;
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


  /**
   * check that all transitions are to defined states.
   */
  public async validate(): Promise< Machine<StateId,TransitionId> > {

    // check we have state for start id

    const initial = this._getState(this._initial, EINVALID_START_STATE);
    debug(`[validate] initial: ${initial.id}`);

    // check we have all states for final ids

    this._final.forEach(finalStateId => {
      const finalState = this.getState(finalStateId, EINVALID_FINAL_STATE);
      debug(`[validate] finalState: ${finalState.id}`);
    })

    // for each state for each transition ensure target state exists

    for (const stateIdKey of Object.keys(this.states)) {
      debug(`[validate] ${stateIdKey}`);

      //

      const fromStateId = <StateId> stateIdKey;
      const fromState: ResolvedState<StateId, TransitionId> = this.getState(fromStateId);

      //

      if (Array.isArray(fromState?.transitions)) {
        for (const transitionIdKey of Object.keys(fromState.transitions)) {

          const transitionId = <TransitionId> transitionIdKey;

          // let s = `     \\--> ${transitionId.padEnd(15)}`
          const transition = this._getStateTransition( fromState, transitionId );
          let transitionObject: TransitionDefinitionObject<StateId,TransitionId>;

          if (typeof transition === 'function') {
            debug(`[validate]     \\--> ${(transitionId as string).padEnd(15)} --> function() /ignored during validation/`);
          }

          const fakeResolvedEvent = { id: transitionId };
          const resolvedTransition = await this._resolveTransition(fakeResolvedEvent, fromState, transitionId,transition);

          const toStateId = resolvedTransition.to;
          const toState: ResolvedState<StateId, TransitionId> = this.getState(toStateId, EINVALID_TRANSITION_TO);

          debug(`[validate]     \\--> ${(transitionId as string).padEnd(15)} --> ${toState.id}`);

        }
      } else {
        debug(`[validate]     /no outputs/`);
      }

    }
    return this;
  }


  public async transition(originalEvent: InputEvent<StateId,TransitionId>): Promise< ActionResult<StateId,TransitionId> > {

    const stateToText = (state) => `${state.id}` + (state.name ? ` "${state.name}"` : ``)

    //
    const resolvedEvent = this._resolveInputEvent(originalEvent);
    const eventId = resolvedEvent.id;


    const context = this._context;

    const fromState = this.getCurrentState(this._current);

    const transitionDefinition = this._getStateTransition(fromState, eventId);
    const resolvedTransition = await this._resolveTransition(resolvedEvent, fromState, eventId, transitionDefinition);

    const toState = this.getState(resolvedTransition.to);

    debug(`[transition] from: "${stateToText(fromState)}" transition: "${eventId}" to: "${stateToText(toState)}"`);

    const result = await this._executeTransition({ event: resolvedEvent, from: fromState, transition: resolvedTransition, to: toState, context });

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

