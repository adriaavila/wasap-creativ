import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateAssistantReply(input: { systemPrompt: string; userMessage: string }) {
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: input.systemPrompt },
      { role: "user", content: input.userMessage },
    ],
    temperature: 0.4,
  });

  return completion.choices[0]?.message?.content ?? "I'm sorry—can you share more details so I can help?";
}
