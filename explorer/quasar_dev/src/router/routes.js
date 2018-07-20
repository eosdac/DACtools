
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
            { path: 'holders', component: () => import('pages/hodlers') },
            // { path: 'votes', component: () => import('pages/xxxxx') },
            // { path: 'members', component: () => import('pages/hodxxxxlers') },
        ]
      },

      { path: 'account/:accountname', component: () => import('pages/account') },
      { path: 'transaction/:transactionid', component: () => import('pages/transaction') },
      // { path: 'test', component: () => import('pages/testpage') }

    ]
  },


  { // Always leave this as last one
    path: '*',
    component: () => import('pages/404')
  }
]
