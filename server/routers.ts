import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { registrationUploadsInput, uploadRegistrationDocuments } from "./registrationUploads";
import { normalizeLocalCommittee, recordLeaderboardRegistration } from "./registrationLeaderboard";
import { getSheetLeaderboard } from "./sheetsLeaderboard";
import { registrationSubmissionInput, submitRegistrationToSheets } from "./registrationSubmission";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
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

  registration: router({
    uploadDocuments: publicProcedure.input(registrationUploadsInput).mutation(({ input, ctx }) => uploadRegistrationDocuments(input, ctx.req)),
    submit: publicProcedure.input(registrationSubmissionInput).mutation(({ input }) => submitRegistrationToSheets(input)),
    leaderboard: publicProcedure.query(() => getSheetLeaderboard()),
    record: publicProcedure.input(z.object({ lc: z.string().min(1), email: z.string().email() })).mutation(async ({ input }) => {
      const lc = normalizeLocalCommittee(input.lc);
      if (!lc) throw new TRPCError({ code: "BAD_REQUEST", message: "Select a valid local committee." });
      const recorded = await recordLeaderboardRegistration(lc, input.email);
      if (!recorded) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Registration leaderboard is unavailable." });
      return { lc };
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
