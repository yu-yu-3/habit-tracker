<template>
  <div class="app-layout">
    <Sidebar current="profile" @navigate="$emit('navigate', $event)" @logout="$emit('logout')" />

    <main class="content">
      <header class="page-head">
        <!-- <h1 class="page-title"> ДОСТИЖЕНИЯ</h1> -->
      </header>

            <!-- Баннер приветствия + уровень, справа картинка -->
      <section class="welcome-row">
        <div class="welcome-banner">
          <div class="welcome-left">
            <h2 class="welcome-title">Привет, {{ userName }}!</h2>
            <p class="welcome-sub">Продолжай в том же духе — ты на правильном пути</p>
          </div>

          <div class="level-arc-wrap">
            <div class="level-num">{{ level }}</div>
            <svg class="level-arc" viewBox="0 0 260 150">
              <path class="arc-bg" d="M 20 130 A 110 110 0 0 1 240 130" />
              <path
                class="arc-fill"
                d="M 20 130 A 110 110 0 0 1 240 130"
                :stroke-dasharray="arcLength"
                :stroke-dashoffset="arcOffset"
              />
            </svg>
            <div class="level-xp">{{ xp }} / {{ level * 100 }} XP</div>
          </div>
        </div>

        <div class="welcome-img-wrap">
          <img :src="helloCatImg" alt="Приветствие" />
        </div>
      </section>

      <!-- Мои привычки + достижения (одинаковая высота) -->
      <div class="two-col">
        <!-- Мои привычки -->
        <section class="card habits-card">
          <div class="card-head">
            <h3 class="card-title">Мои привычки</h3>
            <button class="add-btn" @click="openModal">+ Добавить</button>
          </div>
          <div v-if="habits.length === 0" class="placeholder">
            Пока нет привычек — добавь первую!
          </div>
          <ul v-else class="habits-list">
            <li v-for="habit in habits" :key="habit.id" class="habit-item">
              <div class="habit-info">
                <span class="habit-title">{{ habit.title }}</span>
                <span class="habit-streak">🔥 {{ streaks[habit.id] || 0 }} дн.</span>
              </div>
              <button
                class="check-cell"
                :class="{ checked: isTodayChecked(habit.id) }"
                @click="toggleToday(habit.id)"
              >
                <span v-if="isTodayChecked(habit.id)">✓</span>
              </button>
            </li>
          </ul>
        </section>

        <!-- Достижения -->
        <section class="card achievements-card">
          <div class="card-head">
            <h3 class="card-title">Достижения</h3>
            <span class="achievements-count">{{ unlockedCount }} / 21</span>
          </div>
          <div class="achievements-scroll">
            <div class="achievements-grid">
              <div
                v-for="ach in achievements"
                :key="ach.id"
                class="achievement"
                :class="{ unlocked: ach.unlocked }"
                :title="ach.desc"
              >
                <div class="ach-circle">
                  <img :src="ach.image" :alt="ach.name" />
                </div>
                <div class="ach-name">{{ ach.name }}</div>
                <div class="ach-desc">{{ ach.desc }}</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- Модальное окно добавления привычки -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3 class="modal-title">Новая привычка</h3>
        <p class="modal-sub">Какую привычку хочешь завести?</p>
        <input
          v-model="newHabitTitle"
          type="text"
          class="modal-input"
          placeholder="Например, пить воду"
          @keyup.enter="addHabit"
          ref="titleInput"
        >
        <p v-if="modalError" class="modal-error">{{ modalError }}</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="closeModal">Отмена</button>
          <button class="btn-primary" @click="addHabit">Создать</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import Sidebar from './Sidebar.vue'
import { checkAchievements } from '../achievements.js'
import helloCatImg from '../assets/cat-hello.jpg'

const props = defineProps(['userId'])
defineEmits(['navigate', 'logout'])

const userName = ref('')
const level = ref(1)
const xp = ref(0)
const habits = ref([])
const checkins = ref([])
const streaks = reactive({})
const achievements = ref([])

const showModal = ref(false)
const newHabitTitle = ref('')
const modalError = ref('')
const titleInput = ref(null)

const todayStr = new Date().toISOString().split('T')[0]

// Полукруг уровня
const arcLength = Math.PI * 110
const arcOffset = computed(() => {
  const pct = (xp.value % 100) / 100
  return arcLength - pct * arcLength
})

