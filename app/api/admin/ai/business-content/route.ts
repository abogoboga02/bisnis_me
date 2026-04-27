import {
  FULL_GENERATION_COST_TENTHS,
  SECTION_GENERATION_COST_TENTHS,
  type GenerateAiBusinessContentPayload,
  type GenerateAiBusinessContentResponse,
} from "@/lib/ai-business-content";
import { generateBusinessContentWithAi, generateBusinessSectionWithAi } from "@/lib/ai-business-generator";
import { consumeAdminAiCredits, getAdminAiQuota } from "@/lib/business-store";
import {
  assertJsonRequest,
  assertRateLimit,
  assertSameOrigin,
  handleRouteError,
  jsonResponse,
  requireAdminApiSession,
} from "@/lib/route-security";

function resolveCostTenths(body: GenerateAiBusinessContentPayload) {
  return body.mode === "section" ? SECTION_GENERATION_COST_TENTHS : FULL_GENERATION_COST_TENTHS;
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    assertJsonRequest(request);
    assertRateLimit(request, {
      namespace: "admin-ai-business-content",
      max: 8,
      windowMs: 10 * 60 * 1000,
    });

    const session = await requireAdminApiSession();
    const body = (await request.json()) as Partial<GenerateAiBusinessContentPayload>;

    if (body.mode !== "full" && body.mode !== "section") {
      return jsonResponse({ error: "Mode generate AI tidak valid." }, { status: 400, noStore: true });
    }

    if (!body.brief?.trim()) {
      return jsonResponse({ error: "Brief bisnis wajib diisi sebelum generate AI." }, { status: 400, noStore: true });
    }

    if (!body.template?.id || !body.template.key || !body.template.name) {
      return jsonResponse({ error: "Template aktif wajib dipilih sebelum generate AI." }, { status: 400, noStore: true });
    }

    if (body.mode === "section" && !body.target) {
      return jsonResponse({ error: "Target section AI wajib dipilih." }, { status: 400, noStore: true });
    }

    const costTenths = resolveCostTenths(body as GenerateAiBusinessContentPayload);
    const quota = await getAdminAiQuota(session);

    if (!quota.unlimited && (quota.remainingTenths ?? 0) < costTenths) {
      return jsonResponse(
        { error: "Token AI Anda tidak mencukupi. Hubungi admin untuk menambah token sebelum generate lagi." },
        { status: 403, noStore: true },
      );
    }

    let payload: GenerateAiBusinessContentResponse;

    if (body.mode === "section") {
      const target = body.target;

      if (!target) {
        return jsonResponse({ error: "Target section AI wajib dipilih." }, { status: 400, noStore: true });
      }

      const sectionData = await generateBusinessSectionWithAi({
        brief: body.brief.trim(),
        target,
        template: body.template,
        currentDraft: body.currentDraft ?? {},
      });

      const updatedQuota = await consumeAdminAiCredits(session, costTenths);
      payload = {
        mode: "section",
        data: sectionData,
        meta: {
          remainingCreditsTenths: updatedQuota.remainingTenths,
          unlimited: updatedQuota.unlimited,
          costTenths,
        },
      };
    } else {
      const fullData = await generateBusinessContentWithAi({
        brief: body.brief.trim(),
        template: body.template,
        currentDraft: body.currentDraft,
      });

      const updatedQuota = await consumeAdminAiCredits(session, costTenths);
      payload = {
        mode: "full",
        data: fullData,
        meta: {
          remainingCreditsTenths: updatedQuota.remainingTenths,
          unlimited: updatedQuota.unlimited,
          costTenths,
        },
      };
    }

    return jsonResponse({ data: payload }, { noStore: true });
  } catch (error) {
    return handleRouteError(error, "Gagal membuat draft bisnis dengan AI.");
  }
}
