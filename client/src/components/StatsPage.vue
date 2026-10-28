<template>
  <div class="app-layout">
    <Sidebar current="stats" @navigate="$emit('navigate', $event)" @logout="$emit('logout')" />

    <main class="content">
      <!-- Заголовок -->
      <header class="page-head">
        <h1 class="page-title">СТАТИСТИКА</h1>
        <div class="best-streak-badge">
          <img :src="burnImg" alt="Серия" class="fire-img" />
          Лучшая серия: <strong>{{ bestStreakAllTime }} дн.</strong>
        </div>
      </header>

      <!-- Переключатели периода -->
      <div class="period-tabs">
        <button
          v-for="p in periods"
          :key="p.key"
          class="period-tab"
          :class="{ active: period === p.key }"
          @click="period = p.key"
        >{{ p.label }}</button>
      </div>

      <!-- Сетка -->
      <div class="stats-grid">
        <!-- Левая колонка -->
        <div class="stats-main">
          <!-- Верхний ряд: общий прогресс + лучшая серия -->
          <div class="top-pair">
            <section class="card progress-card">
              <h3 class="card-title">Общий прогресс</h3>
              <div class="progress-circle-wrap">
                <svg class="progress-circle" viewBox="0 0 120 120">
                  <circle class="circle-bg" cx="60" cy="60" r="52" />
                  <circle
                    class="circle-fill"
                    cx="60" cy="60" r="52"
                    :stroke-dasharray="circleLength"
                    :stroke-dashoffset="circleOffset"
                  />
                </svg>
                <div class="circle-label">{{ overallPercent }}%</div>
              </div>
              <p class="card-note">выполнено за {{ periodLabel.toLowerCase() }}</p>
            </section>

            <section class="card best-card">
              <h3 class="card-title">Лучшая серия</h3>
              <div class="best-series">
                <span class="best-num">{{ bestStreakPeriod }}</span>
                <span class="best-unit">дней<br>подряд</span>
              </div>
              <p class="quote-mini">«Дисциплина — мост между целями и результатами.»</p>
            </section>
          </div>

                    <!-- Продуктивность -->
          <section class="card">
            <h3 class="card-title">Продуктивность</h3>
            <div class="bars">
              <div v-for="(bar, i) in bars" :key="i" class="bar-col">
                <div class="bar" :style="{ height: bar.value + '%' }"></div>
                <span class="bar-label">{{ bar.label }}</span>
              </div>
            </div>
          </section>

          <!-- Мотивационная фраза под продуктивностью -->
          <section class="motivation-banner">
            <p class="motivation-text">
              «Ты не поднимаешься до уровня своих целей. Ты опускаешься до уровня своих привычек.»
            </p>
          </section>
        </div>
        
        

        <!-- Правая колонка -->
        <aside class="stats-side">
          <!-- Профиль (без рамки) -->
          <section class="profile-mini">
            <div class="avatar">{{ initials }}</div>
            <div class="profile-mini-info">
              <strong>{{ userName }}</strong>
              <span>Уровень {{ level }}</span>
            </div>
          </section>

          <!-- Фото котов -->
          <div class="kats-wrap">
            <img :src="katsImg" alt="Коты" />
          </div>

          <!-- Текущие серии -->
          <section class="card">
            <h3 class="card-title">Текущие серии</h3>
            <div v-if="habits.length === 0" class="placeholder">
              Тут будут ваши серии
            </div>
            <ul v-else class="streak-list">
              <li v-for="habit in habits" :key="habit.id">
                <div class="streak-head">
                  <span>{{ habit.title }}</span>
                  <strong>{{ streaks[habit.id] || 0 }} дн.</strong>
                </div>
                <div class="streak-track">
                  <div
                    class="streak-fill"
                    :style="{ width: Math.min(90, (streaks[habit.id] || 0) * 10) + '%' }"
                  ></div>
                </div>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import Sidebar from './Sidebar.vue'
import burnImg from '../assets/burn.png'
import katsImg from '../assets/2kats.jpg'

const props = defineProps(['userId'])
defineEmits(['navigate', 'logout'])

const periods = [
  { key: 'all', label: 'Обзор' },
  { key: 'week', label: 'Неделя' },
  { key: 'month', label: 'Месяц' },
  { key: 'year', label: 'Год' }
]
const period = ref('all')

const habits = ref([])
const checkins = ref([])
const streaks = reactive({})
const userName = ref('')
const level = ref(1)
const xp = ref(0)
const bestStreakAllTime = ref(0)

