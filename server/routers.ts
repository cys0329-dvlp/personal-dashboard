import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { createLectureRecording, getLectureRecordingsByUserId, updateLectureRecording, deleteLectureRecording } from "./db";
import { storagePut } from "./storage";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  recordings: router({
    list: protectedProcedure.query(({ ctx }) =>
      getLectureRecordingsByUserId(ctx.user.id)
    ),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        subject: z.string().optional(),
        description: z.string().optional(),
        audioBase64: z.string(),
        duration: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Decode base64 to buffer
          let audioBuffer: Buffer;
          try {
            // Remove data URL prefix if present
            const base64Data = input.audioBase64.includes(',') 
              ? input.audioBase64.split(',')[1] 
              : input.audioBase64;
            
            audioBuffer = Buffer.from(base64Data, 'base64');
          } catch (e) {
            console.error('[Recording] Failed to decode base64:', e);
            throw new Error('Invalid audio data format');
          }

          // Validate buffer size (max 50MB)
          if (audioBuffer.length > 50 * 1024 * 1024) {
            throw new Error('Audio file too large (max 50MB)');
          }

          if (audioBuffer.length === 0) {
            throw new Error('Audio buffer is empty');
          }

          // Generate unique filename with timestamp
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).slice(2, 9);
          const fileKey = `recordings/${ctx.user.id}/${timestamp}-${randomId}.webm`;
          
          // Upload to S3 with proper MIME type
          const { url } = await storagePut(
            fileKey,
            audioBuffer,
            'audio/webm'
          );

          if (!url) {
            throw new Error('Failed to get S3 URL');
          }

          console.log(`[Recording] Saved: ${fileKey} (${audioBuffer.length} bytes)`);
          
          return await createLectureRecording({
            userId: ctx.user.id,
            title: input.title,
            subject: input.subject,
            description: input.description,
            audioUrl: url,
            audioFileKey: fileKey,
            duration: input.duration,
            recordedAt: new Date(),
          });
        } catch (error) {
          console.error('[Recording] Create error:', error);
          throw error;
        }
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        subject: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(({ ctx, input }) =>
        updateLectureRecording(input.id, ctx.user.id, {
          title: input.title,
          subject: input.subject,
          description: input.description,
        })
      ),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) =>
        deleteLectureRecording(input.id, ctx.user.id)
      ),
  }),
});

export type AppRouter = typeof appRouter;
