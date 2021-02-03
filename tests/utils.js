async function createCoursesUtils(db, title, description, color, imageUrl) {
  await db.query('INSERT INTO courses (title, description, color, imageUrl) values ($1, $2, $3, $4);', [
    title,
    description,
    color,
    imageUrl,
  ]);
}

module.exports = {
  createCoursesUtils,
};
