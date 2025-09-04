import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { setPortAdapter } from '@maxdev1/sotajs/lib/di.v2';
import { 
  loggerPort,
  showSegmentationPort,
  showQualificationQuestionPort,
  showDemonstrationGalleryPort,
  showDemonstrationDetailPort,
  captureLeadPort,
  showWarmupSubscriptionPort,
  transferLeadPort
} from './domain/ports/bot.ports';
import { telegramDrivingAdapter } from './infrastructure/telegram/extended.telegram-adapter';
import { consoleLoggerAdapter } from './infrastructure/telegram/adapters/telegram.adapters';
import { 
  telegramLeadTransferAdapter,
  warmupSubscriptionAdapter,
  demonstrationContentAdapter
} from './infrastructure/telegram/adapters/extended.adapters';

// Связываем порты с адаптерами
setPortAdapter(loggerPort, consoleLoggerAdapter);
// TODO: Добавить остальные порты и адаптеры

const app = new Hono();

// Telegram webhook endpoint
app.post('/webhook/telegram', telegramDrivingAdapter);

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test endpoint
app.get('/test', async (c) => {
  return c.json({ 
    message: 'Bot is running',
    endpoints: [
      'POST /webhook/telegram - Telegram webhook',
      'GET /health - Health check'
    ]
  });
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

console.log(`Bot server is running on port ${port}`);
console.log('Endpoints:');
console.log(`  POST http://localhost:${port}/webhook/telegram - Telegram webhook`);
console.log(`  GET  http://localhost:${port}/health - Health check`);
console.log(`  GET  http://localhost:${port}/test - Test endpoint`);

serve({
  fetch: app.fetch,
  port
});

export default app;