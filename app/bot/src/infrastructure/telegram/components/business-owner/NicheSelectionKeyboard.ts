import { Button, Row, Keyboard } from '../common'; // Предполагаем, что базовые компоненты будут созданы

// Клавиатура для выбора ниши
export function NicheSelectionKeyboard() {
  return Keyboard([
    Row([ Button({ text: '🛒 Товарный бизнес', callback_data: 'niche:ecommerce' }) ]),
    Row([ Button({ text: '🎓 Инфобизнес', callback_data: 'niche:infobiz' }) ]),
    Row([ Button({ text: '🛠️ Услуги', callback_data: 'niche:services' }) ]),
    Row([ Button({ text: '🍽️ HoReCa', callback_data: 'niche:horeca' }) ]),
    Row([ Button({ text: '🏢 B2B-компания', callback_data: 'niche:b2b' }) ]),
    Row([ Button({ text: '👤 Личный бренд', callback_data: 'niche:personal_brand' }) ]),
  ]);
}