const initials = computed(() => userName.value ? userName.value.charAt(0).toUpperCase() : '?')
const periodLabel = computed(() => periods.find(p => p.key === period.value)?.label || 'Обзор')

// --- Помощники для дат ---
const toDateStr = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Сколько дней в выбранном периоде
const periodDays = computed(() => {
  if (period.value === 'week') return 7
  if (period.value === 'month') return 30
  if (period.value === 'year') return 365
  return null // всё время
})

// Множество дат, в которые была хотя бы одна отметка
const activeDates = computed(() => new Set(checkins.value.map(c => c.date)))

// Отметки, попадающие в выбранный период
const checkinsInPeriod = computed(() => {
  if (period.value === 'all') return checkins.value
  const limit = new Date()
  limit.setDate(limit.getDate() - periodDays.value + 1)
  const minStr = toDateStr(limit)
  const todayStr = toDateStr(new Date())
  return checkins.value.filter(c => c.date >= minStr && c.date <= todayStr)
})

// Общий прогресс за период
const overallPercent = computed(() => {
  if (habits.value.length === 0) return 0
  const days = periodDays.value ?? daysSinceFirstCheckin()
  if (!days) return 0
  const totalPossible = habits.value.length * days
  return Math.min(100, Math.round((checkinsInPeriod.value.length / totalPossible) * 100))
})

function daysSinceFirstCheckin() {
  if (checkins.value.length === 0) return 1
  const dates = checkins.value.map(c => c.date).sort()
  const first = new Date(dates[0])
  const today = new Date()
  return Math.max(1, Math.round((today - first) / (1000 * 60 * 60 * 24)) + 1)
}

// Круг
const circleLength = 2 * Math.PI * 52
const circleOffset = computed(() => circleLength - (overallPercent.value / 100) * circleLength)

// Лучшая серия в выбранном периоде
const bestStreakPeriod = computed(() => {
  if (activeDates.value.size === 0) return 0
  let best = 0
  let current = 0
  const days = periodDays.value
  if (!days) {
    // всё время: идём по всем датам от первой до сегодня
    const dates = [...activeDates.value].sort()
    const start = new Date(dates[0])
    const today = new Date()
    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      if (activeDates.value.has(toDateStr(d))) {
        current++
        if (current > best) best = current
      } else {
        current = 0
      }
    }
    return best
  }
  // за период: идём назад от сегодня
  const cursor = new Date()
  for (let i = 0; i < days; i++) {
    if (activeDates.value.has(toDateStr(cursor))) {
      current++
      if (current > best) best = current
    } else {
      current = 0
    }
    cursor.setDate(cursor.getDate() - 1)
  }
  return best
})

// Столбики продуктивности
const bars = computed(() => {
  if (period.value === 'week' || period.value === 'all') {
    // 7 дней: подписи Пн..Вс по последним 7 дням (просто Вс→Сб или по дням недели)
    const labels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    const cursor = new Date()
    cursor.setDate(cursor.getDate() - 6)
    const result = []
    for (let i = 0; i < 7; i++) {
      const ds = toDateStr(cursor)
      const count = checkins.value.filter(c => c.date === ds).length
      const max = Math.max(1, habits.value.length)
      result.push({
        label: labels[cursor.getDay() === 0 ? 6 : cursor.getDay() - 1],
        value: Math.round((count / max) * 100)
      })
      cursor.setDate(cursor.getDate() + 1)
    }
    return result
  }
  if (period.value === 'month') {
    // 4 недели
    const result = []
    for (let w = 0; w < 4; w++) {
      const start = new Date()
      start.setDate(start.getDate() - (3 - w) * 7 - 6)
      const end = new Date(start)
      end.setDate(end.getDate() + 6)
      let count = 0
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        count += checkins.value.filter(c => c.date === toDateStr(d)).length
      }
      const max = Math.max(1, habits.value.length * 7)
      result.push({
        label: `Нед ${w + 1}`,
        value: Math.round((count / max) * 100)
      })
    }
    return result
  }
  // год: 12 месяцев
  const monthNames = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек']
  const result = []
  const now = new Date()
  for (let m = 11; m >= 0; m--) {
    const start = new Date(now.getFullYear(), now.getMonth() - m, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - m + 1, 0)
    let count = 0
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      count += checkins.value.filter(c => c.date === toDateStr(d)).length
    }
    const max = Math.max(1, habits.value.length * 30)
    result.push({
      label: monthNames[start.getMonth()],
      value: Math.round((count / max) * 100)
    })
  }
  return result
})

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
  for (const h of habits.value) {
    const sr = await fetch(`http://localhost:3000/api/streak/${h.id}`)
    const sd = await sr.json()
    streaks[h.id] = sd.streak
    if (sd.streak > bestStreakAllTime.value) bestStreakAllTime.value = sd.streak
  }
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