const unlockedCount = computed(() => achievements.value.filter(a => a.unlocked).length)

const isTodayChecked = (habitId) => {
  return checkins.value.some(c => c.habit_id === habitId && c.date === todayStr)
}

const toggleToday = async (habitId) => {
  await fetch('http://localhost:3000/api/toggle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ habitId, date: todayStr, userId: props.userId })
  })
  await loadData()
}

const openModal = async () => {
  showModal.value = true
  modalError.value = ''
  newHabitTitle.value = ''
  await nextTick()
  titleInput.value?.focus()
}

const closeModal = () => {
  showModal.value = false
  modalError.value = ''
  newHabitTitle.value = ''
}

const addHabit = async () => {
  if (!newHabitTitle.value.trim()) {
    modalError.value = 'Введите название'
    return
  }
  try {
    const res = await fetch('http://localhost:3000/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: props.userId, title: newHabitTitle.value.trim() })
    })
    const data = await res.json()
    if (data.success) {
      closeModal()
      await loadData()
    } else {
      modalError.value = data.error || 'Ошибка'
    }
  } catch (e) {
    modalError.value = 'Сервер недоступен'
  }
}

const loadData = async () => {
  const res = await fetch(`http://localhost:3000/api/data/${props.userId}`)
  const data = await res.json()
  habits.value = data.habits
  checkins.value = data.checkins
  if (data.user) {
    userName.value = data.user.name
    level.value = data.user.level
    xp.value = data.user.xp
  }
  for (const key in streaks) delete streaks[key]
  for (const h of habits.value) {
    const sr = await fetch(`http://localhost:3000/api/streak/${h.id}`)
    const sd = await sr.json()
    streaks[h.id] = sd.streak
  }
  const bestStreakForCheck = Math.max(0, ...Object.values(streaks))
  achievements.value = checkAchievements({
    xp: xp.value,
    habits: habits.value,
    checkins: checkins.value,
    streaks: streaks,
    bestStreak: bestStreakForCheck
  })
}

onMounted(loadData)
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background: #F8F1E7;
  font-family: 'Playfair Display', serif;
  color: #013773;
}

.content {
  flex: 1;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.page-title {
  font-size: clamp(26px, 3.5vw, 40px);
  font-weight: 600;
  letter-spacing: 0.02em;
  margin: 0;
}

/* --- Приветствие + уровень + картинка слева --- */
.welcome-row {
  display: flex;
  gap: 20px;
  align-items: stretch;
}

/* Картинка справа, без рамки, невысокая */
.welcome-img-wrap {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.welcome-img-wrap img {
  width: 100%;
  height: 240px;
  object-fit: cover;
  object-position: center;
  display: block;
  border-radius: 16px;
}

/* Сам баннер: бежевый с рамкой */
.welcome-banner {
  flex: 1;
  background: #F8F1E7;
  border: 2px solid #8F6A05;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  justify-content: center;
  gap: 60px;
  flex-wrap: wrap;
  align-items: center;
}

.welcome-title {
  font-size: clamp(30px, 3.6vw, 42px);
  font-weight: 600;
  margin: 0 0 10px;
  color: #013773;
  line-height: 1.1;
}

.welcome-sub {
  font-size: clamp(16px, 1.4vw, 20px);
  color: #013773;
  opacity: 0.8;
  margin: 0;
  line-height: 1.35;
}

/* Полукруг уровня */
.level-arc-wrap {
  position: relative;
  width: 320px;
  height: 170px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-top: 10px;
  flex-shrink: 0;
}

.level-num {
  position: absolute;
  top: 18px;
  font-size: 42px;
  font-weight: 600;
  color: #013773;
  line-height: 1;
}

.level-arc {
  width: 320px;
  height: 160px;
  display: block;
  overflow: visible;
}

.arc-bg {
  fill: none;
  stroke: #E8DECE;
  stroke-width: 14;
  stroke-linecap: round;
}

.arc-fill {
  fill: none;
  stroke: #013773;
  stroke-width: 14;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.4s ease;
}

.level-xp {
  margin-top: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #013773;
}

/* --- Две колонки: привычки + достижения --- */
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: stretch;
}

.card {
  background: #F8F1E7;
  border: 2px solid #8F6A05;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 480px;
  overflow: hidden;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #013773;
}

.add-btn {
  background: #013773;
  color: #F8F1E7;
  border: 2px solid #013773;
  border-radius: 999px;
  padding: 8px 16px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.add-btn:hover {
  opacity: 0.9;
}

.placeholder {
  font-size: 13px;
  color: #013773;
  opacity: 0.6;
  text-align: center;
  padding: 20px 0;
  border: 1px dashed #8F6A05;
  border-radius: 10px;
}

/* Привычки */
.habits-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  flex: 1;
}

.habit-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  background: #FDFBF7;
  border: 1px solid #8F6A05;
  border-radius: 10px;
}

