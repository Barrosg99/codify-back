const { Sequelize } = require('sequelize');

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
module.exports = {
  createCoursesUtils,
  createUserUtils,
  createCourseUsersUtils,
};
