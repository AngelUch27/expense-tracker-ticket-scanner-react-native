import { db } from '../connection';

export const receiptRepository = {
  create(input: {
    userId: number;
    imageUri: string;
    ocrText?: string | null;
    detectedTotal?: number | null;
    detectedDate?: string | null;
    detectedMerchant?: string | null;
    detectedCurrency?: string | null;
    suggestedCategoryId?: number | null;
  }) {
    db.runSync(
      `
      INSERT INTO receipts (
        user_id,
        image_uri,
        ocr_text,
        detected_total,
        detected_date,
        detected_merchant,
        detected_currency,
        suggested_category_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.userId,
        input.imageUri,
        input.ocrText ?? null,
        input.detectedTotal ?? null,
        input.detectedDate ?? null,
        input.detectedMerchant ?? null,
        input.detectedCurrency ?? null,
        input.suggestedCategoryId ?? null,
      ]
    );
  },

  getPendingByUser(userId: number) {
    return db.getAllSync(
      `
      SELECT *
      FROM receipts
      WHERE user_id = ? AND status = 'pending'
      ORDER BY created_at DESC
      `,
      [userId]
    );
  },

  confirm(id: number) {
    db.runSync(
      `
      UPDATE receipts
      SET status = 'confirmed', updated_at = datetime('now')
      WHERE id = ?
      `,
      [id]
    );
  },

  reject(id: number) {
    db.runSync(
      `
      UPDATE receipts
      SET status = 'rejected', updated_at = datetime('now')
      WHERE id = ?
      `,
      [id]
    );
  },
};