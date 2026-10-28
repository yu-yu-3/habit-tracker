<template>
  <div class="app-layout">
    <Sidebar current="main" @navigate="$emit('navigate', $event)" @logout="$emit('logout')" />

    <main class="content">
      <!-- Верхняя строка: полукруг уровня + фото кота -->
      <section class="top-row">
        <div class="level-banner">
          <div class="level-arc-wrap">
            <div class="level-num">{{ user.level }}</div>
            <svg class="level-arc" viewBox="0 0 260 150">
              <path class="arc-bg" d="M 20 130 A 110 110 0 0 1 240 130" />
              <path
                class="arc-fill"
                d="M 20 130 A 110 110 0 0 1 240 130"
                :stroke-dasharray="arcLength"
                :stroke-dashoffset="arcOffset"
              />
            </svg>
            <div class="level-xp">{{ user.xp }} / {{ user.level * 100 }} XP</div>
          </div>
        </div>
        <div class="cat-wrap">
          <img :src="catImg" alt="Кот на мяче" />
        </div>
      </section>

      <!-- Календарь + правая панель -->
      <div class="main-grid">
        <!-- Левая колонка: календарь + гифка -->
        <div class="left-col">
          <section class="calendar-card">
            <div class="calendar-head">
              <button class="month-btn" @click="prevMonth">←</button>
              <h2 class="month-title">{{ currentMonthName }} {{ currentYear }}</h2>
              <button class="month-btn" @click="nextMonth">→</button>
            </div>

            <div class="calendar-scroll">
              <table class="calendar-table">
                <thead>
                  <tr>
                    <th class="habit-col">Привычка</th>
                    <th v-for="day in daysInMonth" :key="day" class="day-col">{{ day }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="habit in habits" :key="habit.id">
                    <td class="habit-name">{{ habit.title }}</td>
                    <td v-for="day in daysInMonth" :key="day" class="cell">
                      <button
                        class="check-cell"
                        :class="{ checked: isChecked(habit.id, day) }"
                        @click="toggle(habit.id, day)"
                      >
                        <span v-if="isChecked(habit.id, day)">✓</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

                    <!-- Три гифки в ряд под календарём -->
          <div class="play-cats-row">
            <img :src="catLoveImg" alt="Кот в любви" />
            <img :src="catBegImg" alt="Кот просит" />
            <img :src="catSleepImg" alt="Спящие коты" />
          </div>
        </div>

        <!-- Правая панель -->
        <aside class="side-panel">
          <div class="panel-card">
            <h3 class="panel-title">Статистика</h3>
            <div v-if="habits.length === 0" class="placeholder">
              Тут будет ваша статистика
            </div>
            <ul v-else class="stats-list">
              <li>
                <span>Лучшая серия</span>
                <strong>{{ bestStreak }} дн.</strong>
              </li>
              <li>
                <span>Выполнено</span>
                <strong>{{ completionPercent }}%</strong>
              </li>
              <li>
                <span>Всего отметок</span>
                <strong>{{ checkins.length }}</strong>
              </li>
            </ul>
          </div>

          <div class="panel-card">
            <h3 class="panel-title">Достижения</h3>
            <div v-if="unlockedAchievements.length === 0" class="placeholder">
              Тут будут ваши достижения
            </div>
            <ul v-else class="mini-achievements">
              <li v-for="ach in unlockedAchievements" :key="ach.id" class="mini-ach">
                <div class="mini-ach-circle">
                  <img :src="ach.image" :alt="ach.name" />
                </div>
                <div class="mini-ach-info">
                  <span class="mini-ach-name">{{ ach.name }}</span>
                  <span class="mini-ach-desc">{{ ach.desc }}</span>
                </div>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <!-- Нижний баннер: серия + цитата под ней -->
      <section class="quote-banner">
        <div class="quote-left">
          <div class="quote-streak">
            <img :src="burnImg" alt="Серия" class="quote-fire" />
            <div>
              <div class="quote-streak-label">Текущая серия</div>
              <div class="quote-streak-value">{{ currentStreak }} дней подряд</div>
            </div>
          </div>
          <p class="quote-text">
            «Дисциплина — это решение делать то, чего очень не хочется делать, чтобы достичь того, чего очень хочется достичь.»
          </p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { checkAchievements } from '../achievements.js'
import Sidebar from './Sidebar.vue'

import catImg from '../assets/kat_on_ball.jpg'
import burnImg from '../assets/burn.png'
import catLoveImg from '../assets/cat-in-love.gif'
import catBegImg from '../assets/please-begging.gif'
import catSleepImg from '../assets/sleep-cats.gif'

const props = defineProps(['userId'])
defineEmits(['navigate', 'logout'])

const habits = ref([])
const checkins = ref([])
const user = ref({ xp: 0, level: 1 })
const currentDate = ref(new Date())
const currentStreak = ref(0)
const streaks = reactive({})
const achievements = ref([])

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())
const currentMonthName = computed(() => {
  const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
  return months[currentMonth.value]
})
const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
})

