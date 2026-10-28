// --- Импорт картинок для достижений ---
import img01 from './assets/achievements/1ec8954cda1ac9bf098f54e55f323d07.jpg'
import img02 from './assets/achievements/2a36b82754375e7e4021c555127dbe5b.jpg'
import img03 from './assets/achievements/3eab894176d4b402781745b971ae863b.jpg'
import img04 from './assets/achievements/09a9025268d60a653a089a06dfc6cfeb.jpg'
import img05 from './assets/achievements/049fc2f7edae5387fb9b497e66aeedd8.jpg'
import img06 from './assets/achievements/71f0c83dbcfafa01459703c4620b7e64.jpg'
import img07 from './assets/achievements/76ebcc34b03fc54d42c7b46c614e34ef.jpg'
import img08 from './assets/achievements/7324cf58ceafd5122dcb320b10e55e53.jpg'
import img09 from './assets/achievements/106545c4104eb17c5bacc6d0d9f10f4e.jpg'
import img10 from './assets/achievements/523044e090f0d5600d5bbc68b92ca0b8.jpg'
import img11 from './assets/achievements/a0bb328f770e2044ee3f8836355c285e.jpg'
import img12 from './assets/achievements/a306426dc1833b66def1989b867b0f4c.jpg'
import img13 from './assets/achievements/b2cf025c1849a4a939c261088783e8fe.jpg'
import img14 from './assets/achievements/b9e53774e0c014db8bcde4cf99109e26.jpg'
import img15 from './assets/achievements/b19b910a5136e4ad95590481504aff29.jpg'
import img16 from './assets/achievements/b20ca27fbba384e92c7133b29b27708f.jpg'
import img17 from './assets/achievements/bfba9323c6031bd83d4c32a9315687dc.jpg'
import img18 from './assets/achievements/cbbf39c44f2e5bfa2487852c1fb174fc.jpg'
import img19 from './assets/achievements/ea23b9332f9fc699d8c21eeb2179b79c.jpg'
import img20 from './assets/achievements/f47ac4ebbd9ad3a8dad5731f1bf27d00.jpg'
import img21 from './assets/achievements/f65a24961d6e020f251f806b5bfeaf21.jpg'

export const allAchievements = [
  { id: 1,  name: 'Первый шаг',       desc: 'Выполни первую привычку',     icon: '★', image: img01 },
  { id: 2,  name: 'Последовательность', desc: '3 дня подряд',               icon: '✦', image: img02 },
  { id: 3,  name: 'Ранняя пташка',    desc: 'Отметь привычку до 9:00',     icon: '☀', image: img03 },
  { id: 4,  name: 'Стремление',       desc: '7 дней подряд',               icon: '➤', image: img04 },
  { id: 5,  name: 'Неделя силы',      desc: '7 дней без пропусков',        icon: '✚', image: img05 },
  { id: 6,  name: 'Месяц дисциплины', desc: '30 дней подряд',              icon: '⚡', image: img06 },
  { id: 7,  name: 'Коллекционер',     desc: 'Создай 5 привычек',           icon: '❖', image: img07 },
  { id: 8,  name: 'Марафонец',        desc: '100 отметок всего',           icon: '♞', image: img08 },
  { id: 9,  name: 'Точность',         desc: 'Выполни 100% за неделю',      icon: '◎', image: img09 },
  { id: 10, name: 'Восход',           desc: 'Проснись и отметь',           icon: '☼', image: img10 },
  { id: 11, name: 'Звёздный час',     desc: 'Получи 7-дневную звезду',     icon: '✵', image: img11 },
  { id: 12, name: 'Уровень 2',        desc: 'Набери 100 XP',               icon: '②', image: img12 },
  { id: 13, name: 'Уровень 5',        desc: 'Набери 500 XP',               icon: '⑤', image: img13 },
  { id: 14, name: 'Уровень 10',       desc: 'Набери 1000 XP',              icon: '⑩', image: img14 },
  { id: 15, name: 'Три привычки',     desc: '3 привычки одновременно',     icon: '⋮', image: img15 },
  { id: 16, name: 'Спокойствие',      desc: 'Медитация 10 дней',           icon: '☯', image: img16 },
  { id: 17, name: 'Читатель',         desc: 'Чтение 15 дней',              icon: '▤', image: img17 },
  { id: 18, name: 'Водный баланс',    desc: 'Вода 20 дней',                icon: '◈', image: img18 },
  { id: 19, name: 'Сила воли',        desc: 'Спорт 10 дней',               icon: '♦', image: img19 },
  { id: 20, name: 'Наставник',        desc: 'Поделись с другом',           icon: '♣', image: img20 },
  { id: 21, name: 'Легенда',          desc: '365 дней подряд',             icon: '♛', image: img21 }
]

export function checkAchievements({ xp, habits, checkins, streaks, bestStreak }) {
  const unlockedIds = new Set()

  if (checkins.length >= 1) unlockedIds.add(1)
  if (bestStreak >= 3) unlockedIds.add(2)
  if (bestStreak >= 7) { unlockedIds.add(4); unlockedIds.add(5) }
  if (bestStreak >= 30) unlockedIds.add(6)
  if (habits.length >= 5) unlockedIds.add(7)
  if (checkins.length >= 100) unlockedIds.add(8)
  const hasSevenDayStreak = habits.some(h => (streaks[h.id] || 0) >= 7)
  if (hasSevenDayStreak) unlockedIds.add(11)
  if (xp >= 100) unlockedIds.add(12)
  if (xp >= 500) unlockedIds.add(13)
  if (xp >= 1000) unlockedIds.add(14)
  if (habits.length >= 3) unlockedIds.add(15)

  return allAchievements.map(a => ({
    ...a,
    unlocked: unlockedIds.has(a.id)
  }))
}