import {Machine, States}  from '../../'

const driverStates: States<string,string> = {
  new: {
    name: 'New',
    transitions: {
      'start-review': {
        name: 'Start Review',
        to: 'review',
        //allowed: (context) => intersection(context && context.roles || [], [ 'admin', 'review' ]).length > 0,
        data: {
          roles: ['admin', 'review'],
          after: [
            {
              action: 'email',
              //  roles: [ 'admin', 'review' ],
              owner: true,
              subject: 'Review of your application has been started by ... staff | ' +
                '... Inició la Revisión de tu Solicitud',
              template: 'becomeDriverReviewStart',
              url: 'becomeDriverStep1',
            }
          ],
          // },
          // data: {
          buttonAttr: '',
        }
      },
    },
    data: {
      reviewMessage:
        [
          'This is new Become a Driver Application. Please click "Start Review" to mark it as under review.'
        ] ,
    }
  },
  review:    {
    name: 'Review',
    transitions: {
      'approve': {
        to: 'approved',
        name: 'Approve',
        data: {
          roles: ['admin', 'review'],
          after: [
            {
              action: 'email',
              //  roles: [ 'admin', 'review' ],
              owner: true,
              subject: 'Congratulations! | ' +
                'Felicidades!',
              template: 'becomeDriverReviewApprove',
              url: 'becomeDriverStep1', // 'currentUserRoute',
            }
          ],
          buttonAttr: 'success',
        },
      },
      //{
      //  id:    'request-more',
      //  to:    'review',
      //  name:  'Need to contact',
      //  //allowed: (context) => intersection(context && context.roles || [], [ 'admin', 'review' ]).length > 0,
      //  roles: [ 'admin', 'review' ],
      //  data: { buttonAttr: '' },
      //},
      'reject': {
        to: 'rejected',
        name: 'Reject',
        data: {
          roles: ['admin', 'review'],
          after: [
            {
              action: 'email',
              //  roles: [ 'admin', 'review' ],
              owner: true,
              subject: 'We are currently unable to add! | ' +
                'En este momento no podemos aprobar!',
              template: 'becomeDriverReviewReject',
              url: 'becomeDriverStep1', // 'currentUserRoute',
            }
          ],
          buttonAttr: 'danger',
        },
      },
      'back': {
        to: 'new',
        name: 'Back to New',
        data: {
          roles: ['admin'],
          buttonAttr: 'secondary',
        },
      },
    },
    data: {
      reviewMessage:   [
        'This Become a Driver Application is marked as currently reviewed by ... staff.',
        'You can reject it or approve the user as ... Driver'
      ],
    }
  },

  rejected:  {
    name: 'Rejected',
    transitions: {
      'back': {
        to: 'review',
        name: 'Back to Review',
        data: {
          roles: ['admin'],
          buttonAttr: 'secondary',
        },
      },
    },
  },

  approved:  {
    name: 'Approved',
    transitions: {
      'activate': {
        to: 'active',
        name: 'Activate',
        data: {
          roles: ['admin'],
          buttonAttr: 'secondary',
        },
      },
      'back': {
        to: 'review',
        name: 'Back to Review',
        data: {
          roles: ['admin'],
          buttonAttr: 'secondary',
        },
      },
    },
  },

  active:  {
    name: 'Active',
    transitions: {
      'back': {
        to: 'approved',
        name: 'Back to Approved',
        data: {
          roles: ['admin'],
          buttonAttr: 'secondary',
        },
      },
    },
  },

};
