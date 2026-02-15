export async function sendWhatsAppText(params: { to: string; body: string }) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) throw new Error("Missing WhatsApp credentials");

  const response = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messaging_product: "whatsapp", to: params.to, text: { body: params.body } }),
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`WhatsApp API failed (${response.status}): ${body}`);
  }

  return body;
}
