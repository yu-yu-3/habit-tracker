<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <img :src="starImg" alt="Звезда" class="logo-star-img" />
      <span class="logo-text">ТРЕКЕР<br>ПРИВЫЧЕК</span>
    </div>
    <nav class="sidebar-nav">
      <button class="nav-btn" :class="{ active: current === 'main' }" @click="$emit('navigate', 'main')">
        <span class="nav-icon">⌂</span> Главная
      </button>
      <button class="nav-btn" :class="{ active: current === 'stats' }" @click="$emit('navigate', 'stats')">
        <span class="nav-icon">▤</span> Статистика
      </button>
      <button class="nav-btn" :class="{ active: current === 'profile' }" @click="$emit('navigate', 'profile')">
        <span class="nav-icon">◉</span> Профиль
      </button>
    </nav>
    <button class="logout-btn" @click="$emit('logout')">
      <span class="nav-icon">⎋</span> Выйти
    </button>
  </aside>
</template>

<script setup>
import starImg from '../assets/star.png'
defineProps(['current'])
defineEmits(['navigate', 'logout'])
</script>

<style scoped>
.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: #F8F1E7;
  color: #013773;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-sizing: border-box;
  border-right: 2px solid #8F6A05;
  font-family: 'Playfair Display', serif;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 16px;
  border-bottom: 2px solid #8F6A05;
}

.logo-star-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.logo-text {
  font-weight: 600;
  font-size: 14px;
  line-height: 1.1;
  letter-spacing: 0.05em;
  color: #013773;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.nav-btn,
.logout-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 14px;
  border: 2px solid transparent;
  background: transparent;
  color: #013773;
  font-family: inherit;
  font-size: 15px;
  font-weight: 500;
  text-align: left;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}

.nav-btn:hover {
  border-color: #8F6A05;
}

.nav-btn.active {
  background: #013773;
  color: #F8F1E7;
  border-color: #013773;
}

.nav-icon {
  font-size: 16px;
}

.logout-btn {
  color: #013773;
  border: 2px solid #8F6A05;
  border-radius: 8px;
}

.logout-btn:hover {
  background: #013773;
  color: #F8F1E7;
}

@media (max-width: 700px) {
  .sidebar {
    width: 100%;
    flex-direction: row;
    align-items: center;
    padding: 12px 16px;
    gap: 12px;
    border-right: none;
    border-bottom: 2px solid #8F6A05;
  }
  .sidebar-logo {
    border-bottom: none;
    padding-bottom: 0;
  }
  .logo-text {
    display: none;
  }
  .sidebar-nav {
    flex-direction: row;
    gap: 4px;
  }
  .nav-btn {
    padding: 8px 10px;
    font-size: 13px;
  }
  .nav-btn span:not(.nav-icon) {
    display: none;
  }
  .logout-btn {
    padding: 8px 10px;
  }
}
</style>