import { intersection } from 'lodash'

import {Machine, States}  from '../../../src'

export enum OrderStatus {
  STATUS_PENDING   = 'pending',
  STATUS_PLACED    = 'placed',
  STATUS_PICKED_UP = 'picked-up',
  STATUS_CANCELLED = 'cancelled',
  STATUS_DELIVERED = 'delivered',
}

export type OrderTransitions = OrderStatus;


// Template._changeStatus.helpers({
//
//   // selectedOrder: function() {
//   //   return Template.instance().selectedOrder();
//   // },
//
//   getAvailableStatuses: function(currentStatus) {
//
//     function isAdmin() {
//       return Meteor.user() && Meteor.user().isAdmin;
//     }
//
//     function isCourier() {
//       return Meteor.user() && Meteor.user().isCourier;
//     }
//
//     var res ;
//
//     // User can be both Admin & Courier, first we check for Admin
//     if (isAdmin()) { // Available status transitions for Admin
//       switch (currentStatus) {
//         case Orders.STATUS_PENDING:
//           res = [Orders.STATUS_PLACED, Orders.STATUS_CANCELLED];
//           break;
//         case Orders.STATUS_PLACED:
//           res = [Orders.STATUS_PICKED_UP, Orders.STATUS_CANCELLED];
//           break;
//         case Orders.STATUS_PICKED_UP:
//           res = [Orders.STATUS_DELIVERED, Orders.STATUS_CANCELLED];
//           break;
//         //case Orders.STATUS_CANCELLED:
//         //case Orders.STATUS_DELIVERED:
//         default:
//           res = [Orders.STATUS_PENDING];
//       }
//
//       // If user is not Admin, then we check if he is  Courier
//     } else if (isCourier()) { // Available status transitions for Courier
//       switch (currentStatus) {
//         case Orders.STATUS_PLACED:
//           res = [Orders.STATUS_PICKED_UP];
//           break;
//         case Orders.STATUS_PICKED_UP:
//           res = [Orders.STATUS_DELIVERED];
//           break;
//         //case Orders.STATUS_CANCELLED:
//         //case Orders.STATUS_DELIVERED:
//         //case Orders.STATUS_PENDING:
//         default:
//           res = [];
//       }
//     } else {
//       res = [];
//     }
//
//     return res.map( function(value) { return {value: value}; } );
//   }
// });

const initial = OrderStatus.STATUS_PENDING;
const final = OrderStatus.STATUS_DELIVERED;  // [] ????
export const adminStatuses: States<OrderStatus,OrderTransitions> = {
  [OrderStatus.STATUS_PENDING]: {
    transitions: {
      [OrderStatus.STATUS_PLACED]: OrderStatus.STATUS_PLACED,
      [OrderStatus.STATUS_CANCELLED]: OrderStatus.STATUS_CANCELLED,
    },
  },
  [OrderStatus.STATUS_PLACED]: {
    transitions: {
      [OrderStatus.STATUS_PICKED_UP]: OrderStatus.STATUS_PICKED_UP,
      [OrderStatus.STATUS_CANCELLED]: OrderStatus.STATUS_CANCELLED,
    },
  },
  [OrderStatus.STATUS_PICKED_UP]: {
    transitions: {
      [OrderStatus.STATUS_DELIVERED]: OrderStatus.STATUS_DELIVERED,
      [OrderStatus.STATUS_CANCELLED]: OrderStatus.STATUS_CANCELLED,
    },
  },
  [OrderStatus.STATUS_CANCELLED]: {},
  [OrderStatus.STATUS_DELIVERED]: {},
}

export const courierStatuses: States<OrderStatus,OrderTransitions> = {
  [OrderStatus.STATUS_PENDING]: {},
  [OrderStatus.STATUS_PLACED]: {
    transitions: {
      [OrderStatus.STATUS_PICKED_UP]: OrderStatus.STATUS_PICKED_UP,
    },
  },
  [OrderStatus.STATUS_PICKED_UP]: {
    transitions: {
      [OrderStatus.STATUS_DELIVERED]: OrderStatus.STATUS_DELIVERED,
    },
  },
  [OrderStatus.STATUS_CANCELLED]: {},
  [OrderStatus.STATUS_DELIVERED]: {},
}
console.log('courierStatuses:', courierStatuses);


export const allStatuses: States<OrderStatus,OrderTransitions> = {
  [OrderStatus.STATUS_PENDING]: {
    transitions: {
      [OrderStatus.STATUS_PLACED]: {
        // before: async ({ context }) => intersection(context?.user?.roles ?? [], [ 'admin' ]),
        before: async ({ transition, context }) => intersection(context?.user?.roles ?? [], transition?.data?.roles ?? []),
        to: OrderStatus.STATUS_PLACED,
        data: {
          roles: [ 'admin' ],
        },
      },
      [OrderStatus.STATUS_CANCELLED]: OrderStatus.STATUS_CANCELLED,
    },
  },
  [OrderStatus.STATUS_PLACED]: {
    transitions: {
      [OrderStatus.STATUS_PICKED_UP]: OrderStatus.STATUS_PICKED_UP,
      [OrderStatus.STATUS_CANCELLED]: OrderStatus.STATUS_CANCELLED,
    },
  },
  [OrderStatus.STATUS_PICKED_UP]: {
    transitions: {
      [OrderStatus.STATUS_DELIVERED]: OrderStatus.STATUS_DELIVERED,
      [OrderStatus.STATUS_CANCELLED]: OrderStatus.STATUS_CANCELLED,
    },
  },
  [OrderStatus.STATUS_CANCELLED]: {},
  [OrderStatus.STATUS_DELIVERED]: {},
}

const courierStatuses_: States<OrderStatus,OrderTransitions> = {
  [OrderStatus.STATUS_PENDING]: {},
  [OrderStatus.STATUS_PLACED]: {
    transitions: {
      [OrderStatus.STATUS_PICKED_UP]: OrderStatus.STATUS_PICKED_UP,
    },
  },
  [OrderStatus.STATUS_PICKED_UP]: {
    transitions: {
      [OrderStatus.STATUS_DELIVERED]: OrderStatus.STATUS_DELIVERED,
    },
  },
  [OrderStatus.STATUS_CANCELLED]: {},
  [OrderStatus.STATUS_DELIVERED]: {},
}

