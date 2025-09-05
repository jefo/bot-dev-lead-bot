// Общие компоненты, которые можно будет переиспользовать по всему боту

export function Button(props: { text: string; callback_data: string }) {
  return { text: props.text, callback_data: props.callback_data };
}

export function Row(buttons: ReturnType<typeof Button>[]) {
  return buttons;
}

export function Keyboard(rows: ReturnType<typeof Row>[]) {
  return { inline_keyboard: rows };
}
