const { Sequelize } = require('sequelize');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

async function createCoursesUtils(db, title, description, color, imageUrl) {
  const course = await db.query('INSERT INTO courses (title, description, color, "imageUrl") values ($1, $2, $3, $4) RETURNING *;', [
    title,
    description,
    color,
    imageUrl,
  ]);

  return course.rows[0].id;
}

async function createUserUtils(db, name, password, email, avatarUrl) {
  const user = await db.query('INSERT INTO users (name, password, email, "avatarUrl") values ($1, $2, $3, $4) RETURNING *;', [
    name,
    password,
    email,
    avatarUrl,
  ]);

  return user.rows[0];
}

async function createCourseUsersUtils(db, userId) {
  const course = await createCoursesUtils(db, 'Ruby iniciante', 'Pra arrasar com Ruby', 'fff', 'https://i.imgur.com/KOloELl.jpeg');

  const courseUsers = await db.query('INSERT INTO into "courseUsers"("userId", "courseId", "doneActivities", "createdAt", "updatedAt") values($1, $2, $3, $4, $5) RETURNING *;', [
    userId,
    course.id,
    0,
    Sequelize.DATA,
    Sequelize.DATA,
  ]);

  return courseUsers.rows[0];
}

async function createChapters(db, courseId, name, order, topicsQuantity, exercisesQuantity) {
  const chapter = await db.query(`
    INSERT INTO public.chapters
    ("courseId", name, "order", "topicsQuantity",
    "exercisesQuantity", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *;`, [
    courseId, name, order, topicsQuantity, exercisesQuantity,
  ]);

  return chapter.rows[0];
}

async function cleanDataBase(db) {
  await db.query('DELETE FROM "theoryUsers"');
  await db.query('DELETE FROM "topicUsers"');
  await db.query('DELETE FROM "exerciseUsers"');
  await db.query('DELETE FROM theories');
  await db.query('DELETE FROM exercises');
  await db.query('DELETE FROM topics');
  await db.query('DELETE FROM chapters');
  await db.query('DELETE FROM "courseUsers"');
  await db.query('DELETE FROM "adminSessions"');
  await db.query('DELETE FROM sessions');
  await db.query('DELETE FROM courses');
  await db.query('DELETE FROM users');
  await db.query('ALTER SEQUENCE courses_id_seq RESTART WITH 1;');
}

async function createAdminSession(db) {
  const sessionAdmin = await db.query(`
  INSERT INTO "adminSessions"
  ("userId", "createdAt", "updatedAt")
  VALUES (1,'2019-01-23T09:23:42.079Z','2019-01-23T09:23:42.079Z')
  RETURNING *`);

  return jwt.sign({ id: sessionAdmin.rows[0].id }, process.env.SECRET);
}

async function createUserSession(db) {
  const password = bcrypt.hashSync('123456', 10);

  const user = await db.query(
    `INSERT INTO users 
    (name, password, email, "createdAt", "updatedAt") VALUES ($1 , $2, $3, $4, $5) 
    RETURNING *`,
    ['Teste de Teste', password, 'teste@teste.com', new Date(), new Date()],
  );
  const sessionUser = await db.query(
    `INSERT INTO sessions 
    ("userId", "createdAt", "updatedAt")
    VALUES ($1 , $2, $3) RETURNING *`,
    [user.rows[0].id, new Date(), new Date()],
  );
  const userToken = jwt.sign({ id: sessionUser.rows[0].id }, process.env.SECRET);
  const userId = user.rows[0].id;

  return { userToken, userId };
}

async function createTopic(db, chapterId) {
  const testTopic = await db.query(
    'INSERT INTO topics ("chapterId", name, "order", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [chapterId, 'Teste', 1, new Date(), new Date()],
  );

  return testTopic.rows[0];
}

async function createTheory(db, topicId) {
  const testTheory = await db.query(
    'INSERT INTO theories ("topicId", "youtubeUrl", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4) RETURNING *',
    [topicId, 'https://youtube.com', new Date(), new Date()],
  );

  return testTheory.rows[0];
}

async function createExercise(db, topicId) {
  const testExercise = await db.query(
    'INSERT INTO exercises ("topicId", description, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4) RETURNING *',
    [topicId, 'Teste', new Date(), new Date()],
  );

  return testExercise.rows[0];
}

module.exports = {
  createCoursesUtils,
  createUserUtils,
  createCourseUsersUtils,
  cleanDataBase,
  createAdminSession,
  createUserSession,
  createChapters,
  createTopic,
  createTheory,
  createExercise,
};
