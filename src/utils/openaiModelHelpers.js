// Model reasoning OpenAI (gpt-5*, o1, o3) menolak parameter `temperature`
// sama sekali (HTTP 400 "Unsupported parameter: 'temperature' is not
// supported with this model."). Model non-reasoning seperti gpt-4.1-nano
// masih menerimanya seperti biasa.
export function isOpenAIReasoningModel(model) {
  return /^(gpt-5|o1|o3)/i.test(model || '');
}
