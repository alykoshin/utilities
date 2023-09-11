import {GenericDict, GenericId} from "../generic";


export type NanoStateId = GenericId;

export interface NanoTransitionFn<S extends NanoStateId> {
  (this: NanoMachine<S>/*, args?: any*/): Promise<S> | S
}

export type NanoState<S extends NanoStateId> = NanoTransitionFn<S>

// type MicroStates<S extends MicroStateId, C> = {
//   [id in S]?: MicroState<S, C>
// }
export type NanoStates<S extends NanoStateId> = GenericDict<S, NanoState<S>>

export interface NanoSchema<S extends NanoStateId> {
  initial?: S
  // final?: S | S[]
  states: NanoStates<S>
}

export interface NanoMachineConstructorArguments<S extends NanoStateId> {
  schema: NanoSchema<S>
}


export class NanoMachine<S extends NanoStateId> {
  _current: S
  _schema: NanoSchema<S>

  constructor({schema}: NanoMachineConstructorArguments<S>) {
    this._schema = schema;
    this.init();
  }

  init(): void {
    this._current = this._schema.initial;
  }

  _resolveState(id: S): NanoState<S> {
    const state = this._schema.states[id];
    if (!state) throw new Error(`Invalid event/transaction "${id}"`);
    return state
  }

  async _execTransition(fromState: NanoState<S>): Promise<S> {
    const transitionFn = fromState.bind(this);
    return transitionFn();
  }

  async _exec(fromId: S): Promise<S> {
    const fromState = this._resolveState(fromId);
    const toId = await this._execTransition(fromState);
    console.log(`[${fromId}] >> [${toId}]`);
    return toId;
  }

  async exec(): Promise<void> {
    this._current = await this._exec(this._current);
  }

}

