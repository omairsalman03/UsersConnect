// config must be imported first — it loads and validates all configuration
// (including env vars and config.yaml) before any other module reads process.env.
import 'dotenv/config';
import { config } from './config';

import express from 'express';
import path from 'path';

import { engine } from 'express-handlebars';
import cookieParser from "cookie-parser";

import WebRouter from './routers/web/webRouter';
import SetupRouter from './routers/web/setupRouter';
import UserRouter from './routers/api/userRouter';
import AuthRouter from './routers/api/authRouter';
import PostRouter from './routers/api/postRouter';
import CommentRouter from './routers/api/commentRouter';
import { setupCheck } from './middlewares/setupCheck';

import AppDataSource from './config/dataSource';

import hbsHelpers from './views/helpers/hbsHelpers';

import logger from './config/logger';
import ConfigRouter from './routers/api/configRouter';

import { APP_VERSION } from './config/version';

const app = express();

// ============================================
// CORS CONFIGURATION
// ============================================
if (config.cors.enabled) {
  app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin && config.cors.allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }

    res.header('Access-Control-Allow-Methods', config.cors.allowedMethods.join(', '));
    res.header('Access-Control-Allow-Headers', config.cors.allowedHeaders.join(', '));

    if (config.cors.allowCredentials) {
      res.header('Access-Control-Allow-Credentials', 'true');
    }

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }

    next();
  });

  logger.info(`✅ CORS enabled for origins: ${config.cors.allowedOrigins.join(', ')}`);
} else {
  logger.info('ℹ️  CORS disabled');
}

app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: hbsHelpers
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Disable view caching in development
if (config.app.nodeEnv !== 'production') {
  app.disable('view cache');
}

app.use(express.static(__dirname + '/public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database connection with retry logic.
// Retry count and delay are honored from the config system (connectionRetries / retryDelay).
async function connectWithRetry(
  retries = config.database.connectionRetries,
  delay = config.database.retryDelay
): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await AppDataSource.initialize();
      logger.info(`✅ Data Source initialized! Connected to MySQL DB: ${config.database.name}`);
      return;
    } catch (error) {
      const remainingRetries = retries - i - 1;
      logger.error(`❌ Database connection attempt ${i + 1}/${retries} failed.`);
      
      if (remainingRetries > 0) {
        logger.info(`⏳ Retrying in ${delay / 1000} seconds... (${remainingRetries} attempts remaining)`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        logger.error("💥 Failed to connect to database after all retry attempts.");
        logger.error("Error details:", error);
        process.exit(1);
      }
    }
  }
}

async function startServer() {
  logger.info(`UsersConnect ${APP_VERSION ?? '(unknown version)'} starting`);

  await connectWithRetry();
  
  // Register routes
  // Setup route must be registered BEFORE setupCheck so the wizard itself is always accessible
  app.use('/setup', SetupRouter);

  // Redirect to /setup if no admin users exist
  app.use(setupCheck);

  app.use('/', WebRouter);
  app.use('/users', UserRouter);
  app.use('/auth', AuthRouter);
  app.use('/posts', PostRouter);
  app.use('/comments', CommentRouter);
  app.use('/config', ConfigRouter);
  
  // Internal port is fixed to match Dockerfile EXPOSE 3000.
  // Use Docker port mapping for external port changes: docker run -p 8080:3000
  const PORT = 3000;
  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
  });
}

startServer();