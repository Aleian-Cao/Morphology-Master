import { GoogleGenAI, Type } from "@google/genai";
import { DrillQuestion, Lesson, PartType, RemediationPlan, WordPart } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const getText = (response: any): string => {
    if (response.text) return response.text;
    if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts && response.candidates[0].content.parts[0].text) {
        return response.candidates[0].content.parts[0].text;
    }
    return '';
};

// 1. Generate Lesson Content (Bilingual, Multi-Dissection)
export const enrichLessonData = async (root: string, category: string): Promise<Partial<Lesson>> => {
  try {
    const prompt = `
      Create a deep, bilingual (English & Vietnamese) morphology lesson for the root/affix: "${root}" (${category}).
      
      Requirements:
      1. Meaning & Etymology in both languages.
      2. "DissectionPack": Choose 3 distinct words derived from this root (1 easy, 1 medium, 1 hard) to be dissected into parts.
      3. "RichDerivatives": 5 common derived words with definitions and examples in both languages.
      
      JSON Schema:
      {
        meaning: string,
        meaning_vi: string,
        phonetic: string,
        etymology: string,
        etymology_vi: string,
        funFact: string,
        funFact_vi: string,
        metaphor: string,
        metaphor_vi: string,
        dissectionPack: [
          {
            word: string,
            translation: string,
            parts: [{ text: string, type: "PREFIX"|"ROOT"|"SUFFIX", meaning: string, meaning_vi: string }]
          }
        ],
        richDerivatives: [
            { word: string, definition: string, definition_vi: string, example: string, example_vi: string }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const jsonStr = getText(response);
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("Enrichment Error:", error);
    return { meaning: "Error loading content", dissectionPack: [] };
  }
};

// 2. Generate 10 Questions (Pass mark 7/10)
export const generateDrillQuestions = async (root: string, meaning: string): Promise<DrillQuestion[]> => {
  try {
    const prompt = `
      Create 10 multiple-choice questions for the English root "${root}" (${meaning}).
      Questions should test understanding of derived words and context.
      Include Vietnamese explanations.
      
      JSON Schema:
      {
        questions: [
          {
            question: string,
            options: string[],
            correctAnswer: string,
            explanation: string,
            explanation_vi: string
          }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const jsonStr = getText(response);
    const parsed = JSON.parse(jsonStr);
    return parsed.questions || [];
  } catch (error) {
    return [];
  }
};

// 3. User Sandbox Verification (Word Lab)
export const verifyUserDerivative = async (root: string, userWord: string): Promise<{
    isValid: boolean;
    analysis: string;
    parts?: WordPart[];
    meaning?: string;
    meaning_vi?: string;
}> => {
    try {
        const prompt = `
          The user suggests the word "${userWord}" contains the root "${root}".
          1. Is this etymologically correct? (isValid: boolean)
          2. If yes, break it down and explain meaning in English and Vietnamese.
          3. If no, explain why briefly.
          
          JSON Schema:
          {
            isValid: boolean,
            analysis: string, 
            meaning: string,
            meaning_vi: string,
            parts: [{ text: string, type: "PREFIX"|"ROOT"|"SUFFIX", meaning: string }]
          }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        return JSON.parse(getText(response));
    } catch (e) {
        return { isValid: false, analysis: "AI Analysis Failed." };
    }
};

// 4. Remediation Plan (If failed drill)
export const generateRemediation = async (root: string, missedQuestions: string[]): Promise<RemediationPlan> => {
    try {
        const prompt = `
          A student failed the quiz on root "${root}".
          They missed questions about: ${missedQuestions.join('; ')}.
          
          Provide a Remediation Plan:
          1. Analysis: Encouraging feedback on what they misunderstood.
          2. ReviewPoints: 3 bullet points (bilingual En/Vi) explaining the concepts they missed.
          
          JSON Output.
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        return JSON.parse(getText(response));
    } catch (e) {
        return { analysis: "Review the definitions again.", reviewPoints: ["Check definitions"] };
    }
};

export const generateTierAssessment = async (tierId: number, roots: string[]): Promise<DrillQuestion[]> => {
    // Existing logic, just ensure model is correct
     try {
    const sampledRoots = roots.sort(() => 0.5 - Math.random()).slice(0, 5);
    const prompt = `Create a challenge assessment for Tier ${tierId} covering roots: ${sampledRoots.join(', ')}. 10 Questions. JSON Output.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(getText(response)).questions || [];
  } catch (error) { return []; }
};

export const evaluateAssessment = async (tierId: number, score: number, total: number, missedConcepts: string[]): Promise<string> => {
     try {
        const prompt = `Tier ${tierId} Exam Result: ${score}/${total}. Missed: ${missedConcepts.join(', ')}. Give short feedback.`;
        const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
        return getText(response);
    } catch (e) { return "Done."; }
};