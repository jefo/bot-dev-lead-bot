import { Button, Row, Keyboard } from '../common';
import { QualificationProfileState } from '../../../../domain/entities/qualification-profile.entity';

// Определяем варианты "болей" для каждой ниши
const painPointsByNiche: Record<string, { text: string; id: string }[]> = {
  infobiz: [
    { text: '📈 Прогревать и продавать', id: 'sales_automation' },
    { text: '🔔 Напоминать о дедлайнах', id: 'support_automation' },
    { text: '💬 Создать комьюнити', id: 'community' },
  ],
  ecommerce: [
    { text: '✅ Увеличить число заказов', id: 'sales_automation' },
    { text: '🗣️ Авто-ответы о товарах', id: 'support_automation' },
    { text: '📢 Собирать отзывы', id: 'leadgen' },
  ],
  // ... другие ниши
};

const defaultPainPoints = [
  { text: '📈 Привлечь больше клиентов', id: 'leadgen' },
  { text: '🤖 Автоматизировать рутину', id: 'support_automation' },
];

/**
 * Динамический компонент клавиатуры для выбора "боли" клиента.
 * @param props - niche: текущая ниша клиента.
 */
export function PainPointSelectionKeyboard(props: { niche: QualificationProfileState['niche'] }) {
  const options = (props.niche && painPointsByNiche[props.niche]) || defaultPainPoints;

  const rows = options.map(option => 
    Row([ Button({ text: option.text, callback_data: `pain:${option.id}` }) ])
  );

  return Keyboard(rows);
}
