import {BaseStateId, State, States} from "./States";
import { ResolvedInputEvent, } from "./types";
import {GenericId} from "./microMachines/generic";

// Transition

export type BaseTransitionId = GenericId

export interface BaseTransitionContext<S extends BaseStateId, T extends BaseTransitionId> {
  event: ResolvedInputEvent<S, T>
  from: State<S, T>
  // transition: TransitionDefinition<StateId, TransitionId>
  to: State<S, T>
  context: Context
}


export interface UnresolvedTransitionContext<S extends BaseStateId, T extends BaseTransitionId> extends BaseTransitionContext<S, T> {
  // from: State<StateId, TransitionId>,
  transition: TransitionDefinition<S, T>,
  // to: State<StateId, TransitionId>,
  // context: Context,
}


export interface ResolvedTransitionContext<S extends BaseStateId, T extends BaseTransitionId> extends BaseTransitionContext<S, T> {
  // from: State<StateId, TransitionId>,
  transition: ResolvedTransitionObject<S, T>,
  // to: State<StateId, TransitionId>,
  // context: Context,
}


// interface TransitionResolverArguments<StateId extends BaseStateId, TransitionId extends BaseTransitionId> extends TransitionHandlerData<StateId, TransitionId> {
//   // from: State<StateId, TransitionId>,
//   // transition: Transition<StateId, TransitionId>,
//   to: undefined,
//   context: Context,
// }


export interface TransitionResolverFn<S extends BaseStateId, T extends BaseTransitionId> {
  (args: UnresolvedTransitionContext<S, T>): Promise<S> | S | undefined
}


export interface TransitionBeforeHandler<S extends BaseStateId, T extends BaseTransitionId> {
  (args: ResolvedTransitionContext<S, T>): Promise<boolean> | boolean
}


export interface TransitionAfterHandler<S extends BaseStateId, T extends BaseTransitionId> {
  (args: ResolvedTransitionContext<S, T>): Promise<void> | void
}


// interface TransitionHandler<StateId extends BaseStateId, TransitionId extends BaseTransitionId> {
//   (args: TransitionHandlerData<StateId, TransitionId>): Promise<void>
// }
// interface TransitionEvent { (): boolean }

// Transitions


//
//
// interface StateExitHandler<StateId extends BaseStateId, TransitionId extends BaseTransitionId> {
//   (args: UnresolvedTransitionHandlerArguments<StateId, TransitionId>): Promise<boolean>|boolean
// }
//
// interface TransitionBeforeHandler<StateId extends BaseStateId, TransitionId extends BaseTransitionId> {
//   (args: UnresolvedTransitionHandlerArguments<StateId, TransitionId>): Promise<boolean>|boolean
// }


export type TransitionActionResult<S extends BaseStateId, TransitionId extends BaseTransitionId> = Promise<any> | any


export interface TransitionActionHandler<S extends BaseStateId, T extends BaseTransitionId> {
  (args: ResolvedTransitionContext<S, T>): TransitionActionResult<S, T>
}


// interface TransitionAfterHandler<StateId extends BaseStateId, TransitionId extends BaseTransitionId> {
//   (args: ResolvedTransitionHandlerArguments<StateId, TransitionId>): Promise<void>
// }
//
// interface TransitionExecutionHandler<StateId extends BaseStateId, TransitionId extends BaseTransitionId> {
//   (args: ResolvedTransitionHandlerArguments<StateId, TransitionId>): Promise<any>
// }
//
//


export interface BaseTransitionObject<S extends BaseStateId, T extends BaseTransitionId> {
  // id: string
  // to: StateId

  name?: string
  data?: any

  before?: TransitionBeforeHandler<S, T>
  action?: TransitionActionHandler<S, T> | string | number // string for demo purposes and simple transducers
  after?: TransitionAfterHandler<S, T>
}


export interface TransitionDefinitionObject<S extends BaseStateId, T extends BaseTransitionId> extends BaseTransitionObject<S, T> {
  // id:      string
  to: S | TransitionResolverFn<S, T>
  // name?: string
  // data?: any
  //
  // before?: TransitionBeforeHandler<StateId, TransitionId>
  // action?: TransitionActionHandler<StateId, TransitionId> | string | number // string for demo purposes
  // after?: TransitionAfterHandler<StateId, TransitionId>
}


export interface ResolvedTransitionObject<S extends BaseStateId, T extends BaseTransitionId> extends BaseTransitionObject<S, T> {
  id: T
  to: S
  // name?: string
  // data?: any
  //
  // before?: TransitionBeforeHandler<StateId, TransitionId>
  // action?: TransitionActionHandler<StateId, TransitionId> | string | number // string for demo purposes
  // after?: TransitionAfterHandler<StateId, TransitionId>
}


export type TransitionDefinition<S extends BaseStateId, T extends BaseTransitionId> =
  S |
  TransitionDefinitionObject<S, T> |
  TransitionResolverFn<S, T>


export type TransitionDefinitions<S extends BaseStateId, T extends BaseTransitionId> = {
  [id in T]?: TransitionDefinition<S, T>;
};


export interface Schema<S extends BaseStateId, T extends BaseTransitionId> {
  initial?: S,
  final?: S | S[],
  states: States<S, T>,
}


export type SelectArray = { value: string, text: string }[];


export type Context = any;