.habit-info {
  display: flex;
  flex-direction: column;
}

.habit-title {
  font-size: 15px;
  font-weight: 500;
  color: #013773;
}

.habit-streak {
  font-size: 12px;
  color: #A75432;
  margin-top: 2px;
}

.check-cell {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #8F6A05;
  background: #F8F1E7;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #F8F1E7;
  font-size: 14px;
  padding: 0;
  flex-shrink: 0;
  transition: background 0.2s, transform 0.1s;
}

.check-cell.checked {
  background: #013773;
  border-color: #013773;
  animation: pop 0.25s ease;
}

@keyframes pop {
  0% { transform: scale(0.8); }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

/* Достижения */
.achievements-count {
  font-size: 13px;
  color: #A75432;
  font-weight: 600;
}

.achievements-scroll {
  flex: 1;
  overflow-y: auto;
  padding-right: 6px;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.achievement {
  text-align: center;
  padding: 8px 4px;
  border-radius: 10px;
  opacity: 0.45;
  transition: opacity 0.2s;
}

.achievement.unlocked {
  opacity: 1;
}

.ach-circle {
  width: 72px;
  height: 72px;
  margin: 0 auto 8px;
  border-radius: 50%;
  background: #E8DECE;
  border: 2px solid #8F6A05;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ach-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: grayscale(0.6) opacity(0.6);
  transition: filter 0.2s;
}

.achievement.unlocked .ach-circle {
  border-color: #AE5835;
  box-shadow: 0 0 0 3px rgba(174, 88, 53, 0.15);
}

.achievement.unlocked .ach-circle img {
  filter: none;
}

.ach-name {
  font-size: 13px;
  font-weight: 600;
  color: #013773;
}

.ach-desc {
  font-size: 11px;
  color: #013773;
  opacity: 0.6;
  margin-top: 2px;
  line-height: 1.2;
}

.achievements-scroll::-webkit-scrollbar {
  width: 6px;
}
.achievements-scroll::-webkit-scrollbar-thumb {
  background: #8F6A05;
  border-radius: 3px;
}

.habits-list::-webkit-scrollbar {
  width: 6px;
}
.habits-list::-webkit-scrollbar-thumb {
  background: #8F6A05;
  border-radius: 3px;
}

/* --- Модалка --- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(1, 55, 115, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 100;
}

.modal {
  background: #F8F1E7;
  border: 2px solid #8F6A05;
  border-radius: 20px;
  padding: 28px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
  animation: modalIn 0.2s ease;
}

@keyframes modalIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 4px;
  color: #013773;
}

.modal-sub {
  font-size: 14px;
  color: #013773;
  opacity: 0.7;
  margin: 0 0 16px;
}

.modal-input {
  width: 100%;
  height: 48px;
  padding: 0 14px;
  border: 1px solid #8F6A05;
  border-radius: 10px;
  background: #FDFBF7;
  font-family: inherit;
  font-size: 15px;
  box-sizing: border-box;
  outline: none;
  color: #013773;
  transition: border-color 0.2s;
}

.modal-input:focus {
  border-color: #013773;
}

.modal-error {
  color: #b00020;
  font-size: 13px;
  margin: 8px 0 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-primary,
.btn-secondary {
  border: none;
  border-radius: 999px;
  padding: 10px 24px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary {
  background: #013773;
  color: #F8F1E7;
}

.btn-secondary {
  background: transparent;
  color: #013773;
  border: 1px solid #8F6A05;
}

.btn-primary:hover,
.btn-secondary:hover {
  opacity: 0.85;
}

/* Адаптив */
@media (max-width: 1100px) {
  .welcome-row {
    flex-direction: column;
  }
  .welcome-img-wrap {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
  }
  .welcome-banner {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 1000px) {
  .two-col {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .app-layout {
    flex-direction: column;
  }
  .content {
    padding: 16px;
  }
  .achievements-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>