/* Заголовок */
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.page-title {
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 600;
  letter-spacing: 0.02em;
  margin: 0;
}

.best-streak-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #F8F1E7;
  border: 2px solid #8F6A05;
  border-radius: 999px;
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 500;
}

.best-streak-badge strong {
  color: #A75432;
}

.fire-img {
  width: 26px;
  height: 26px;
  object-fit: contain;
}

/* Табы периода */
.period-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.period-tab {
  padding: 10px 22px;
  border: 2px solid #8F6A05;
  border-radius: 999px;
  background: #F8F1E7;
  color: #013773;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.period-tab:hover {
  background: #F0E4D2;
}

.period-tab.active {
  background: #013773;
  color: #F8F1E7;
  border-color: #013773;
}

/* Сетка */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  align-items: start;
}

.stats-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.top-pair {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 20px;
  align-items: stretch;
}

.stats-side {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Карточки */
.card {
  background: #F8F1E7;
  border: 2px solid #8F6A05;
  border-radius: 16px;
  padding: 20px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px;
  color: #013773;
}

.card-note {
  font-size: 13px;
  color: #013773;
  opacity: 0.7;
  text-align: center;
  margin: 8px 0 0;
}

/* Круг прогресса */
.progress-circle-wrap {
  position: relative;
  width: 160px;
  height: 160px;
  margin: 0 auto;
}

.progress-circle {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.circle-bg {
  fill: none;
  stroke: #E8DECE;
  stroke-width: 10;
}

.circle-fill {
  fill: none;
  stroke: #A75432;
  stroke-width: 10;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.6s ease;
}

.circle-label {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 600;
  color: #013773;
}

/* Лучшая серия */
.best-card {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.best-series {
  display: flex;
  align-items: baseline;
  gap: 12px;
  justify-content: center;
  margin-top: 8px;
}

.best-num {
  font-size: 56px;
  font-weight: 600;
  color: #A75432;
  line-height: 1;
}

.best-unit {
  font-size: 15px;
  color: #013773;
  line-height: 1.2;
}

.quote-mini {
  font-size: 12px;
  font-style: italic;
  color: #013773;
  opacity: 0.7;
  text-align: center;
  margin: 12px 0 0;
}

/* Столбики */
.bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
  height: 180px;
  padding-top: 10px;
}

.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
}

.bar {
  width: 100%;
  max-width: 44px;
  background: #A75432;
  border-radius: 6px 6px 0 0;
  transition: height 0.4s ease;
  min-height: 4px;
}

.bar-label {
  margin-top: 8px;
  font-size: 12px;
  color: #013773;
  font-weight: 600;
}

/* Мини-профиль без рамки */
.profile-mini {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 4px;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #013773;
  color: #F8F1E7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
  flex-shrink: 0;
}

.profile-mini-info {
  display: flex;
  flex-direction: column;
}

.profile-mini-info strong {
  font-size: 16px;
}

.profile-mini-info span {
  font-size: 13px;
  color: #A75432;
}

/* Фото котов */
.kats-wrap {
  border-radius: 16px;
  overflow: hidden;
  border: 2px ;
  height: 340px;
  flex-shrink: 0;
}

.kats-wrap img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center;
}

/* Серии */
.streak-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.streak-head {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 6px;
}

.streak-head strong {
  color: #A75432;
}

.streak-track {
  height: 10px;
  background: #E8DECE;
  border-radius: 5px;
  overflow: hidden;
}

.streak-fill {
  height: 100%;
  background: #A75432;
  border-radius: 5px;
  transition: width 0.5s ease;
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

/* Адаптив */
@media (max-width: 1100px) {
  .top-pair {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1000px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .stats-side {
    flex-direction: row;
    flex-wrap: wrap;
  }
  .stats-side > * {
    flex: 1;
    min-width: 240px;
  }
}

@media (max-width: 700px) {
  .app-layout {
    flex-direction: column;
  }
  .content {
    padding: 16px;
  }
  .page-head {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* Мотивационная фраза внизу */
.motivation-banner {
  background: #F8F1E7;
  border: 2px solid #8F6A05;
  border-radius: 16px;
  padding: 28px 32px;
  text-align: center;
}

.motivation-text {
  font-size: clamp(20px, 2.2vw, 28px);
  font-style: italic;
  font-weight: 500;
  color: #013773;
  margin: 0;
  line-height: 1.4;
  letter-spacing: 0.01em;
}
</style>