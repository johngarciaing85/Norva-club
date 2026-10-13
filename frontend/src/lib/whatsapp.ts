interface WhatsAppMessageParams {
  productName: string;
  size?: string;
  price: string;
  productUrl: string;
}

export function buildWhatsAppMessage({
  productName,
  size,
  price,
  productUrl,
}: WhatsAppMessageParams): string {
  const sizeText = size ? `, talla ${size},` : ",";
  return `Hola, estoy interesado en ${productName}${sizeText} con precio de ${price} COP. ${productUrl}. ¿Me pueden confirmar disponibilidad?`;
}

export function buildWhatsAppUrl(
  phoneNumber: string,
  message: string
): string {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}
