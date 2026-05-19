import app from './app';

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server environment running on http://localhost:${PORT}`);
  console.log(`Swagger document engine deployed on http://localhost:${PORT}/docs`);
});
