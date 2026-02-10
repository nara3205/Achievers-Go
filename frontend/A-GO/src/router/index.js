import { createRouter, createWebHistory } from 'vue-router'

import Login from '../components/Login.vue'
import StudentDashboard from '../components/student_dashboard/StudentDashboard.vue'
import TeacherDashboard from '../components/teacher_dashboard/TeacherDashboard.vue'
import TeacherSubjectsDashboard from '../components/teacher_subjects/TeacherSubjectsDashboard.vue'
import TeacherEvaluation from '@/components/teacher_evaluation/TeacherEvaluation.vue'
import TeacherEditAssignment from '@/components/teacher_edit_assignmment/TeacherEditAssignment.vue'
import TeacherPeople from '@/components/teacher_people/TeacherPeople.vue'
import StudentSubjectsDashboard from '@/components/student_subjects/StudentSubjectsDashboard.vue'
import StudentSettings from '@/components/student_settings/StudentSettings.vue'

// Utils
function getLoggedUser() {
  const saved = localStorage.getItem("loggedUser")
  return saved ? JSON.parse(saved) : null
}
function getActualSubject() {
  return JSON.parse(localStorage.getItem("actualSubject")).id_subject || null
}
function getActualAssignment() {
  return JSON.parse(localStorage.getItem("actualAssignment")).id || null
}

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/student/:id',
    name: 'StudentDashboard',
    component: StudentDashboard,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/:id/subject/:subject',
    name: 'StudentSubjectsDashboard',
    component: StudentSubjectsDashboard,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/:id/subject/:subject/edit',
    name: 'StudentSettings',
    component: StudentSettings,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/teacher/:id',
    name: 'TeacherDashboard',
    component: TeacherDashboard,
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/teacher/:id/subject/:subject',
    name: 'TeacherSubjectsDashboard',
    component: TeacherSubjectsDashboard,
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/teacher/:id/subject/:subject/edit-assignment/:assignment',
    name: 'TeacherEditAssignment',
    component: TeacherEditAssignment,
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/teacher/:id/subject/:subject/evaluation/',
    name: 'TeacherEvaluation',
    component: TeacherEvaluation,
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/teacher/:id/subject/:subject/people',
    name: 'TeacherPeople',
    component: TeacherPeople,
    meta: { requiresAuth: true, role: 'teacher' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const user = getLoggedUser()

  if (!user && to.name !== 'Login') {
    return next('/login')
  }

  if (user && to.name === 'Login') {
    return next(`/${user.tipus}/${user.id}`)
  }

  if (to.meta.role && user?.tipus !== to.meta.role) {
    return next('/login')
  }

  if (to.params.id && String(user?.id) !== to.params.id) {
    return next(`/${user.tipus}/${user.id}`)
  }

  if (to.params.subject && to.params.subject!=getActualSubject()) {
    return next(`/${user.tipus}/${user.id}`)
  }
  if (to.params.assignment && to.params.assignment != getActualAssignment()) {
    return next(`/${user.tipus}/${user.id}`)
  }

  next()
})


export default router
