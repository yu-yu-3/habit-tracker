const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// --- АВТОРИЗАЦИЯ ---

// Регистрация
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  try {
    const info = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, password);
    // Сразу создаем базовые привычки для нового пользователя
    db.prepare('INSERT INTO habits (user_id, title) VALUES (?, ?)').run(info.lastInsertRowid, 'Пить воду');
    db.prepare('INSERT INTO habits (user_id, title) VALUES (?, ?)').run(info.lastInsertRowid, 'Читать');
    
    res.json({ success: true, userId: info.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ error: 'Пользователь с такой почтой уже есть' });
  }
});

// Вход
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, password);
  if (user) {
    res.json({ success: true, userId: user.id });
  } else {
    res.status(401).json({ error: 'Неверная почта или пароль' });
  }
});

// --- ДАННЫЕ (теперь с привязкой к пользователю) ---

app.get('/api/data/:userId', (req, res) => {
  const userId = req.params.userId;
  const habits = db.prepare('SELECT * FROM habits WHERE user_id = ?').all(userId);
  const checkins = db.prepare(`SELECT c.* FROM checkins c JOIN habits h ON c.habit_id = h.id WHERE h.user_id = ?`).all(userId);
  const user = db.prepare('SELECT id, name, xp, level FROM users WHERE id = ?').get(userId);
  res.json({ habits, checkins, user });
});

app.post('/api/toggle', (req, res) => {
  const { habitId, date, userId } = req.body;
  const existing = db.prepare('SELECT id FROM checkins WHERE habit_id = ? AND date = ?').get(habitId, date);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  let newXp = user.xp;
  let newLevel = user.level;

  if (existing) {
    // Снимаем галочку → удаляем отметку и отнимаем 10 XP
    db.prepare('DELETE FROM checkins WHERE id = ?').run(existing.id);
    newXp = Math.max(0, newXp - 10); // не уходим в минус
  } else {
    // Ставим галочку → добавляем отметку и начисляем 10 XP
    db.prepare('INSERT INTO checkins (habit_id, date) VALUES (?, ?)').run(habitId, date);
    newXp = newXp + 10;
  }

  // Пересчитываем уровень в обе стороны:
  // уровень = сколько раз по 100 XP набралось, но не меньше 1
  newLevel = Math.max(1, Math.floor(newXp / 100) + 1);

  db.prepare('UPDATE users SET xp = ?, level = ? WHERE id = ?').run(newXp, newLevel, userId);
  res.json({ success: true, xp: newXp, level: newLevel });
});

// Упрощенный streak (без изменений)
app.get('/api/streak/:habitId', (req, res) => {
  const habitId = req.params.habitId;
  const dates = db.prepare('SELECT date FROM checkins WHERE habit_id = ? ORDER BY date DESC').all(habitId);
  if (dates.length === 0) return res.json({ streak: 0 });

  let streak = 0;
  let currentDate = new Date();
  const todayStr = currentDate.toISOString().split('T')[0];
  if (dates[0].date !== todayStr) currentDate.setDate(currentDate.getDate() - 1);

  for (let i = 0; i < dates.length; i++) {
    const expectedDate = currentDate.toISOString().split('T')[0];
    if (dates[i].date === expectedDate) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else break;
  }
  res.json({ streak });
});

// Создать новую привычку
app.post('/api/habits', (req, res) => {
  const { userId, title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Название не может быть пустым' });
  }
  const info = db.prepare('INSERT INTO habits (user_id, title) VALUES (?, ?)').run(userId, title.trim());
  res.json({ success: true, habitId: info.lastInsertRowid });
});

app.listen(3000, () => console.log('Сервер: http://localhost:3000'));