<template>
  <div class="login-page">
    <!-- Шапка -->
    <header class="header">
      <div class="header-logo">
        <img :src="starImg" alt="Звезда" class="logo-star-img" />
        <span class="logo-text">ТРЕКЕР ПРИВЫЧЕК</span>
      </div>
    </header>

    <!-- Основной контент -->
    <main class="main">
      <!-- Левая колонка -->
      <section class="left-col">
        <h1 class="hero-title">МАЛЕНЬКИЕ ПРИВЫЧКИ — БОЛЬШИЕ ПЕРЕМЕНЫ</h1>
        <div class="hero-illustration">
          <img :src="leftImg" alt="Иллюстрация" />
        </div>
      </section>

      <!-- Центральная форма -->
      <section class="form-col">
        <div class="form-card">
          <h2 class="form-title">Добро пожаловать!</h2>
          <p class="form-subtitle">начни путь к лучшей версии себя</p>

          <!-- Переключатель Вход / Регистрация -->
          <div class="tabs">
            <button
              class="tab"
              :class="{ active: isLogin }"
              @click="isLogin = true"
            >Вход</button>
            <button
              class="tab"
              :class="{ active: !isLogin }"
              @click="isLogin = false"
            >Регистрация</button>
          </div>

          <form @submit.prevent="submit" class="form">
            <div v-if="!isLogin" class="input-group">
              <span class="input-icon">👤</span>
              <input v-model="name" type="text" placeholder="Имя пользователя" required>
            </div>

            <div class="input-group">
              <span class="input-icon">✉</span>
              <input v-model="email" type="email" placeholder="Электронная почта" required>
            </div>

            <div class="input-group">
              <span class="input-icon">🔒</span>
              <input v-model="password" type="password" placeholder="Пароль" required>
            </div>

            <div v-if="!isLogin" class="input-group">
              <span class="input-icon">🔒</span>
              <input v-model="password2" type="password" placeholder="Повторите пароль" required>
            </div>

            <label v-if="isLogin" class="remember">
              <input type="checkbox" v-model="remember">
              <span class="checkbox-custom"></span>
              Запомнить меня
            </label>

            <p v-if="error" class="error">{{ error }}</p>

            <button type="submit" class="submit-btn">
              {{ isLogin ? 'Войти' : 'Зарегистрироваться' }} <span class="arrow">→</span>
            </button>
          </form>

          <p class="switch-hint">
            <template v-if="isLogin">Нет аккаунта? <a href="#" @click.prevent="isLogin = false">Зарегистрироваться</a></template>
            <template v-else>Уже есть аккаунт? <a href="#" @click.prevent="isLogin = true">Войти</a></template>
          </p>
        </div>
      </section>

      <!-- Правая колонка -->
      <section class="right-col">
        <div class="right-illustration">
          <img :src="rightImg" alt="Иллюстрация" />
        </div>
      </section>
    </main>

    <!-- Нижняя полоса с шагами -->
    <footer class="steps-bar">
      <div class="step">
        <img :src="trophyImg" alt="Кубок" class="step-img" />
        <span class="step-text">Выполняй задания</span>
        <span class="step-line"></span>
      </div>
      <div class="step">
        <img :src="middleImg" alt="Награда" class="step-img" />
        <span class="step-text">Получай награды</span>
        <span class="step-line"></span>
      </div>
      <div class="step">
        <img :src="starAwardImg" alt="Рост" class="step-img" />
        <span class="step-text">Расти каждый день</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// --- Импорт картинок из assets (латинские имена) ---
import starImg from '../assets/star.png'
import leftImg from '../assets/left-illustration.png'
import rightImg from '../assets/right-illustration.png'
import trophyImg from '../assets/trophy.png'
import middleImg from '../assets/award-middle.png'
import starAwardImg from '../assets/award-star.png'

const emit = defineEmits(['login-success'])
const isLogin = ref(true)
const name = ref('')
const email = ref('')
const password = ref('')
const password2 = ref('')
const remember = ref(true)
const error = ref('')

const submit = async () => {
  error.value = ''
  if (!isLogin.value && password.value !== password2.value) {
    error.value = 'Пароли не совпадают'
    return
  }

  const url = isLogin.value ? 'http://localhost:3000/api/login' : 'http://localhost:3000/api/register'
  const body = isLogin.value
    ? { email: email.value, password: password.value }
    : { name: name.value, email: email.value, password: password.value }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await res.json()
    if (data.success) {
      emit('login-success', data.userId)
    } else {
      error.value = data.error || 'Ошибка'
    }
  } catch (e) {
    error.value = 'Сервер недоступен. Проверь, запущен ли он.'
  }
}
</script>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  background: #F8F1E7;
}
</style>

<style scoped>
/* --- Общие --- */
.login-page {
  font-family: 'Playfair Display', serif;
  min-height: 100vh;
  width: 100%;
  background: #F8F1E7;
  display: flex;
  flex-direction: column;
  padding: 12px 16px 0;
  box-sizing: border-box;
}

