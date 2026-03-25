import * as FileSystem from "expo-file-system/legacy";

type DocumentAiReceiptResult = {
  rawText: string;
  amount?: number;
  merchant?: string;
  date?: Date;
};

type DocumentEntity = {
  type?: string;
  mentionText?: string;
  normalizedValue?: {
    text?: string;
    moneyValue?: {
      units?: string | number;
      nanos?: number;
      currencyCode?: string;
    };
    dateValue?: {
      year?: number;
      month?: number;
      day?: number;
    };
  };
  properties?: DocumentEntity[];
};

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function getLines(rawText: string) {
  return rawText
    .split(/\r?\n/)
    .map((line) => normalizeWhitespace(line))
    .filter(Boolean);
}

function amountTokenToNumber(token: string): number | undefined {
  const cleaned = token.replace(/[^\d.,]/g, "");
  if (!cleaned) return undefined;

  const lastDot = cleaned.lastIndexOf(".");
  const lastComma = cleaned.lastIndexOf(",");
  const decimalPos = Math.max(lastDot, lastComma);

  if (decimalPos === -1) {
    const numeric = Number(cleaned);
    return Number.isFinite(numeric) ? numeric : undefined;
  }

  const integerPart = cleaned.slice(0, decimalPos).replace(/[.,]/g, "");
  const decimalPart = cleaned.slice(decimalPos + 1).replace(/[.,]/g, "");
  const normalized = `${integerPart}.${decimalPart}`;
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function parseAmount(rawText: string): number | undefined {
  const lines = getLines(rawText);
  const amountRegex = /\$?\s*\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?/g;
  const totalKeywords = /(total|importe total|a pagar|monto total|total a pagar|total mxn|total usd)/i;
  const weakKeywords = /(importe|monto|pagado|pago)/i;
  const badKeywords = /(cambio|propina|descuento|ahorro|subtotal|iva|impuesto|comision)/i;

  const candidates: Array<{ value: number; score: number }> = [];

  for (const line of lines) {
    const matches = line.match(amountRegex) ?? [];
    for (const token of matches) {
      const value = amountTokenToNumber(token);
      if (value === undefined) continue;
      if (value <= 0 || value > 100000) continue;

      let score = value;
      if (totalKeywords.test(line)) score += 30000;
      if (weakKeywords.test(line)) score += 5000;
      if (/\$\s*/.test(token)) score += 800;
      if (/(mxn|usd)/i.test(line)) score += 400;
      if (badKeywords.test(line)) score -= 20000;

      candidates.push({ value, score });
    }
  }

  if (!candidates.length) return undefined;
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0].value;
}

function parseMerchant(rawText: string): string | undefined {
  const lines = getLines(rawText);
  const blacklist =
    /^(ticket|recibo|factura|cliente|cajero|folio|fecha|hora|total|subtotal|importe|rfc|tel|telefono|www|https?:\/\/|c\.|col\.|cp\b|codigo postal|av\.|avenida|calle|mxn|articulo|cantidad|descripcion)/i;

  const clean = lines
    .slice(0, 10)
    .filter((line) => line.length >= 3)
    .filter((line) => !blacklist.test(line))
    .filter((line) => !/\d{5,}/.test(line))
    .filter((line) => !/@/.test(line))
    .filter((line) => !/^\d+([.,]\d+)?$/.test(line));

  if (!clean.length) return undefined;
  clean.sort((a, b) => b.length - a.length);
  return clean[0];
}

function isValidMerchantCandidate(value: string) {
  const text = normalizeWhitespace(value);
  if (!text || text.length < 3) return false;

  if (
    /^(rfc|tel|telefono|telefono:|fecha|hora|folio|ticket|recibo|factura|subtotal|total|importe|cajero|cliente)/i.test(
      text
    )
  ) {
    return false;
  }

  if (/(av\.|avenida|calle|col\.|cp\b|codigo postal|mxn|www|https?:\/\/)/i.test(text)) {
    return false;
  }

  if (/\d{5,}/.test(text)) return false;
  if (/^\d+([.,]\d+)?$/.test(text)) return false;

  return true;
}

