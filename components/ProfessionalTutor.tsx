import React, { useState } from 'react';
import { Bot, Send, ShieldAlert, ArrowLeft, Briefcase, Activity, CheckCircle2 } from 'lucide-react';
import { getTutorPipeline } from '../services/tutorService';
import Markdown from 'react-markdown';
import { User } from '../types';

interface ProfessionalTutorProps {
  user: User | null;
  onBack: () => void;
}

export const ProfessionalTutor: React.FC<ProfessionalTutorProps> = ({ user, onBack }) => {
  const [jobDescription, setJobDescription] = useState(user?.progress?.jobDescription || 'Software Engineer');
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string, intent?: string, isSafe?: boolean }[]>([
    { role: 'assistant', content: 'Xin chào! Tôi là Trợ lý Tiếng Anh Chuyên ngành dựa trên hệ thống Multi-Agent của bạn. Bạn muốn cải thiện kỹ năng nào hôm nay? (Ví dụ: "Tạo danh sách từ vựng", "Sửa lỗi email này", "Dịch câu sau", ...)' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>('');

  const handleSend = async () => {
    if (!userInput.trim()) return;
    
    const currentUserInput = userInput;
    setUserInput('');
    setMessages(prev => [...prev, { role: 'user', content: currentUserInput }]);
    setIsLoading(true);

    try {
      setCurrentStatus('Guardrail đang kiểm tra an toàn...');
      const app = await getTutorPipeline(user?.customApiKey);
      const initialState = {
        user_input: currentUserInput,
        job_description: jobDescription,
        is_safe: true,
        intent: '',
        final_output: ''
      };

      // We can stream state updates or just invoke
      const stream = await app.stream(initialState);
      let finalState: any = null;
      for await (const s of stream) {
          if (s.guardrail_node) {
              setCurrentStatus('Phân loại Semantic Intent...');
          }
          if (s.intent_routing_node) {
              setCurrentStatus(`Đang xử lý luồng: [${s.intent_routing_node.intent}] ...`);
          }
          if (s.generation_node) {
             finalState = s.generation_node;
          }
      }

      setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: finalState.final_output,
          intent: finalState.intent,
          isSafe: finalState.is_safe ?? true
      }]);

    } catch (e: any) {
       console.error(e);
       setMessages(prev => [...prev, { role: 'assistant', content: `Lỗi hệ thống: ${e.message}` }]);
    }

    setIsLoading(false);
    setCurrentStatus('');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col pt-16">
      <div className="flex justify-between items-center bg-white border-b border-stone-200 p-4 fixed top-0 w-full z-10 shadow-sm">
        <button onClick={onBack} className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors font-bold">
          <ArrowLeft size={20} /> Quay lại Dashboard
        </button>
        <div className="flex items-center gap-2 text-orange-600 font-bold bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
           <Bot size={18} /> LangGraph Tutor V2
        </div>
      </div>

      <div className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col mt-2">
        
        {/* Settings Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="flex items-center gap-3 w-full md:w-auto">
               <div className="bg-stone-100 p-2 rounded-lg"><Briefcase size={20} className="text-stone-600"/></div>
               <div className="flex flex-col flex-1">
                   <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Ngành nghề / Vị trí</label>
                   <input 
                      type="text" 
                        value={jobDescription} 
                      onChange={(e) => setJobDescription(e.target.value)}
                      onBlur={() => {
                          if (user && user.uid) {
                              // We could update standard user progress here via an event
                          }
                      }}
                      className="font-serif font-bold text-lg text-stone-800 bg-transparent border-b border-stone-300 focus:border-orange-500 outline-none w-full max-w-[200px]"
                      placeholder="VD: Software Engineer"
                   />
               </div>
           </div>
           <div className="flex items-center gap-4 text-xs font-medium text-stone-500 bg-stone-50 px-4 py-2 rounded-xl">
              <div className="flex items-center gap-1"><CheckCircle2 size={14} className="text-green-500"/> Guardrail Active</div>
              <div className="flex items-center gap-1"><Activity size={14} className="text-blue-500"/> Semantic Routing</div>
           </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col mb-6">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-orange-100' : 'bg-stone-900'}`}>
                            {msg.role === 'user' ? <span className="font-bold text-orange-700">{user?.username?.[0] || 'U'}</span> : <Bot size={20} className="text-white"/>}
                        </div>
                        <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                            {msg.intent && (
                                <div className="text-xs font-bold text-stone-400 mb-1 flex items-center gap-1 uppercase tracking-wider">
                                   Intent routed: {msg.intent}
                                </div>
                            )}
                            <div className={`px-5 py-4 rounded-2xl markdown-body ${msg.role === 'user' ? 'bg-stone-100 text-stone-800 rounded-tr-sm' : 'bg-orange-50 border border-orange-100 text-stone-800 rounded-tl-sm'}`}>
                                {msg.isSafe === false && (
                                    <div className="flex items-center gap-2 text-red-600 font-bold mb-2 pb-2 border-b border-red-200">
                                       <ShieldAlert size={18}/> Cảnh báo Bảo mật
                                    </div>
                                )}
                                <div className="prose prose-sm prose-stone">
                                  <Markdown>{msg.content}</Markdown>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex gap-4">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center">
                            <Bot size={20} className="text-white animate-pulse"/>
                        </div>
                        <div className="bg-orange-50 border border-orange-100 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-3">
                           <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                           <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-100"></div>
                           <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-200"></div>
                           <span className="text-sm font-medium text-orange-800 ml-2">{currentStatus}</span>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Input Area */}
            <div className="p-4 bg-stone-50 border-t border-stone-200">
                <div className="relative">
                    <textarea 
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => {
                           if (e.key === 'Enter' && !e.shiftKey) {
                               e.preventDefault();
                               handleSend();
                           }
                        }}
                        placeholder="Nhập yêu cầu của bạn (VD: Tạo danh sách 10 từ vựng cho kế toán...)"
                        className="w-full bg-white border border-stone-300 rounded-xl pl-4 pr-14 py-4 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none resize-none h-24"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={isLoading || !userInput.trim()}
                        className="absolute right-3 bottom-3 bg-stone-900 text-white p-2.5 rounded-lg hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        <Send size={18} />
                    </button>
                </div>
                <div className="mt-2 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                   {['Tạo danh sách từ vựng', 'Sửa lỗi email', 'Luyện phản xạ họp', 'Dịch câu phức tạp'].map(hint => (
                       <button 
                          key={hint}
                          onClick={() => setUserInput(hint)}
                          className="shrink-0 text-xs font-medium text-stone-500 bg-stone-200/50 hover:bg-stone-200 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
                       >
                           {hint}
                       </button>
                   ))}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
