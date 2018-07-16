
export default [
  {
    path: '/',
    component: () => import('layouts/default'),
    children: [
      { path: '', 
      component: () => import('pages/index') ,
        children: [
            { path: '', redirect : '/transfers' },
            { path: 'transfers', component: () => import('pages/transfers') },
            { path: 'hodlers', component: () => import('pages/hodlers') },
            // { path: 'votes', component: () => import('pages/xxxxx') },
            // { path: 'members', component: () => import('pages/hodxxxxlers') },
        ]
      },
      // { path: '/account', component: () => import('pages/account') }
    ]
  },
  {
    path: '/account', 
    component: () => import('layouts/default'),
    children: [
      { path: ':accountname', component: () => import('pages/account') }
    ]

  },
    {
    path: '/transaction', 
    component: () => import('layouts/default'),
    children: [
      { path: ':transactionid', component: () => import('pages/transaction') }
    ]

  },

  { // Always leave this as last one
    path: '*',
    component: () => import('pages/404')
  }
]
