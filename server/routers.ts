import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { analyzeCompanyWeaknesses, generateSalesStrategy } from "./services/company-analyzer";
import { importLeadsFromNotebook } from "./scripts/import-leads";
import * as db from "./db";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  opportunities: router({
    list: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return db.getUserOpportunities(input.userId);
      }),

    metrics: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return db.getOpportunityMetrics(input.userId);
      }),

    create: publicProcedure
      .input(
        z.object({
          userId: z.number(),
          companyName: z.string(),
          country: z.string(),
          companyType: z.string(),
          opportunityScore: z.number(),
          strategyId: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.createOpportunity({
          userId: input.userId,
          companyName: input.companyName,
          country: input.country,
          companyType: input.companyType,
          status: "contactado",
          opportunityScore: input.opportunityScore,
          strategyId: input.strategyId,
          contactDate: new Date(),
        });
      }),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getOpportunityById(input.id);
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["contactado", "en_progreso", "cerrado", "perdido"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        await db.updateOpportunity(input.id, { status: input.status });
        return db.getOpportunityById(input.id);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteOpportunity(input.id);
        return { success: true };
      }),
  }),

  importNotebookLeads: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        leads: z.array(
          z.object({
            companyName: z.string(),
            country: z.string(),
            companyType: z.string(),
            website: z.string().optional(),
            opportunityScore: z.number(),
            weaknesses: z.array(z.string()).optional(),
            contactPerson: z.string().optional(),
            notes: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      await importLeadsFromNotebook(input.leads, input.userId);
      return { success: true, count: input.leads.length };
    }),


  activities: router({
    list: publicProcedure
      .input(z.object({ opportunityId: z.number() }))
      .query(async ({ input }) => {
        return db.getOpportunityActivities(input.opportunityId);
      }),

    create: publicProcedure
      .input(
        z.object({
          opportunityId: z.number(),
          type: z.enum(["llamada", "email", "reunion", "nota", "propuesta"]),
          title: z.string(),
          notes: z.string().optional(),
          result: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.createActivity({
          opportunityId: input.opportunityId,
          type: input.type,
          title: input.title,
          notes: input.notes,
          result: input.result,
        });
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteActivity(input.id);
        return { success: true };
      }),
  }),

  dealerships: router({
    list: publicProcedure.query(async () => {
      return db.getDealerships();
    }),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getDealershipById(input.id);
      }),

    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          address: z.string().optional(),
          city: z.string().optional(),
          country: z.string().optional(),
          phone: z.string().optional(),
          website: z.string().optional(),
          status: z.enum(["activo", "inactivo", "pendiente"]).optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        // @ts-ignore - status enum conflict possibility, but valid at runtime
        return db.createDealership(input);
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          address: z.string().optional(),
          status: z.enum(["activo", "inactivo", "pendiente"]).optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        // @ts-ignore
        await db.updateDealership(id, data);
        return db.getDealershipById(id);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteDealership(input.id);
        return { success: true };
      }),
  }),

  company: router({
    analyze: publicProcedure
      .input(
        z.object({
          companyName: z.string().min(1),
          country: z.string().min(1),
          type: z.string().min(1),
        })
      )
      .query(async ({ input }) => {
        return analyzeCompanyWeaknesses(input.companyName, input.country, input.type);
      }),

    generateStrategy: publicProcedure
      .input(
        z.object({
          companyName: z.string().min(1),
          country: z.string().min(1),
          type: z.string().min(1),
          analysis: z.object({
            weaknesses: z.array(
              z.object({
                label: z.string(),
                score: z.number(),
                description: z.string(),
              })
            ),
            hypothesis: z.string(),
            insights: z.array(z.string()),
            opportunityScore: z.number(),
          }),
        })
      )
      .query(async ({ input }) => {
        return generateSalesStrategy(
          input.companyName,
          input.country,
          input.type,
          input.analysis
        );
      }),
  }),

  europeanDealerships: router({
    list: publicProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
          query: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        console.log("Fetching European Dealerships:", input);
        const results = await db.getEuropeanDealerships(input.limit, input.offset, input.query);
        console.log("European Dealerships Found:", results.length);
        return results;
      }),

    get: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return db.getEuropeanDealershipById(input.id);
      }),

    import: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        return db.createDealershipFromEuropean(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
