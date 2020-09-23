import {Machine, States, BaseStateClass} from '../../'

enum SlothState {
  Idle = 'Idle',
  Sleeping = 'Sleeping',
  Eating = 'Eating',
  Working = 'Working',
  Dead = 'Dead',
}

enum SlothTransition {
  Sleep = 'Sleep',
  Wake = 'Wake',
  Eat = 'Eat',
  Work = 'Work',
  Stop = 'Stop',
  Die = 'Die',
}

export const initial: SlothState = SlothState.Idle;
export const final: SlothState[] = [SlothState.Dead];

class SlothDataModel {
  hunger: number
  fatigue: number
  age: number
}

class SlothOptions {
  hungerDelta: number
  fatigueDelta: number
}

//

type SlothMachine = Machine<SlothState,SlothTransition>;

interface IBaseSlothState {
  tick (): Promise<void>
  kill (): Promise<SlothState>
}

class BaseSlothState extends BaseStateClass<SlothState,SlothTransition,SlothDataModel,SlothOptions> implements IBaseSlothState {
  constructor(machine: SlothMachine, dataModel: SlothDataModel, options: SlothOptions) {
    super(machine, dataModel, options);
  }
  async tick (): Promise<void> {
    this.dataModel.hunger += this.options.hungerDelta;
    this.dataModel.fatigue += this.options.fatigueDelta;
    this.dataModel.age += 1;
    if (this.dataModel.hunger > 10) {
      await this.castEvent(SlothTransition.Die);
    }
    if (this.dataModel.age > 100) {
      await this.castEvent(SlothTransition.Die);
    }
  }
  async kill (): Promise<SlothState> {
    return this.castEvent(SlothTransition.Die);
  }
}

class IdleState extends BaseSlothState {
  constructor(machine: SlothMachine, dataModel: SlothDataModel, options: SlothOptions) {
    super(machine, dataModel, { ...options, hungerDelta: 0.5, fatigueDelta: -0.5 });
  }
}

class SleepingState extends BaseSlothState {
  constructor(machine: SlothMachine, dataModel: SlothDataModel, options: SlothOptions) {
    super(machine, dataModel, { ...options, hungerDelta: 0.5, fatigueDelta: -1 });
  }
}

class EatingState extends BaseSlothState {
  constructor(machine: SlothMachine, dataModel: SlothDataModel, options: SlothOptions) {
    super(machine, dataModel, { ...options, hungerDelta: -1, fatigueDelta: 0.5 });
  }
  async tick (): Promise<void> {
    await super.tick();
    if (this.dataModel.hunger <= 0) {
      await this.castEvent(SlothTransition.Stop);
    }
    if (this.dataModel.fatigue > 10) {
      this.castEvent(SlothTransition.Stop);
    }
  }
}

class WorkingState extends BaseSlothState {
  constructor(machine: SlothMachine, dataModel: SlothDataModel, options: SlothOptions) {
    super(machine, dataModel, { ...options, hungerDelta: 1, fatigueDelta: 1 });
  }
  async tick (): Promise<void> {
    await super.tick();
    if (this.dataModel.fatigue > 10) {
      this.castEvent(SlothTransition.Stop);
    }
    // this.dataModel.hunger--;
  }
}

//

export const states: States<SlothState,SlothTransition> = {
  [SlothState.Idle]: {
    transitions: {
      [SlothTransition.Sleep]: SlothState.Sleeping,
      [SlothTransition.Eat]: SlothState.Eating,
      [SlothTransition.Work]: SlothState.Working,
      [SlothTransition.Die]: SlothState.Dead,
    },
    handler: IdleState,
  },
  [SlothState.Sleeping]: {
    transitions: {
      [SlothTransition.Wake]: SlothState.Idle,
      [SlothTransition.Die]: SlothState.Dead,
    },
  },
  [SlothState.Working]: {
    transitions: {
      [SlothTransition.Stop]: SlothState.Idle,
      [SlothTransition.Die]: SlothState.Dead,
    },
  },
  [SlothState.Eating]: {
    transitions: {
      [SlothTransition.Stop]: SlothState.Idle,
      [SlothTransition.Die]: SlothState.Dead,
    },
  },
  [SlothState.Dead]: {
  },
};

// fsm.start(); // Don't forget
//
// console.log(fsm.current); // You can get current state
//
// if (fsm.can(SlothTransition.Sleep)) {
//   fsm.do(SlothTransition.Sleep);
// }