// Полукруг уровня
const arcLength = Math.PI * 110
const arcOffset = computed(() => {
  const pct = (user.value.xp % 100) / 100
  return arcLength - pct * arcLength
})

const bestStreak = computed(() => {
  const values = Object.values(streaks)
  return values.length ? Math.max(...values) : 0
})

const unlockedAchievements = computed(() => achievements.value.filter(a => a.unlocked))

const completionPercent = computed(() => {
  if (habits.value.length === 0) return 0
  const totalPossible = habits.value.length * 30
  return Math.min(100, Math.round((checkins.value.length / totalPossible) * 100))
})

const toDateStr = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const calcStreak = () => {
  if (checkins.value.length === 0) {
    currentStreak.value = 0
    return
  }
  const activeDates = new Set(checkins.value.map(c => c.date))
  const cursor = new Date()
  if (!activeDates.has(toDateStr(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
  }
  let streak = 0
  while (activeDates.has(toDateStr(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  currentStreak.value = streak
}

const loadData = async () => {
  const res = await fetch(`http://localhost:3000/api/data/${props.userId}`)
  const data = await res.json()
  habits.value = data.habits
  checkins.value = data.checkins
  user.value = data.user

  for (const key in streaks) delete streaks[key]
  for (const h of habits.value) {
    const sr = await fetch(`http://localhost:3000/api/streak/${h.id}`)
    const sd = await sr.json()
    streaks[h.id] = sd.streak
  }

  calcStreak()

  const bestStreakForCheck = Math.max(0, ...Object.values(streaks))
  achievements.value = checkAchievements({
    xp: user.value.xp,
    habits: habits.value,
    checkins: checkins.value,
    streaks: streaks,
    bestStreak: bestStreakForCheck
  })
}

const prevMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}
const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

const formatDate = (day) => {
  const m = String(currentMonth.value + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${currentYear.value}-${m}-${d}`
}

const isChecked = (habitId, day) => {
  const dateStr = formatDate(day)
  return checkins.value.some(c => c.habit_id === habitId && c.date === dateStr)
}

const toggle = async (habitId, day) => {
  const dateStr = formatDate(day)
  await fetch('http://localhost:3000/api/toggle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ habitId, date: dateStr, userId: props.userId })
  })
  await loadData()
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

/* Верхняя строка */
.top-row {
  display: flex;
  gap: 20px;
  align-items: stretch;
}

.level-banner {
  flex: 1;
  background: #F8F1E7;
  border: 2px solid #8F6A05;
  border-radius: 16px;
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.level-arc-wrap {
  position: relative;
  width: 320px;
  height: 170px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-top: 10px;
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

.cat-wrap {
  width: 220px;
  flex-shrink: 0;
  border: 2px ;
  border-radius: 16px;
  overflow: hidden;
  background: #F8F1E7;
}

.cat-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.main-grid {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 20px;
  align-items: start;
}

/* Левая колонка: календарь + гифка */
.left-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.calendar-card {
  background: #F8F1E7;
  border: 2px solid #8F6A05;
  border-radius: 16px;
  padding: 20px;
  min-width: 0;
}

.calendar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.month-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  color: #013773;
}

.month-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid #8F6A05;
  background: #F8F1E7;
  color: #013773;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.month-btn:hover {
  background: #013773;
  color: #F8F1E7;
}

.calendar-scroll {
  overflow-x: auto;
}

.calendar-table {
  border-collapse: separate;
  border-spacing: 3px;
  width: 100%;
  min-width: 900px;
}

.habit-col {
  text-align: left;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #A75432;
  padding: 4px 8px;
  font-weight: 600;
}

.day-col {
  font-size: 12px;
  color: #013773;
  font-weight: 600;
  padding: 6px 0;
  width: 30px;
}

.habit-name {
  font-size: 15px;
  font-weight: 500;
  padding: 8px 12px;
  white-space: nowrap;
  text-align: left;
  color: #013773;
}

.cell {
  padding: 2px;
}

.check-cell {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #8F6A05;
  background: #F8F1E7;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #F8F1E7;
  font-size: 14px;
  padding: 0;
  transition: background 0.2s, transform 0.1s;
}

.check-cell:hover {
  border-color: #013773;
}

.check-cell.checked {
  background: #A75432;
  border-color: #A75432;
  animation: pop 0.25s ease;
}

@keyframes pop {
  0% { transform: scale(0.8); }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

/* Три гифки в ряд под календарём */
.play-cats-row {
  display: flex;
  gap: 300px;
  justify-content: center;
  align-items: center;
}

.play-cats-row img {
  width: calc((100% - 32px) / 3);
  max-width: 131px;
  height: auto;
  display: block;
  border-radius: 16px;
  object-fit: cover;
}

/* Правая панель */
.side-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel-card {
  background: #F8F1E7;
  border: 2px solid #8F6A05;
  border-radius: 16px;
  padding: 16px;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px;
  color: #013773;
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

.stats-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stats-list li {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid #E8DECE;
  color: #013773;
}

.stats-list li:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.stats-list strong {
  color: #A75432;
}

.mini-achievements {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 220px;
  overflow-y: auto;
}

.mini-ach {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  background: #FDFBF7;
  border: 1px solid #8F6A05;
  border-radius: 10px;
}

.mini-ach-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid #AE5835;
  background: #E8DECE;
}

.mini-ach-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.mini-ach-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.mini-ach-name {
  font-size: 13px;
  font-weight: 600;
  color: #013773;
}

.mini-ach-desc {
  font-size: 11px;
  color: #013773;
  opacity: 0.6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-achievements::-webkit-scrollbar {
  width: 6px;
}
.mini-achievements::-webkit-scrollbar-thumb {
  background: #8F6A05;
  border-radius: 3px;
}

/* Нижний баннер */
.quote-banner {
  background: #F8F1E7;
  color: #013773;
  border: 2px solid #8F6A05;
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
}

.quote-left {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quote-streak {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quote-fire {
  width: 44px;
  height: 44px;
  object-fit: contain;
}

.quote-streak-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.7;
}

.quote-streak-value {
  font-size: 18px;
  font-weight: 600;
}

.quote-text {
  font-size: 15px;
  font-style: italic;
  margin: 0;
  line-height: 1.4;
}

/* Адаптив */
@media (max-width: 1000px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
  .side-panel {
    flex-direction: row;
    flex-wrap: wrap;
  }
  .panel-card {
    flex: 1;
    min-width: 220px;
  }
  .top-row {
    flex-direction: column;
  }
  .cat-wrap {
    width: 100%;
    height: 180px;
  }
}

@media (max-width: 700px) {
  .app-layout {
    flex-direction: column;
  }
  .content {
    padding: 16px;
  }
}
</style>