import { env } from '../config/env.js';

function fallbackResponse(title) {
  return {
    available: false,
    content: `AI is not configured. Add OPENAI_API_KEY to enable ${title}.`,
  };
}

async function invokeModel(prompt) {
  if (!env.openAiApiKey) {
    return fallbackResponse('this workflow');
  }

  try {
    const response = await fetch(`${env.openAiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.openAiApiKey}`,
      },
      body: JSON.stringify({
        model: env.openAiModel,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert sales assistant. Return concise, business-ready output for a CRM application.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      return {
        available: false,
        content: 'The AI provider returned an error. Try again later.',
      };
    }

    const data = await response.json();
    return {
      available: true,
      content: data.choices?.[0]?.message?.content?.trim() || 'No AI output was returned.',
    };
  } catch (error) {
    return {
      available: false,
      content: 'The AI request failed. Check provider settings and try again.',
    };
  }
}

export const aiService = {
  summarizeLeadHistory: (context) =>
    invokeModel(`Summarize the following sales lead history into key points and next focus areas:\n${context}`),
  generateFollowUpEmail: (context) =>
    invokeModel(`Write a professional follow-up email based on this CRM context:\n${context}`),
  generateWhatsAppFollowUp: (context) =>
    invokeModel(`Write a concise WhatsApp-style follow-up message based on this CRM context:\n${context}`),
  suggestNextAction: (context) =>
    invokeModel(`Suggest the next best sales action with a short reason based on this CRM context:\n${context}`),
  generateMeetingSummary: (context) =>
    invokeModel(`Create a clean meeting summary with action items from these notes:\n${context}`),
  scoreLeadQuality: (context) =>
    invokeModel(`Score this lead from 1-100 with explanation, fit signals, risk signals, and recommended priority:\n${context}`),
  suggestPriority: (context) =>
    invokeModel(`Suggest a priority level of low, medium, high, or urgent with a short explanation for this lead:\n${context}`),
};