/* --- Шапка --- */
.header {
  background: #F8F1E7;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 12px 24px;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-star-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.logo-text {
  font-weight: 600;
  font-size: 20px;
  letter-spacing: 0.02em;
}

/* --- Основной контент: три колонки на всю ширину --- */
.main {
  flex: 1;
  display: flex;
  gap: 16px;
  align-items: stretch;
  width: 100%;
  min-height: 0;
}

.left-col, .right-col {
  flex: 1 1 0;
  background: #F8F1E7;
  border-radius: 16px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  min-width: 0;
}

.hero-title {
  font-weight: 400;
  font-size: clamp(28px, 3.2vw, 48px);
  line-height: 1.05;
  letter-spacing: -0.02em;
  margin: 0 0 20px 0;
}

.hero-illustration,
.right-illustration {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  overflow: hidden;
  border-radius: 16px;
}

.hero-illustration img,
.right-illustration img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
  border-radius: 16px;
}

/* --- Форма: занимает среднюю колонку, центрируется --- */
.form-col {
  flex: 1.4 1 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  min-width: 0;
}

.form-card {
  background: #F8F1E7;
  border: 2px solid #BBA17E;
  border-radius: 280px 280px 16px 16px;
  padding: 80px 48px 40px;
  width: 100%;
  max-width: 560px;
  position: relative;
  text-align: center;
  box-sizing: border-box;
  box-shadow: 0 12px 40px rgba(187, 161, 126, 0.2);
}

.form-title {
  font-weight: 500;
  font-size: 36px;
  margin: 0;
}

.form-subtitle {
  font-size: 16px;
  margin: 6px 0 28px;
  color: #333;
}

/* Табы */
.tabs {
  display: flex;
  border-radius: 9px;
  overflow: hidden;
  margin-bottom: 24px;
}

.tab {
  flex: 1;
  padding: 14px;
  border: 1px solid #B4ADA3;
  background: #F8F1E7;
  font-family: inherit;
  font-size: 17px;
  cursor: pointer;
  color: #000;
  transition: background 0.2s, color 0.2s;
}

.tab.active {
  background: #003770;
  color: #fff;
  border-color: #003770;
}

/* Поля ввода */
.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  text-align: left;
}

.input-group {
  display: flex;
  align-items: center;
  background: #F8F1E7;
  border: 1px solid #DED7CD;
  border-radius: 9px;
  padding: 0 14px;
  height: 52px;
}

.input-icon {
  font-size: 17px;
  margin-right: 12px;
  color: #666;
}

.input-group input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 16px;
  outline: none;
  height: 100%;
  min-width: 0;
}

.input-group input::placeholder {
  color: rgba(0, 0, 0, 0.62);
}

/* Запомнить */
.remember {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 4px;
}

.remember input {
  width: 20px;
  height: 20px;
  accent-color: #003978;
}

/* Ошибка */
.error {
  color: #b00020;
  font-size: 14px;
  margin: 0;
}

/* Кнопка отправки */
.submit-btn {
  background: #013773;
  color: #fff;
  border: none;
  border-radius: 26px;
  height: 60px;
  font-family: inherit;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
  transition: opacity 0.2s, transform 0.1s;
}

.submit-btn:hover {
  opacity: 0.9;
}

.submit-btn:active {
  transform: scale(0.99);
}

.arrow {
  font-size: 22px;
}

/* Ссылка "нет аккаунта" */
.switch-hint {
  margin-top: 22px;
  font-size: 15px;
  font-weight: 600;
}

.switch-hint a {
  color: #003770;
  text-decoration: none;
  border-bottom: 2px solid #BDA588;
}

/* --- Нижняя полоса: на всю ширину --- */
.steps-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 16px 0;
  width: 100%;
  flex-wrap: wrap;
  gap: 16px;
  flex-shrink: 0;
}

.step {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.step-text {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.step-line {
  width: 87px;
  height: 2px;
  background: #BDA588;
  margin-left: 8px;
}

/* --- Адаптив --- */
@media (max-width: 1100px) {
  .main {
    flex-direction: column;
  }
  .left-col, .right-col {
    display: none;
  }
  .form-col {
    flex: 1;
    padding: 10px 0 30px;
  }
  .form-card {
    max-width: 520px;
    border-radius: 80px 80px 16px 16px;
    padding: 50px 24px 28px;
  }
  .form-title {
    font-size: 28px;
  }
}

@media (max-width: 600px) {
  .header {
    padding: 10px 14px;
  }
  .logo-text {
    font-size: 16px;
  }
  .steps-bar {
    justify-content: center;
  }
  .step-line {
    display: none;
  }
  .form-card {
    border-radius: 50px 50px 16px 16px;
    padding: 40px 18px 24px;
  }
  .form-title {
    font-size: 24px;
  }
  .submit-btn {
    font-size: 20px;
    height: 54px;
  }
}
</style>