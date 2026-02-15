import { z } from "zod";

export const webhookPayloadSchema = z.object({
  entry: z.array(
    z.object({
      changes: z.array(
        z.object({
          value: z.object({
            messages: z
              .array(
                z.object({
                  id: z.string().optional(),
                  timestamp: z.string().optional(),
                  from: z.string(),
                  type: z.string(),
                  text: z.object({ body: z.string() }).optional(),
                }),
              )
              .optional(),
            contacts: z.array(z.object({ wa_id: z.string() })).optional(),
          }),
        }),
      ),
    }),
  ),
});
