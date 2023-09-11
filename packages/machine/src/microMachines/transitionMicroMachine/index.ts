export type GenericId = string | number

type GenericDict<K extends GenericId, V> = {
  [id in K]?: V
}

//

// export type MicroStateId = string | number
export type MicroStateId = GenericId;
export type MicroTransitionId = GenericId;

interface MicroTransitionFn<S extends MicroStateId, T extends MicroTransitionId, C> {
  (this: TransitionMachine<S, T, C>, args: any): Promise<S> | S
}

export type MicroState<S extends MicroStateId, T extends MicroTransitionId, C> = MicroTransitionFn<S, T,  C>

// type MicroStates<S extends MicroStateId, C> = {
//   [id in S]?: MicroState<S, C>
// }
type MicroStates<S extends MicroStateId, T extends MicroTransitionId, C> = GenericDict<S, MicroState<S, T,  C>>

export interface MicroSchema<S extends MicroStateId, T extends MicroTransitionId, C> {
  initial?: S
  // final?: S | S[]
  states: MicroStates<S, T,  C>
}

interface MicroMachineConstructorArguments<S extends MicroStateId, T extends MicroTransitionId, C> {
  schema: MicroSchema<S, T, C>
  context: C
}

export class TransitionMachine<S extends MicroStateId, T extends MicroTransitionId, C> {
  _current: S
  _schema: MicroSchema<S, T, C>
  _context: C

  constructor({schema, context}: MicroMachineConstructorArguments<S, T, C>) {
    this._schema = schema;
    this._context = context;
    this.init();
  }

  init(): void {
    this._current = this._schema.initial;
  }

  async _exec(transitionId: MicroTransitionId, fromStateId: S): Promise<S> {
    const fromState = this._schema.states[fromStateId];
    if (!fromState) throw new Error(`Invalid event/transaction "${fromStateId}"`);

    const transitionFn = fromState[transitionId].bind(this);
    const toStateId = await transitionFn(this._context);

    console.log(`[${fromStateId}] >> [${toStateId}]`);
    return toStateId;
  }

  async exec(transitionId: MicroTransitionId): Promise<void> {
    this._current = await this._exec(transitionId, this._current);
  }

}
