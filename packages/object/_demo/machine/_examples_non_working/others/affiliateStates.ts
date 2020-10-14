import {Machine, Schema, States}  from '../../../../src/machine'

const affiliateStates: States<string,string> = {
  new:    {
    name:        'New',
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
              template: 'becomeAffiliateReviewStart',
              url: 'becomeAffiliateStep1',
            }
          ],
          buttonAttr: '',
        }
      },
    },
    data:        {
      reviewMessage: [
        'This is new Become an Affiliate Application. Please click "Start Review" to mark it as under review.'

      ],

      statusMessage: ['Your application was sent for review'],
    }
  },
  review: {
    name:        'Review',
    transitions: {
      'approve': {
        to: 'approved',
        name: 'Approve',
        //allowed: (context) => intersection(context && context.roles || [], [ 'admin', 'review' ]).length > 0,
        data: {
          roles: ['admin', 'review'],
          after: [
            {
              action: 'email',
              //  roles: [ 'admin', 'review' ],
              owner: true,
              subject: 'Congratulations! Your have been registered as an affiliate on our platform | ' +
                'Felicidades! Estás registrado como afiliado en Nuestra Plataforma',
              template: 'becomeAffiliateReviewApprove',
              url: 'becomeAffiliateStep1', // 'currentUserRoute',
            }
          ],
          buttonAttr: 'success',
          reviewMessage: [
            'This Become an Affiliate Application is marked as currently reviewed by ... staff.',
            'You can reject it, request user for appropriate hours to contact or approve the user as ... Driver',
          ],


        },
      },
      'request-more': {
        to: 'review',
        name: 'Need More Info',
        //allowed: (context) => intersection(context && context.roles || [], [ 'admin', 'review' ]).length > 0,
        data: {
          roles: ['admin', 'review'],
          after: [
            {
              action: 'email',
              //  roles: [ 'admin', 'review' ],
              owner: true,
              subject: 'We reviewed your affiliate application and determined we need a little more info from you | ' +
                'Revisamos tu solicitud para ser un afiliado ... y hemos determinado que necesitamos más información',
              template: 'becomeAffiliateReviewMore',
              url: 'becomeAffiliateStep1', // 'currentUserRoute',
            }
          ],
          buttonAttr: ''
        },
      },
      'reject': {
        to: 'rejected',
        name: 'Reject',
        //allowed: (context) => intersection(context && context.roles || [], [ 'admin', 'review' ]).length > 0,
        data: {
          roles: ['admin', 'review'],
          after: [
            {
              action: 'email',
              //  roles: [ 'admin', 'review' ],
              owner: true,
              subject: 'We are currently unable to add you as an affiliate to the ... platform | ' +
                'En este momento no podemos aprobarte como afiliado en la plataforma ...',
              template: 'becomeAffiliateReviewReject',
              url: 'becomeAffiliateStep1', // 'currentUserRoute',
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
    data:        {
      reviewMessage:
        [
          'This Become an Affiliate Application is marked as currently reviewed by ... staff.',
          'You can reject it or approve the user as ... Affiliate' ,
        ] ,
    }
  },

  rejected: {
    name:        'Rejected',
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

  approved: {
    name:        'Approved',
    transitions: {
      'back': {
        to:    'review',
        name:  'Back to Review',
        data:  {
          roles: [ 'admin' ],
          buttonAttr: 'secondary',
        },
      },
      'activate': {
        to:    'active',
        name:  'Activate',
        data:  {
          roles: [ 'admin' ],
          buttonAttr: 'secondary',
        },
      }
    },
  },

  active: {
    name:        'Active',
    transitions: {
      'back': {
        to: 'approved',
        name: 'Back to Approved',
        data: {
          roles: ['admin'],
          buttonAttr: 'secondary',
        },
      },
      'deactivate': {
        to: 'inactive',
        name: 'Make Inactive',
        data: {
          roles: ['admin'],
          buttonAttr: 'danger',
        },
      },
    },
  },

  inactive: {
    name:        'Inactive',
    transitions: {
      'activate-again': {
        to: 'active',
        name: 'Activate again',
        data: {
          roles: ['admin'],
          buttonAttr: 'secondary',
        },
      },
    },
  },

};

