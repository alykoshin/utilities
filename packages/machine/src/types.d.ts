import {BaseStateId, State, States} from "./States";
import {
  BaseTransitionId,
} from "./Transitions";


export type InputEventId<S extends BaseStateId, T extends BaseTransitionId> = T

export interface InputEventObject<S extends BaseStateId, T extends BaseTransitionId> {
  id: InputEventId<S, T>
  data?: any
}

export interface ResolvedInputEvent<S extends BaseStateId, T extends BaseTransitionId> extends InputEventObject<S, T> {
}

export type InputEvent<S extends BaseStateId, T extends BaseTransitionId> =
  InputEventId<S, T> |
  InputEventObject<S, T>

//

// interface TransitionResolverArguments<StateId extends BaseStateId, TransitionId extends BaseTransitionId> extends TransitionHandlerData<StateId, TransitionId> {
//   // from: State<StateId, TransitionId>,
//   // transition: Transition<StateId, TransitionId>,
//   to: undefined,
//   context: Context,
// }

//

// interface TransitionHandler<StateId extends BaseStateId, TransitionId extends BaseTransitionId> {
//   (args: TransitionHandlerData<StateId, TransitionId>): Promise<void>
// }
// interface TransitionEvent { (): boolean }

export interface BaseSchema<S extends BaseStateId, T extends BaseTransitionId> {
  initial?: S,
  final?: S | S[],
  states: States<S, T>,
}

export interface Schema<S extends BaseStateId, T extends BaseTransitionId> {
  initial?: S,
  final?: S | S[],
  states: States<S, T>,
}

//

export type SelectArray = { value: string, text: string }[];

export type Context = any;
