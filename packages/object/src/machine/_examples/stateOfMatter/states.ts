import {Machine, States}  from '../../'

export const initial = 'solid';
export const final = [];

export const states: States<string,string> = {
  solid: {
    transitions: {
      melt: 'liquid',
    },
  },
  liquid: {
    transitions: {
      freeze: 'solid',
      vaporize: 'gas',
    },
  },
  gas: {
    transitions: {
      condense: 'liquid',
    },
  },
}
