async function createCourses(db, title, description, color) {
  await db.query('INSERT INTO courses (title, description, color) values ($1, $2, $3);', [title, description, color]);
}

module.exports = {
  createCourses,
};
