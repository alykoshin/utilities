import {Machine, States}  from '../../../../src/machine/'

export enum ElevatorStates {
  Closed,
  Opened,
  Moving
}

export enum ElevatorTransitions {
  Close,
  Open,
  Move,
  Stop,
}

export const start = ElevatorStates.Closed;
export const final = [];

export const states: States<ElevatorStates, ElevatorTransitions> = {
  [ElevatorStates.Closed]: {
    transitions: {
      [ElevatorTransitions.Open]: ElevatorStates.Opened,
    },
  },
  [ElevatorStates.Opened]: {
    transitions: {
      [ElevatorTransitions.Close]: ElevatorStates.Closed,
      [ElevatorTransitions.Move]: ElevatorStates.Moving,
    },
  },
  [ElevatorStates.Moving]: {
    transitions: {
      [ElevatorTransitions.Stop]: ElevatorStates.Closed,
    },
  },
};

//

// union type equivalent
const doorStateKeys = {
  Closed: 'c',
  Opened: 'o',
} as const;
type DoorStates = typeof doorStateKeys[keyof typeof doorStateKeys]; // 'r' | 'w' | 'x'
// export enum DoorStates {
//   Closed,
//   Opened,
// }

const motorStateList = ['moving', 'stopped'] as const;
type MotorStates = typeof motorStateList[number]; // 'moving' | 'stopped'

// export enum MotorStates {
//   Moving,
//   Stopped,
// }

export const doorStates: States<DoorStates,ElevatorTransitions> = {
  c: {
    transitions: {
      [ElevatorTransitions.Open]: 'o',
    },
  },
  o: {
    transitions: {
      [ElevatorTransitions.Close]: 'c',
    },
  },
};

export const motorStates: States<MotorStates,ElevatorTransitions> = {
  stopped: {
    transitions: {
      [ElevatorTransitions.Move]: 'moving',
    },
  },
  moving: {
    transitions: {
      [ElevatorTransitions.Stop]: 'stopped',
    },
  },
};

// // Declare the valid state transitions to model your system
//
// // Doors can go from opened to closed, and vice versa
// fsm.from(Elevator.Opened).to(Elevator.Closed);
// fsm.from(Elevator.Closed).to(Elevator.Opened);
//
// // Once the doors are closed the elevator may move
// fsm.from(Elevator.Closed).to(Elevator.Moving);
//
// // When the elevator reaches its destination, it may stop moving
// fsm.from(Elevator.Moving).to(Elevator.Closed);
//
// // Check that the current state is the initial state
// if(fsm.is(Elevator.Opened)){
//   console.log("The doors are open Dave");
// }
//
//
// // Test validity of transitions from the current state, in this case 'Elevator.Opened'
// fsm.canGo(Elevator.Closed); // returns true
// fsm.canGo(Elevator.Moving); //returns false
//
// // Go to a new state, closing the elevator doors.
// fsm.go(Elevator.Closed); // The fsm.currentState is now set to 'Elevator.Closed'
//
// // The elevator can now move or open the doors again
// fsm.canGo(Elevator.Moving); // returns true
// fsm.canGo(Elevator.Opened); //returns true
