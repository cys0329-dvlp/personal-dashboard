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
        const audioBuffer = Buffer.from(input.audioBase64, 'base64');
        const fileKey = `recordings/${ctx.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.webm`;
        
        const { url } = await storagePut(fileKey, audioBuffer, 'audio/webm');
        
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
