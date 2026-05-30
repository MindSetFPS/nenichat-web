export type SuggestionAction =
  | { action: "send_message"; label: string; text: string }
  | { action: "open_form"; label: string; formType: string; data: Record<string, unknown> };
