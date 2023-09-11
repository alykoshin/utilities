import {
  BaseTransitionId,
  ResolvedTransitionContext,
  TransitionDefinitions,
  UnresolvedTransitionContext
} from './Transitions'
import {GenericId} from "./microMachines/generic";

// States

export type BaseStateId = GenericId // | number

//

export interface StateEnterHandler<S extends BaseStateId, T extends BaseTransitionId> {
  (args: ResolvedTransitionContext<S, T>): Promise<void> | void
}

export interface StateExitHandler<S extends BaseStateId, T extends BaseTransitionId> {
  (args: UnresolvedTransitionContext<S, T>): Promise<boolean> | boolean
}

//

// type StateHandlers = 'enter' | 'exit';
//
// type StateHandlerObject<S extends BaseStateId, T extends BaseTransitionId> = {
//   [key in StateHandlers]?: StateEnterHandler<S, T> | StateExitHandler<S, T>
// }

export interface BaseStateObject<S extends BaseStateId, T extends BaseTransitionId>
/*extends StateHandlerObject<S, T>*/ {
  transitions?: TransitionDefinitions<S, T>

  id?: S // if set, must be equal to the key of this state in states object
  name?: string
  data?: any

  enter?: StateEnterHandler<S, T>
  exit?: StateExitHandler<S, T>
}


export interface StateDefinition<S extends BaseStateId, T extends BaseTransitionId> extends BaseStateObject<S, T> {
  id?: S // if set, must be equal to the key of this state in states object
}


export interface ResolvedState<S extends BaseStateId, T extends BaseTransitionId> extends BaseStateObject<S, T> {
  id: S // if set, must be equal to the key of this state in states object
}


export type State<S extends BaseStateId, T extends BaseTransitionId> = StateDefinition<S, T>


export type States<S extends BaseStateId, T extends BaseTransitionId> = {
  [id in S]: State<S, T>
}

