<template>
  <div>
    <!-- Если не вошли - показываем страницу входа -->
    <LoginPage v-if="!userId" @login-success="onLogin" />

    <!-- Если вошли - показываем наше приложение -->
    <div v-else>
      <MainPage 
        v-if="currentPage === 'main'" 
        :userId="userId" 
        @navigate="changePage" 
        @logout="logout"
      />
      <StatsPage 
        v-if="currentPage === 'stats'" 
        :userId="userId" 
        @navigate="changePage" 
        @logout="logout"
      />
      <ProfilePage 
        v-if="currentPage === 'profile'" 
        :userId="userId" 
        @navigate="changePage" 
        @logout="logout"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LoginPage from './components/LoginPage.vue'
import MainPage from './components/MainPage.vue'
import StatsPage from './components/StatsPage.vue'
import ProfilePage from './components/ProfilePage.vue'

const userId = ref(null)
const currentPage = ref('main')

onMounted(() => {
  const savedId = localStorage.getItem('habitUserId')
  if (savedId) {
    userId.value = parseInt(savedId)
  }
})

const onLogin = (id) => {
  userId.value = id
  localStorage.setItem('habitUserId', id)
  currentPage.value = 'main'
}

const changePage = (page) => {
  currentPage.value = page
}

// Выход из профиля
const logout = () => {
  localStorage.removeItem('habitUserId')
  userId.value = null
  currentPage.value = 'main'
}
</script>