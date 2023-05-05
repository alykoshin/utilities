import {Machine, Schema, States}  from '../../../src'

const merchantStates: States<string,string> = {
  new: {
    name: 'New',
    transitions: {
      'start-review': {
        name: 'Start Review',
        to: 'review',
        //allowed: (context) => intersection(context && context.roles || [], [ 'admin', 'review' ]).length > 0,
        data: {
          roles: ['admin', 'review'],
          buttonAttr: '',
          mutationName: 'reviewStart',
          mutationFnName: 'mutationReviewStart',
        }
      },
    },
    data: {
      reviewMessage: [
        'This is new Become a Merchant Application. Please click Start Review to mark it as under review.'
      ],
      statusMessage: [
        'Your application was sent and awaiting for review by ... staff.',
        //'test',
      ],
    },
  },
  review:    {
    name: 'Review',
    transitions: {
      'approve': {
        to: 'approved',
        name: 'Approve',
        //allowed: (context) => intersection(context && context.roles || [], [ 'admin', 'review' ]).length > 0,
        data: {
          roles: ['admin', 'review'],
          buttonAttr: 'success',
          mutationName: 'reviewApprove',
          mutationFnName: 'mutationReviewApprove',
        }
      },
      'request-more': {
        to: 'review',
        name: 'Need to contact',
        //allowed: (context) => intersection(context && context.roles || [], [ 'admin', 'review' ]).length > 0,
        data: {
          roles: ['admin', 'review'],
          buttonAttr: '',
          mutationName: 'reviewMore',
          mutationFnName: 'mutationReviewMore',
        },
      },
      'reject': {
        to: 'reject',
        name: 'Reject',
        //allowed: (context) => intersection(context && context.roles || [], [ 'admin', 'review' ]).length > 0,
        data: {
          roles: ['admin', 'review'],
          buttonAttr: 'danger',
          mutationName: 'reviewReject',
          mutationFnName: 'mutationReviewReject',
        },
      },
      //{
      //  id:    'back',
      //  to:    'new',
      //  name:  'Back to New',
      //  roles: [ 'admin' ],
      //  data: {
      //    buttonAttr:    'secondary',
      //  },
      //},
    },
    data: {
      reviewMessage:    [
        'This Become a Merchant Application is marked as currently reviewed by ... staff.',
        'You can either reject it, request user for appropriate hours to contact or approve the user as ... Merchant',

      ],

      statusMessage: [
        'Review of your application has been started by ... staff.',
        //  'test',
      ],
      //<p>Review of your application has been started by ... staff.</p>,
    },
  },
  rejected:  {
    name: 'Rejected',
    transitions: {
      // 'back': {
      //    to:    'review',
      //    name:  'Back to Review',
      //    data: {
      //      roles: [ 'admin' ],
      //      buttonAttr:    'secondary',
      //    },
      //  },
    },
    data: {
      statusMessage:   [

        'thankYouUnable',
        '- We cannot legally offer your products on the platform yet.',
        '- Business name is a registered trademark.',
        '- We have determined our platform is not a good match for your business.',
        'We do appreciate your interest in ... and wish you great success in your business ventures. Please do stop by ... in the future to see if we are able to offer your products at a future date.',
        'Best regards,',
        'Your ... Team!',
      ],

    },
  },
  approved:  {
    name: 'Approved',
    transitions: {
      'activate': {
        to: 'active',
        name: 'Make active',
        data: {
          roles: ['admin'],
          buttonAttr: 'secondary',
          mutationName: 'makeTransition',
          //mutationFnName: 'mutationMakeTransition',
        },
      },
      //  'back': {
      //    to:    'review',
      //    name:  'Back to Review',
      //    data: {
      //      roles: [ 'admin' ],
      //      buttonAttr:    'secondary',
      //    },
      //  },
    },
    data: {
      statusMessage:   [    //!!!
        `Congratulations! Your application was approved by ...!`,
        //"Follow " + <Link to=${becomeMerchantStep2FormRoute}>this link</Link> +  " to finish filling the data and start your business on ...!",
        //"Follow ", React.createElement(Link, {to:becomeMerchantStep2FormRoute}, 'this link'),  " to finish filling the data and start your business on ...!",
        //React.createElement(Link, {to:becomeMerchantStep2FormRoute}, 'Follow this link to finish filling the data and start your business on ...!'),
        // React.createElement(Fragment, {}, [
        //     'Follow ',
        //     <Link to={becomeMerchantStep2FormRoute} >this link</Link>,
        //     ' to finish filling the data and start your business on ...!'
        //   ]
        // ),
      ],

    },
  },
  active:    {
    transitions: {
      'deactivate': {
        to: 'approved',
        name: 'Back to Approved',
        data: {
          roles: ['admin'],
          buttonAttr: 'secondary',
          mutationName: 'makeTransition',
          //mutationFnName: 'mutationMakeTransition',
        },
      },
      //'published': {
      //  data: {
      //    roles: [],
      //    buttonAttr: 'success'
      //  },
      //},
    },
  },
  //published: {
  //  id: 'published',
  //  name: 'Published',
  //  transitions: {
  //    //'unpublish': {
  //    //  name:  'Unpublish',
  //    //  to:    'unpublished',
  //    //  roles: [],
  //    //  data: {
  //    //    buttonAttr: 'danger'
  //    //  },
  //    //},
  //  },
  //},
  //unpublished: {
  //  id: 'unpublished',
  //  name: 'Unpublished',
  //  transitions: {
  //    //'published': {
  //    //  data: {
  //    //    roles: [],
  //    //    buttonAttr: 'success'
  //    //  },
  //    //},
  //    //'inactive': {
  //    //  data: {
  //    //    roles: [],
  //    //    buttonAttr: 'danger'
  //    //  },
  //    //},
  //  },
  //},
  //inactive: {
  //  name: 'Inactive',
  //  transitions: {
  //    //unpublish: {
  //    //  to:    'unpublished',
  //    //  data: {
  //    //    roles: [],
  //    //    buttonAttr: 'success'
  //    //  },
  //    //},
  //  },
  //},
  //
  ////default: {
  ////  data: {
  ////    ReviewMessage:
  ////      <div>
  ////        <p>You have no available actions for Merchant in current state</p>
  ////      </div>
  ////  }
  ////}
};