function parseDate(rawText: string): Date | undefined {
  const candidates = [
    /\b(\d{2})[\/\-](\d{2})[\/\-](\d{4})\b/g,
    /\b(\d{4})[\/\-](\d{2})[\/\-](\d{2})\b/g,
    /\b(\d{2})[\/\-](\d{2})[\/\-](\d{2})\b/g,
  ];

  const now = new Date();
  const minDate = new Date(2015, 0, 1);

  const isValidReceiptDate = (date: Date) =>
    !isNaN(date.getTime()) && date >= minDate && date <= now;

  for (const regex of candidates) {
    const match = regex.exec(rawText);
    regex.lastIndex = 0;
    if (!match) continue;

    const d1 = Number(match[1]);
    const d2 = Number(match[2]);
    const d3 = Number(match[3]);

    if (regex === candidates[0]) {
      const parsed = new Date(d3, d2 - 1, d1);
      if (isValidReceiptDate(parsed)) return parsed;
      continue;
    }

    if (regex === candidates[1]) {
      const parsed = new Date(d1, d2 - 1, d3);
      if (isValidReceiptDate(parsed)) return parsed;
      continue;
    }

    const fullYear = d3 > 69 ? 1900 + d3 : 2000 + d3;
    const parsed = new Date(fullYear, d2 - 1, d1);
    if (isValidReceiptDate(parsed)) return parsed;
  }

  return undefined;
}

function getMimeTypeFromUri(imageUri: string) {
  const lower = imageUri.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".heic") || lower.endsWith(".heif")) return "image/heic";
  return "image/jpeg";
}

function findEntityByTypes(entities: DocumentEntity[], types: string[]) {
  const lowered = types.map((t) => t.toLowerCase());
  return entities.find((entity) => {
    const type = (entity.type ?? "").toLowerCase();
    return lowered.some((expected) => type === expected || type.endsWith(`/${expected}`));
  });
}

function parseAmountFromEntity(entity?: DocumentEntity): number | undefined {
  if (!entity) return undefined;

  const money = entity.normalizedValue?.moneyValue;
  if (money) {
    const units = Number(money.units ?? 0);
    const nanos = Number(money.nanos ?? 0);
    const value = units + nanos / 1_000_000_000;
    if (Number.isFinite(value) && value > 0) return Number(value.toFixed(2));
  }

  const fromMention = amountTokenToNumber(entity.mentionText ?? "");
  if (fromMention !== undefined) return fromMention;
  return amountTokenToNumber(entity.normalizedValue?.text ?? "");
}

function parseDateFromEntity(entity?: DocumentEntity): Date | undefined {
  if (!entity) return undefined;

  const dateValue = entity.normalizedValue?.dateValue;
  if (dateValue?.year && dateValue?.month && dateValue?.day) {
    const parsed = new Date(dateValue.year, dateValue.month - 1, dateValue.day);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  return parseDate(entity.mentionText ?? entity.normalizedValue?.text ?? "");
}

function parseMerchantFromEntity(entity?: DocumentEntity): string | undefined {
  if (!entity) return undefined;
  const text = normalizeWhitespace(entity.mentionText ?? entity.normalizedValue?.text ?? "");
  return isValidMerchantCandidate(text) ? text : undefined;
}

export async function extractReceiptWithDocumentAi(
  imageUri: string
): Promise<DocumentAiReceiptResult> {
  const projectId = process.env.EXPO_PUBLIC_GOOGLE_DOC_AI_PROJECT_ID;
  const location = process.env.EXPO_PUBLIC_GOOGLE_DOC_AI_LOCATION ?? "us";
  const processorId = process.env.EXPO_PUBLIC_GOOGLE_DOC_AI_PROCESSOR_ID;
  const accessToken = process.env.EXPO_PUBLIC_GOOGLE_DOC_AI_ACCESS_TOKEN;

  if (!projectId || !processorId || !accessToken) {
    throw new Error(
      "Faltan variables Document AI: EXPO_PUBLIC_GOOGLE_DOC_AI_PROJECT_ID, EXPO_PUBLIC_GOOGLE_DOC_AI_PROCESSOR_ID y EXPO_PUBLIC_GOOGLE_DOC_AI_ACCESS_TOKEN."
    );
  }

  const content = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const endpoint = `https://${location}-documentai.googleapis.com/v1/projects/${projectId}/locations/${location}/processors/${processorId}:process`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      rawDocument: {
        content,
        mimeType: getMimeTypeFromUri(imageUri),
      },
      skipHumanReview: true,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Document AI error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const rawText = data?.document?.text ?? "";
  const entities: DocumentEntity[] = data?.document?.entities ?? [];

  const amountFromEntity = parseAmountFromEntity(
    findEntityByTypes(entities, [
      "total_amount",
      "total",
      "amount_due",
      "net_amount",
      "invoice_total",
    ])
  );

  const merchantFromEntity =
    parseMerchantFromEntity(findEntityByTypes(entities, ["supplier_name"])) ??
    parseMerchantFromEntity(findEntityByTypes(entities, ["merchant_name"]));

  const dateFromEntity = parseDateFromEntity(
    findEntityByTypes(entities, [
      "receipt_date",
      "invoice_date",
      "date",
      "transaction_date",
    ])
  );

  return {
    rawText,
    amount: amountFromEntity ?? parseAmount(rawText),
    merchant: merchantFromEntity ?? parseMerchant(rawText),
    date: dateFromEntity ?? parseDate(rawText),
  };
}
