import app from './app';
import { logger } from './utils/logger';

const PORT = Number(process.env.PORT || 3000);

app.listen(PORT, () => {
  logger.info(`Architect-Prime Node.js API running on http://localhost:${PORT}`);
  logger.info(`Swagger UI available at http://localhost:${PORT}/docs`);
});
