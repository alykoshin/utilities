/**
 * check that all transitions are to defined states.
 */
import {debug} from './index';
import {EINVALID_FINAL_STATE, EINVALID_START_STATE, EINVALID_TRANSITION_TO} from "./errors";
import {BaseStateId, ResolvedState} from "./States";
import {Machine} from "./index";
import {BaseTransitionId} from "./Transitions";




// export class Machine2<S extends BaseStateId, T extends BaseTransitionId> extends Machine<S, T> {
//   public _initial
//   public _getState
//   public _states
// }


export async function validate<S extends BaseStateId, T extends BaseTransitionId>(machine: Machine<S, T>): Promise<void> {

  // check we have state for start id

  const initial = machine._getState(machine._initial, EINVALID_START_STATE);
  debug(`[validate] initial: ${initial.id}`);

// check we have all states for final ids

  machine._final.forEach(finalStateId => {
    const finalState = machine.getState(finalStateId, EINVALID_FINAL_STATE);
    debug(`[validate] finalState: ${finalState.id}`);
  })

// for each state for each transition ensure target state exists

  for (const stateIdKey of Object.keys(machine._states)) {
    debug(`[validate] ${stateIdKey}`);

    //

    const fromStateId = <S>stateIdKey;
    const fromState: ResolvedState<S, T> = machine.getState(fromStateId);

    //

    if (Array.isArray(fromState?.transitions)) {
      for (const transitionIdKey of Object.keys(fromState.transitions)) {

        const transitionId = <T>transitionIdKey;

        // let s = `     \\--> ${transitionId.padEnd(15)}`
        const transition = machine._getStateTransition(fromState, transitionId);
        // let transitionObject: TransitionDefinitionObject<StateId, TransitionId>;

        if (typeof transition === 'function') {
          debug(`[validate]     \\--> ${(transitionId as string).padEnd(15)} --> function() /ignored during validation/`);
        }

        const fakeResolvedEvent = {id: transitionId};
        const resolvedTransition = await machine._resolveTransition(fakeResolvedEvent, fromState, transitionId, transition);

        const toStateId = resolvedTransition.to;
        const toState: ResolvedState<S, T> = machine.getState(toStateId, EINVALID_TRANSITION_TO);

        debug(`[validate]     \\--> ${(transitionId as string).padEnd(15)} --> ${toState.id}`);

      }
    } else {
      debug(`[validate]     /no outputs/`);
    }

  }
  // return this;
}


