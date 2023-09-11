import {GenericDict, GenericId} from "../generic";
import {NanoMachine, NanoSchema, NanoState, NanoTransitionFn} from "../NanoMachine";

export type MicroStateId = GenericId;

interface MicroTransitionFn<S extends MicroStateId, C> extends NanoTransitionFn<S> {
  (/*this: MicroStateMachine<S, C>, */context: C): Promise<S> | S
}

export type MicroState<S extends MicroStateId, C> = MicroTransitionFn<S, C>

// type MicroStates<S extends MicroStateId, C> = {
//   [id in S]?: MicroState<S, C>
// }
type MicroStates<S extends MicroStateId, C> = GenericDict<S, MicroState<S, C>>

// type MicroStates<S extends MicroStateId, C> = MicroState<S,C>

export interface MicroSchema<S extends MicroStateId, C> extends NanoSchema<S> {
  initial?: S
  // final?: S | S[]
  states: MicroStates<S, C>
}

interface MicroStateMachineConstructorArguments<S extends MicroStateId, C> {
  schema: MicroSchema<S, C>
  context: C
}

export class MicroStateMachine<S extends MicroStateId, C> extends NanoMachine<S> {
  _current: S
  _schema: MicroSchema<S, C>
  _context: C

  constructor({schema, context}: MicroStateMachineConstructorArguments<S, C>) {
    super({schema})
    this._context = context;
    // this._schema = schema;
    // this.init();
  }

  // init(): void {
  //   this._current = this._schema.initial;
  // }

  async _execTransition(fromState: MicroState<S,C>): Promise<S> {
    const transitionFn = fromState.bind(this);
    return transitionFn();
  }

  async _exec(fromId: S): Promise<S> {
    const fromState = this._resolveState(fromId);

    // const transitionFn = fromState.bind(this);
    // const toId = await transitionFn(this._context);
    const toId = await this._execTransition(fromState);

    console.log(`[${fromId}] >> [${toId}]`);
    return toId;
  }

  // async exec(): Promise<void> {
  //   this._current = await this._exec(this._current);
  // }

}
