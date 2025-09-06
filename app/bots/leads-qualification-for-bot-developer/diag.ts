const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('Ошибка: TELEGRAM_BOT_TOKEN не найден в вашем файле .env');
  process.exit(1);
}

const BASE_URL = `https://api.telegram.org/bot${token}`;
let offset = 0;

console.log('Запускаю long-polling на "голом" API...');
console.log(`Используется токен, начинающийся с: ${token.substring(0, 8)}...`);

async function getUpdates() {
  // Таймаут в 30 секунд - это long-polling
  const url = `${BASE_URL}/getUpdates?offset=${offset}&timeout=30`;
  console.log(`> Отправляю запрос: ${url}`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`! Ошибка сети: ${response.status} ${response.statusText}`);
      // Пауза 5 секунд перед повторной попыткой в случае ошибки сети
      await new Promise(resolve => setTimeout(resolve, 5000));
      return;
    }

    const data: any = await response.json();

    if (!data.ok) {
      console.error('! Ошибка API Telegram:', data);
      // Если токен невалидный, Telegram вернет ошибку, и мы ее увидим здесь
      return;
    }

    if (data.result.length > 0) {
        console.log(`
--- ПОЛУЧЕНО ${data.result.length} ОБНОВЛЕНИЙ ---
`);
    }

    for (const update of data.result) {
      console.log(JSON.stringify(update, null, 2));
      console.log('--------------------------');
      // Увеличиваем offset, чтобы не получать это обновление снова
      offset = update.update_id + 1;
    }

  } catch (error) {
    console.error('! Критическая ошибка в getUpdates:', error);
  }
}

async function main() {
  // Бесконечный цикл для постоянного опроса
  while (true) {
    await getUpdates();
  }
}

main();