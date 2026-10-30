// Tutor service using backend proxy to eliminate client-side Google API errors

export interface TutorFlashcard {
  word: string;
  translation: string;
}

export const generateTutorCards = async (
  userInput: string,
  jobDescription?: string,
  customApiKey?: string
): Promise<TutorFlashcard[]> => {
  const response = await fetch('/api/tutor', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(customApiKey ? { 'x-custom-api-key': customApiKey } : {}),
    },
    body: JSON.stringify({
      userInput,
      jobDescription,
      customApiKey,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Lỗi máy chủ (${response.status})`);
  }

  const data = await response.json();
  return data.cards || [];
};

/**
 * Backwards-compatible stream pipeline for ProfessionalTutor.tsx
 * Simulates the LangGraph step progression while calling the secure server-side endpoint.
 */
export const getTutorPipeline = async (customApiKey?: string) => {
  return {
    stream: async function* (initialState: { user_input: string; job_description: string }) {
      // Step 1: Guardrail
      yield { guardrail_node: { is_safe: true } };

      // Step 2: Intent routing
      yield { intent_routing_node: { intent: 'vocabulary' } };

      // Step 3: Server execution
      const cards = await generateTutorCards(
        initialState.user_input,
        initialState.job_description,
        customApiKey
      );

      // Step 4: Generation output
      yield {
        generation_node: {
          final_output: JSON.stringify(cards),
        },
      };
    },
  };
};
