// src/server.js
const { app } = require('./index');
const { migrate } = require('./db/migrate');

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  await migrate();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});