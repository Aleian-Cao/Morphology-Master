import { StateGraph, END, Annotation } from "@langchain/langgraph";
import { MemorySaver } from "@langchain/langgraph-checkpoint";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import yaml from 'js-yaml';
import promptsYaml from '../public/prompts.yaml?raw';

// Define State
export const TutorStateAnnotation = Annotation.Root({
  user_input: Annotation<string>(),
  job_description: Annotation<string>(),
  is_safe: Annotation<boolean>(),
  intent: Annotation<string>(),
  final_output: Annotation<string>(),
});

type TutorState = typeof TutorStateAnnotation.State;

// Load config dynamically
let config: any = null;
const loadConfig = async () => {
    if (config) return config;
    try {
        config = yaml.load(promptsYaml);
        console.log("Loaded config:", config);
        return config;
    } catch (e) {
        console.error("Failed to parse prompts config", e);
        return null;
    }
}

// Intent Categories
const intents = [
    { name: "vocabulary", desc: "Tạo danh sách từ vựng, Cho tôi từ vựng chuyên ngành, Học từ mới mỗi ngày" },
    { name: "reflex", desc: "Tạo tình huống giao tiếp, Luyện phản xạ trong cuộc họp, Đóng vai đồng nghiệp" },
    { name: "writing", desc: "Sửa lại email này, Viết lại đoạn văn này chuyên nghiệp hơn, Chữa lỗi báo cáo" },
    { name: "error_correction", desc: "Sửa lỗi câu tôi hay nói, Tôi nói câu này đúng không, Sửa ngữ pháp" },
    { name: "speaking_practice", desc: "Chủ đề nói tiếng Anh 5 phút, Luyện nói mỗi ngày, Câu hỏi gợi ý nói" },
    { name: "listening_comprehension", desc: "Tóm tắt tài liệu này, Dịch và tóm tắt video, Liệt kê từ khóa của bài này" },
    { name: "translation", desc: "Dịch câu tiếng Việt này sang tiếng Anh, Chuyển ý này sang tiếng Anh, Dịch tự nhiên" },
    { name: "roadmap", desc: "Lộ trình 30 ngày, Kế hoạch học tiếng Anh, Lộ trình cho người bận rộn" }
];

export const getTutorPipeline = async (customApiKey?: string) => {
    const cnf = await loadConfig();
    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("API Key is required");

    const llmFast = new ChatGoogleGenerativeAI({
        model: "gemini-3-flash-preview",
        temperature: 0,
        apiKey: apiKey
    });

    const llmReasoning = new ChatGoogleGenerativeAI({
        model: "gemini-3-flash-preview", // Flash handles these prompts efficiently, can use Pro if needed
        temperature: 0.2,
        apiKey: apiKey
    });

    const guardrailNode = async (state: TutorState): Promise<Partial<TutorState>> => {
        const promptParams = { user_input: state.user_input };
        const promptTemplate = cnf.guardrail;
        const prompt = PromptTemplate.fromTemplate(promptTemplate);
        
        const chain = prompt.pipe(llmFast).pipe(new StringOutputParser());
        const result = await chain.invoke(promptParams);
        return { is_safe: result.trim().toUpperCase() === "SAFE" };
    };

    const intentRoutingNode = async (state: TutorState): Promise<Partial<TutorState>> => {
        if (!state.is_safe) return { intent: "unsafe" };

        const intentPrompt = PromptTemplate.fromTemplate(`
          Analyze the user's input and classify their intent into exactly ONE of the following categories:
          {categories}
          
          User Input: {user_input}
          
          Respond ONLY with the exact category name. If none match perfectly, default to 'translation'.
        `);

        const categoriesStr = intents.map(i => `- ${i.name}: (${i.desc})`).join("\n");
        const chain = intentPrompt.pipe(llmFast).pipe(new StringOutputParser());
        const result = await chain.invoke({
            categories: categoriesStr,
            user_input: state.user_input
        });

        const intent = result.trim().toLowerCase();
        const validIntents = intents.map(i => i.name);
        return { intent: validIntents.includes(intent) ? intent : "translation" };
    };

        const generationNode = async (state: TutorState): Promise<Partial<TutorState>> => {
        if (!state.is_safe) {
            return { final_output: JSON.stringify([{word: "Lỗi bảo mật", translation: "Request blocked due to security policies."}]) };
        }

        const intent = state.intent;
        const promptTemplateStr = `
Based on the following request: "{user_input}" (Job description: {job_description}),
generate a list of useful vocabulary words, phrases, or key concepts.

You MUST return the output EXACTLY as a valid JSON array of objects. 
Each object must have exactly two string properties: "word" and "translation" (in Vietnamese).
Do NOT include any markdown formatting, backticks, or other text outside the JSON array.
If the user asks to rewrite or translate something, extract the key vocabulary from it.

Example output:
[
  {{"word": "revenue", "translation": "doanh thu"}},
  {{"word": "profit margin", "translation": "biên lợi nhuận"}}
]
`;
        
        const prompt = PromptTemplate.fromTemplate(promptTemplateStr);
        const chain = prompt.pipe(llmReasoning).pipe(new StringOutputParser());
        
        const output = await chain.invoke({
            job_description: state.job_description,
            user_input: state.user_input
        });

        return { final_output: output };
    };

    const shouldContinue = (state: TutorState) => {
        if (!state.is_safe) return "generation_node";
        return "intent_routing_node";
    };

    const workflow = new StateGraph(TutorStateAnnotation)
        .addNode("guardrail_node", guardrailNode)
        .addNode("intent_routing_node", intentRoutingNode)
        .addNode("generation_node", generationNode)
        .addEdge("__start__", "guardrail_node")
        .addConditionalEdges("guardrail_node", shouldContinue)
        .addEdge("intent_routing_node", "generation_node")
        .addEdge("generation_node", END);

    const checkpointer = new MemorySaver();
    return workflow.compile({ checkpointer });
};
