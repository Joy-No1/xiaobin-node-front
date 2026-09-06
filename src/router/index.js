import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/splash',
    component: () => import('../views/SplashPage.vue')
  },
  {
    path: '/login',
    component: () => import('../views/auth/LoginPage.vue')
  },
  {
    path: '/register',
    component: () => import('../views/auth/RegisterPage.vue')
  },
  {
    path: '/',
    component: () => import('../views/main/MainShell.vue'),
    children: [
      {
        path: '',
        redirect: '/relationship'
      },
      {
        path: 'relationship',
        component: () => import('../views/relationship/RelationshipPage.vue')
      },
      {
        path: 'relationship/score/:id',
        component: () => import('../views/relationship/ScorePage.vue'),
        props: route => ({ relationshipId: Number(route.params.id) })
      },
      {
        path: 'relationship/score-history/:id',
        component: () => import('../views/relationship/ScoreHistoryPage.vue'),
        props: route => ({ relationshipId: Number(route.params.id) })
      },
      {
        path: 'relationship/score-items/:id',
        component: () => import('../views/relationship/ScoreItemsPage.vue'),
        props: route => ({ relationshipId: Number(route.params.id) })
      },
      {
        path: 'square',
        component: () => import('../views/square/SquarePage.vue')
      },
      {
        path: 'square/post/:id',
        component: () => import('../views/square/PostDetailPage.vue'),
        props: route => ({ postId: route.params.id })
      },
      {
        path: 'square/create',
        component: () => import('../views/square/CreatePostPage.vue')
      },
      {
        path: 'chat',
        component: () => import('../views/chat/ConversationsPage.vue')
      },
      {
        path: 'chat/:conversationId',
        component: () => import('../views/chat/ChatPage.vue'),
        props: route => ({ conversationId: Number(route.params.conversationId) })
      },
      {
        path: 'profile',
        component: () => import('../views/profile/MyProfilePage.vue')
      },
      {
        path: 'profile/edit',
        component: () => import('../views/profile/EditProfilePage.vue')
      },
      {
        path: 'profile/my-following',
        component: () => import('../views/profile/MyFollowingPage.vue')
      },
      {
        path: 'profile/my-likes',
        component: () => import('../views/profile/MyLikesPage.vue')
      },
      {
        path: 'profile/my-comments',
        component: () => import('../views/profile/MyCommentsPage.vue')
      },
      {
        path: 'profile/:userId',
        component: () => import('../views/profile/UserProfilePage.vue'),
        props: route => ({ userId: Number(route.params.userId) })
      },
      {
        path: 'settings',
        component: () => import('../views/settings/SettingsPage.vue')
      },
      {
        path: 'settings/change-password',
        component: () => import('../views/settings/ChangePasswordPage.vue')
      },
      {
        path: 'settings/change-phone',
        component: () => import('../views/settings/ChangePhonePage.vue')
      },
      {
        path: 'settings/real-name',
        component: () => import('../views/settings/RealNamePage.vue')
      },
      {
        path: 'settings/devices',
        component: () => import('../views/settings/DevicesPage.vue')
      },
      {
        path: 'settings/storage',
        component: () => import('../views/settings/StoragePage.vue')
      },
      {
        path: 'settings/about',
        component: () => import('../views/settings/AboutPage.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from) => {
  const auth = useAuthStore()
  const publicPages = ['/splash', '/login', '/register']
  if (!auth.isLoggedIn() && !publicPages.includes(to.path)) {
    return '/login'
  }
  if (auth.isLoggedIn() && (to.path === '/login' || to.path === '/register')) {
    return '/'
  }
})

export default router
