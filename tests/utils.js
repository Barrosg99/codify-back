async function createCoursesUtils(db, title, description, color, imageUrl) {
  const response = await db.query('INSERT INTO courses (title, description, color, "imageUrl") values ($1, $2, $3, $4) RETURNING *;', [
    title,
    description,
    color,
    imageUrl,
  ]);

  return response.rows[0].id;
}

module.exports = {
  createCoursesUtils,
};
