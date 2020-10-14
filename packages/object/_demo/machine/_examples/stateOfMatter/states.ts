import {Machine, Schema, States}  from '../../../../src/machine'

export const initial = 'solid';
export const final = [];

export const states: States<'solid'|'liquid'|'gas','melt'|'freeze'|'vaporize'|'condense'> = {
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
