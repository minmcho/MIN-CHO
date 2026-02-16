
import { GoogleGenAI, Type } from "@google/genai";
import { Roadmap, Job, ResumeReport, SkillDetailPlan } from "../types";

export const getGeminiClient = () => {
  const apiKey = process.env.API_KEY || "";
  return new GoogleGenAI({ apiKey });
};

export async function analyzeResume(resumeText: string, targetRole: string): Promise<ResumeReport> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Analyze the following STEM resume for the target role: ${targetRole}. 
    Provide a JSON report evaluating score (0-100), technical skills, missing keywords, structural feedback, impact suggestions, and depth.
    Resume Content: ${resumeText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.INTEGER },
          technicalSkillsMatch: { type: Type.ARRAY, items: { type: Type.STRING } },
          missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          structureFeedback: { type: Type.STRING },
          impactSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          depthAssessment: { type: Type.STRING }
        },
        required: ["score", "technicalSkillsMatch", "missingKeywords", "structureFeedback", "impactSuggestions", "depthAssessment"]
      }
    }
  });

  return JSON.parse(response.text) as ResumeReport;
}

export async function generateSkillRoadmap(role: string): Promise<Roadmap> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a detailed STEM skill roadmap for someone wanting to become a ${role}. 
    Include specific technical skills, resources, and difficulty levels.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          role: { type: Type.STRING },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                resources: { type: Type.ARRAY, items: { type: Type.STRING } },
                difficulty: { type: Type.STRING, enum: ["Beginner", "Intermediate", "Advanced"] }
              },
              required: ["title", "description", "resources", "difficulty"]
            }
          }
        },
        required: ["role", "steps"]
      }
    }
  });

  return JSON.parse(response.text) as Roadmap;
}

export async function generateDetailedSkillPlan(skillTitle: string, targetRole: string): Promise<SkillDetailPlan> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Create a granular learning blueprint for the skill "${skillTitle}" within the context of becoming a "${targetRole}". 
    Provide a 4-week breakdown, hands-on project ideas, and potential interview questions.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          weeks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                objectives: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          },
          projects: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                techStack: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          },
          interviewQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["weeks", "projects", "interviewQuestions"]
      }
    }
  });

  return JSON.parse(response.text) as SkillDetailPlan;
}

export async function searchSTEMJobs(query: string, country?: string, city?: string): Promise<{ jobs: Job[], sources: any[] }> {
  const ai = getGeminiClient();
  const locationContext = [city, country].filter(Boolean).join(", ");
  const fullQuery = `Find the most relevant and recent STEM jobs for: ${query}${locationContext ? ` specifically in ${locationContext}` : ''}. 
    Use Google Search grounding for real market context and prioritize active listings.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: fullQuery,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  const extractionResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Convert the following job search findings into a JSON list of job objects.
    Important: Ensure the 'location' field matches the real city and country found in the search results.
    Findings: ${response.text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            company: { type: Type.STRING },
            location: { type: Type.STRING },
            description: { type: Type.STRING },
            requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
            salary: { type: Type.STRING }
          }
        }
      }
    }
  });

  return {
    jobs: JSON.parse(extractionResponse.text),
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
}

export async function analyzeJournalEntry(content: string): Promise<string> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a STEM career growth coach. Analyze this journal entry and provide a concise (2-3 sentences), highly insightful piece of feedback. Focus on identifying hidden technical growth, suggesting a professional connection, or recommending a specific advanced topic to explore based on the reflection. Entry: "${content}"`,
    config: {
      temperature: 0.7,
    }
  });
  return response.text || "Continue reflecting on your journey to unlock more insights.";
}
