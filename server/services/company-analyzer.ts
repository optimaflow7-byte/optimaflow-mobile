import { invokeLLM } from "../_core/llm";

export interface CompanyAnalysis {
  weaknesses: Array<{
    label: string;
    score: number; // 0-10
    description: string;
  }>;
  hypothesis: string;
  insights: string[];
  opportunityScore: number; // 0-10
}

export interface StrategyGeneration {
  outreachMessage: string;
  hypothesis: string;
  discoveryAngles: string[];
  objections: Array<{
    objection: string;
    response: string;
  }>;
  callHook: string;
}

/**
 * Analyzes a company's sales weaknesses based on name, country, and type
 */
export async function analyzeCompanyWeaknesses(
  companyName: string,
  country: string,
  type: string
): Promise<CompanyAnalysis> {
  const prompt = `Analyze the sales process weaknesses for this company:
- Company: ${companyName}
- Country: ${country}
- Type: ${type}

Based on typical patterns in the ${type} industry in ${country}, identify:
1. Lead capture effectiveness (0-10 score, where 10 is excellent)
2. Follow-up system quality (0-10 score)
3. Response speed (0-10 score)
4. Sales process clarity (0-10 score)
5. CRM usage indicators (0-10 score)

For each weakness, provide a brief description of what's likely happening.

Return a JSON response with this exact structure:
{
  "weaknesses": [
    {
      "label": "Captura de Leads",
      "score": 6,
      "description": "Description of the weakness"
    }
  ],
  "hypothesis": "Main hypothesis about their sales inefficiency",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "opportunityScore": 7
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are a sales process expert analyzing automotive and EV companies. Provide realistic assessments based on industry patterns.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "company_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            weaknesses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  score: { type: "number" },
                  description: { type: "string" },
                },
                required: ["label", "score", "description"],
                additionalProperties: false,
              },
            },
            hypothesis: { type: "string" },
            insights: {
              type: "array",
              items: { type: "string" },
            },
            opportunityScore: { type: "number" },
          },
          required: ["weaknesses", "hypothesis", "insights", "opportunityScore"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  if (typeof content !== "string") {
    throw new Error("Invalid LLM response format");
  }

  return JSON.parse(content);
}

/**
 * Generates a personalized sales strategy for a company
 */
export async function generateSalesStrategy(
  companyName: string,
  country: string,
  type: string,
  analysis: CompanyAnalysis
): Promise<StrategyGeneration> {
  const prompt = `Generate a personalized sales strategy for prospecting this company:
- Company: ${companyName}
- Country: ${country}
- Type: ${type}
- Main Weakness: ${analysis.hypothesis}
- Opportunity Score: ${analysis.opportunityScore}/10

Create a strategy that:
1. Includes a short, personalized outreach message (LinkedIn/Email style)
2. Provides a hypothesis about their main sales inefficiency
3. Suggests 2 discovery call angles
4. Lists likely objections and professional responses
5. Includes a 15-minute call positioning hook

Remember:
- OptimaFlow installs a proven sales follow-up system (not CRM software)
- Focus on revenue improvement and system clarity
- Do NOT mention automation tools or GoHighLevel
- Keep communication direct and executive-level

Return JSON with this structure:
{
  "outreachMessage": "Full message text",
  "hypothesis": "Hypothesis text",
  "discoveryAngles": ["angle 1", "angle 2"],
  "objections": [
    {
      "objection": "Common objection",
      "response": "Professional response"
    }
  ],
  "callHook": "15-minute hook"
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an expert sales strategist for OptimaFlow, a company that installs proven sales follow-up systems for automotive dealerships and EV companies in Europe. Your strategies should be direct, executive-level, and focused on revenue improvement.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "sales_strategy",
        strict: true,
        schema: {
          type: "object",
          properties: {
            outreachMessage: { type: "string" },
            hypothesis: { type: "string" },
            discoveryAngles: {
              type: "array",
              items: { type: "string" },
            },
            objections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  objection: { type: "string" },
                  response: { type: "string" },
                },
                required: ["objection", "response"],
                additionalProperties: false,
              },
            },
            callHook: { type: "string" },
          },
          required: ["outreachMessage", "hypothesis", "discoveryAngles", "objections", "callHook"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  if (typeof content !== "string") {
    throw new Error("Invalid LLM response format");
  }

  return JSON.parse(content);
}
