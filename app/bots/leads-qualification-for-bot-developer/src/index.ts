
import { BotRunner, composeBotCore, TelegramAdapter } from '@bot-core/index';
import { composeOnboarding } from '@lead-qualifier/composition/onboarding.composition';
import { handleTelegramUpdate } from '@lead-qualifier/infrastructure/telegram/onboarding.controllers';

function main() {
  console.log('[App]: Starting Lead Qualification Bot...');
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('TELEGRAM_BOT_TOKEN is not defined in your .env file.');
    process.exit(1);
  }

  const telegramAdapter = new TelegramAdapter(token);
  composeBotCore(telegramAdapter);
  composeOnboarding();

  const runner = new BotRunner(telegramAdapter.bot, handleTelegramUpdate);
  runner.start();

  console.log('[App]: Bot started successfully.');
}

main();