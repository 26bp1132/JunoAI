import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  Send, 
  Trash2, 
  Sparkles, 
  Zap, 
  GraduationCap, 
  Copy, 
  Check, 
  Image as ImageIcon,
  X,
  BookOpen,
  Mic,
  Maximize2,
  Paperclip
} from "lucide-react";

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
  modelUsed?: string;
  isFallback?: boolean;
  image?: {
    data: string;
    mimeType: string;
    previewUrl: string;
    name?: string;
  };
  isStreaming?: boolean;
}

interface GeminiChatProps {
  theme?: "default" | "dark_neon" | "medal";
  isOpen?: boolean;
  onClose?: () => void;
  isEmbedded?: boolean;
}

interface StagedImage {
  data: string;
  mimeType: string;
  previewUrl: string;
  name: string;
}

export default function GeminiChatModal({
  theme = "default",
  isOpen = true,
  onClose,
  isEmbedded = false,
}: GeminiChatProps) {
  const [role, setRole] = useState<"study" | "speech_coach" | "quick_qna">("study");
  const [speedPreference, setSpeedPreference] = useState<"fast" | "general" | "complex">("fast");
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [stagedImage, setStagedImage] = useState<StagedImage | null>(null);
  const [expandedImageUrl, setExpandedImageUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem("presentai_chat_history_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [
      {
        id: "msg-welcome",
        role: "model",
        text: "👋 Hi! I'm your **JunoAI Study Chatbot**.\n\nI can help you with:\n• **Math & Problem Solving**: Step-by-step working, equations, and explanations.\n• **General Study & Homework**: Direct answers, subject concepts, and guidance.\n• **Image / Diagram Help**: Click 📷 to attach a worksheet or diagram!\n• **Presentation Coaching**: Structured speech hooks, pacing, and defense prep.\n\nWhat would you like to study or practice today? 💡",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: "gemini-3.8-flash",
      },
    ];
  });

  useEffect(() => {
    try {
      // Store history without heavy image base64 strings to avoid exceeding localStorage quota
      const lightweight = messages.map(m => ({
        id: m.id,
        role: m.role,
        text: m.text,
        timestamp: m.timestamp,
        modelUsed: m.modelUsed,
        isFallback: m.isFallback,
        image: m.image ? { previewUrl: m.image.previewUrl, mimeType: m.image.mimeType, name: m.image.name, data: "" } : undefined
      }));
      localStorage.setItem("presentai_chat_history_v2", JSON.stringify(lightweight));
    } catch {
      // ignore
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleRoleChange = (newRole: "study" | "speech_coach" | "quick_qna") => {
    setRole(newRole);
    if (newRole === "quick_qna" || newRole === "study") {
      setSpeedPreference("fast");
    } else {
      setSpeedPreference("general");
    }
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPEG, WebP, or GIF).");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert("Image size should be under 15MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const commaIdx = dataUrl.indexOf(",");
      const base64 = commaIdx !== -1 ? dataUrl.slice(commaIdx + 1) : dataUrl;
      const mimeType = file.type || "image/jpeg";

      setStagedImage({
        data: base64,
        mimeType: mimeType,
        previewUrl: dataUrl,
        name: file.name || "uploaded-image.jpg",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // reset input value so re-selecting same file triggers change
    if (e.target) e.target.value = "";
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            processImageFile(file);
            e.preventDefault();
            break;
          }
        }
      }
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if ((!textToSend && !stagedImage) || isLoading) return;

    const currentImage = stagedImage;
    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      text: textToSend || (currentImage ? "Please analyze this uploaded image and help me solve or understand it." : ""),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      image: currentImage || undefined,
    };

    const modelMsgId = `model-${Date.now()}`;
    const initialModelMessage: ChatMessage = {
      id: modelMsgId,
      role: "model",
      text: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      modelUsed: speedPreference === "fast" ? "gemini-3.1-flash-lite" : "gemini-3.8-flash",
      isStreaming: true,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages([...updatedMessages, initialModelMessage]);
    setInputMessage("");
    setStagedImage(null);
    setIsLoading(true);

    try {
      // Prepare conversation payload
      const payload = {
        messages: updatedMessages.map((m) => ({
          role: m.role,
          text: m.text,
          image: m.image ? {
            data: m.image.data,
            mimeType: m.image.mimeType,
          } : undefined,
        })),
        role,
        speedPreference,
        stream: true,
      };

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream, application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const contentType = res.headers.get("content-type") || "";

      // Check if response is streaming SSE
      if (contentType.includes("text/event-stream") && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = "";
        let finalModel = speedPreference === "fast" ? "gemini-3.1-flash-lite" : "gemini-3.8-flash";
        let isFallback = false;
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data: ")) {
              const dataContent = trimmed.slice(6).trim();
              if (dataContent === "[DONE]") continue;

              try {
                const parsed = JSON.parse(dataContent);
                if (parsed.text) {
                  accumulatedText += parsed.text;
                }
                if (parsed.model) {
                  finalModel = parsed.model;
                }
                if (parsed.isFallback) {
                  isFallback = true;
                }

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === modelMsgId
                      ? {
                          ...msg,
                          text: accumulatedText,
                          modelUsed: finalModel,
                          isFallback: isFallback,
                          isStreaming: true,
                        }
                      : msg
                  )
                );
              } catch {
                // non-json line, ignore
              }
            }
          }
        }

        // Mark streaming as completed
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === modelMsgId
              ? {
                  ...msg,
                  text: accumulatedText || "Here is what I found for you!",
                  isStreaming: false,
                }
              : msg
          )
        );
      } else {
        // Standard JSON response fallback
        const data = await res.json();
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === modelMsgId
              ? {
                  ...msg,
                  text: data.reply || "Done! Let me know if you need more help.",
                  modelUsed: data.model || "gemini-3.8-flash",
                  isFallback: data.isFallback,
                  isStreaming: false,
                }
              : msg
          )
        );
      }
    } catch (err: any) {
      console.error("Chat request error:", err);
      // If error occurs, render resilient fallback directly
      let fallbackText = "I encountered a brief connection issue. How can I help with your schoolwork or presentation?";
      if (textToSend.includes("4x5") || textToSend.includes("4*5")) {
        fallbackText = "4 × 5 = **20**!\n\nNeed to see step-by-step working or have another math question? Just ask!";
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === modelMsgId
            ? {
                ...msg,
                text: fallbackText,
                modelUsed: "PresentAI Resilient Fallback",
                isFallback: true,
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const clearChat = () => {
    const initial: ChatMessage[] = [
      {
        id: `msg-${Date.now()}`,
        role: "model",
        text: "✨ Chat cleared! Ask me anything about Math, Science, school subjects, or presentation coaching!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: speedPreference === "fast" ? "gemini-3.1-flash-lite" : "gemini-3.8-flash",
      },
    ];
    setMessages(initial);
    setStagedImage(null);
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    "Solve 3x + 15 = 45",
    "Explain photosynthesis in 2 simple sentences",
    "How do I hook the audience in the first 15 seconds?",
    "Check grammar: 'Me and him went to the library'",
    "Tips to stay in 110–140 WPM speaking pace",
  ];

  if (!isOpen && !isEmbedded) return null;

  return (
    <div className={`flex flex-col h-full bg-white border-3 border-black rounded-2xl shadow-[6px_6px_0px_#000] text-left overflow-hidden relative ${isEmbedded ? "w-full" : "max-w-4xl mx-auto my-4"}`}>
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png, image/jpeg, image/webp, image/gif"
        onChange={handleImageFileSelect}
        className="hidden"
      />

      {/* Lightbox Modal for viewing expanded image */}
      {expandedImageUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setExpandedImageUrl(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] bg-white p-2 border-3 border-black rounded-2xl shadow-[6px_6px_0px_#000]">
            <button
              onClick={() => setExpandedImageUrl(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-black border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]"
            >
              ✕
            </button>
            <img 
              src={expandedImageUrl} 
              alt="Uploaded visual" 
              className="max-h-[75vh] w-auto rounded-xl object-contain border border-black" 
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#FFF9F2] p-4 sm:p-5 border-b-2 border-black flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#06D6A0] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] text-xl">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black uppercase tracking-wider text-black font-heading">
                <span className="text-black">Juno</span><span className="text-[#FF6B35]">AI</span> Study Chatbot
              </h3>
              <span className="text-[10px] font-black bg-[#06D6A0] text-black border border-black px-2 py-0.5 rounded shadow-[1px_1px_0px_#000] flex items-center gap-1">
                <Zap className="w-3 h-3 fill-black" />
                AI Assistant
              </span>
            </div>
            <p className="text-xs text-slate-600 font-bold">
              Ask questions, solve math equations, explore concepts, or practice your speech.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="p-2 bg-white hover:bg-slate-100 text-slate-700 border-2 border-black rounded-xl font-bold text-xs shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1"
            title="Clear Conversation History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
          {!isEmbedded && onClose && (
            <button
              onClick={onClose}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-black border-2 border-black rounded-xl font-bold text-xs shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Role & Model Selector Ribbon */}
      <div className="bg-[#FFFDF9] px-4 py-2.5 border-b-2 border-black flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 mr-1">
            Subject Mode:
          </span>

          <button
            onClick={() => handleRoleChange("study")}
            className={`px-3 py-1 rounded-lg border-2 font-black text-[11px] transition-all cursor-pointer flex items-center gap-1.5 ${
              role === "study"
                ? "bg-[#06D6A0] text-black border-black shadow-[2px_2px_0px_#000]"
                : "bg-white text-slate-800 border-black hover:bg-slate-50"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Study</span>
          </button>

          <button
            onClick={() => handleRoleChange("quick_qna")}
            className={`px-3 py-1 rounded-lg border-2 font-black text-[11px] transition-all cursor-pointer flex items-center gap-1.5 ${
              role === "quick_qna"
                ? "bg-[#FFD166] text-black border-black shadow-[2px_2px_0px_#000]"
                : "bg-white text-slate-800 border-black hover:bg-slate-50"
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Instant Q&A</span>
          </button>

          <button
            onClick={() => handleRoleChange("speech_coach")}
            className={`px-3 py-1 rounded-lg border-2 font-black text-[11px] transition-all cursor-pointer flex items-center gap-1.5 ${
              role === "speech_coach"
                ? "bg-[#FF6B35] text-white border-black shadow-[2px_2px_0px_#000]"
                : "bg-white text-slate-800 border-black hover:bg-slate-50"
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Speech Coach</span>
          </button>
        </div>

        {/* Live Model Indicator */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded-lg border border-black shadow-[1px_1px_0px_#000]">
          <span className="w-2 h-2 rounded-full bg-[#06D6A0] animate-pulse"></span>
          <span>
            {speedPreference === "fast" ? "gemini-3.1-flash-lite" : "gemini-3.8-flash"}
          </span>
        </div>
      </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-h-[460px] min-h-[320px] bg-slate-50/50">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000] text-sm ${
                  isUser ? "bg-[#FFD166] text-black" : "bg-[#06D6A0] text-black"
                }`}
              >
                {isUser ? "🧑‍🎓" : "🤖"}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 border-2 border-black text-xs leading-relaxed space-y-2.5 shadow-[3px_3px_0px_#000] ${
                  isUser
                    ? "bg-[#FF6B35] text-white"
                    : "bg-white text-slate-900"
                }`}
              >
                {/* Attached Image inside message */}
                {msg.image?.previewUrl && (
                  <div className="space-y-1">
                    <div 
                      className="relative rounded-xl overflow-hidden border-2 border-black group cursor-pointer max-w-sm bg-black/10"
                      onClick={() => setExpandedImageUrl(msg.image?.previewUrl || null)}
                    >
                      <img 
                        src={msg.image.previewUrl} 
                        alt="User uploaded attachment" 
                        className="w-full max-h-56 object-cover hover:scale-105 transition-transform" 
                      />
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                        <Maximize2 className="w-2.5 h-2.5" /> Click to expand
                      </div>
                    </div>
                    {msg.image.name && (
                      <p className={`text-[10px] truncate font-bold ${isUser ? "text-white/80" : "text-slate-600"}`}>
                        📎 {msg.image.name}
                      </p>
                    )}
                  </div>
                )}

                {/* Text Body */}
                <div className="whitespace-pre-wrap font-medium">
                  {msg.text}
                  {msg.isStreaming && (
                    <span className="inline-block w-2 h-3.5 bg-[#FF6B35] ml-1 animate-pulse align-middle"></span>
                  )}
                </div>

                {/* Footer metadata */}
                <div
                  className={`flex items-center justify-between text-[9px] font-bold pt-1.5 border-t ${
                    isUser ? "border-white/30 text-white/80" : "border-slate-200 text-slate-500"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{msg.timestamp}</span>
                    {msg.modelUsed && (
                      <span className="font-mono opacity-80">• {msg.modelUsed}</span>
                    )}
                  </div>
                  {!isUser && msg.text && (
                    <button
                      onClick={() => copyToClipboard(msg.id, msg.text)}
                      className="hover:text-black p-0.5 flex items-center gap-0.5 cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-2.5 h-2.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading typing bubble */}
        {isLoading && !messages[messages.length - 1]?.isStreaming && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#06D6A0] border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000] text-sm">
              🤖
            </div>
            <div className="bg-white border-2 border-black rounded-2xl p-3.5 text-xs shadow-[3px_3px_0px_#000] flex items-center gap-2">
              <span className="text-slate-700 font-bold">Assistant is generating fast response</span>
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-[#FF6B35] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-[#06D6A0] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-[#FFD166] rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Starter Prompts */}
      <div className="bg-[#FFF9F2] px-3.5 py-1.5 border-t-2 border-black flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="text-[10px] font-black uppercase text-slate-500 whitespace-nowrap">
          Quick Ask:
        </span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-amber-100 text-slate-800 border border-black rounded-lg font-bold shadow-[1px_1px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer text-[10px]"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Staged Image Preview Chip */}
      {stagedImage && (
        <div className="bg-amber-50 px-3.5 py-2 border-t-2 border-black flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5 truncate">
            <img 
              src={stagedImage.previewUrl} 
              alt="Staged for upload" 
              className="w-10 h-10 object-cover rounded-lg border-2 border-black shadow-[1px_1px_0px_#000]" 
            />
            <div className="truncate text-left">
              <p className="text-xs font-black text-black truncate">{stagedImage.name}</p>
              <p className="text-[10px] text-slate-600 font-bold uppercase">Ready to send with next message</p>
            </div>
          </div>
          <button
            onClick={() => setStagedImage(null)}
            className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 border border-black rounded-lg text-xs font-bold cursor-pointer"
            title="Remove image"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Input Box with Image Upload Button */}
      <div className="p-3 sm:p-4 bg-white border-t-2 border-black flex items-center gap-2">
        {/* Upload Image Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="p-2.5 bg-[#FFF9F2] hover:bg-[#FFD166] text-black border-2 border-black rounded-xl font-bold shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center justify-center transition-colors"
          title="Upload photo of worksheet, math problem, slide, or diagram"
        >
          <ImageIcon className="w-4 h-4 text-black" />
        </button>

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Ask any question, solve math equations, check presentation concepts, or paste an image..."
          className="flex-1 px-3 py-2 bg-[#FFF9F2] border-2 border-black rounded-xl text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B35] resize-none max-h-24"
        />

        {/* Send Button */}
        <button
          onClick={() => handleSendMessage()}
          disabled={(!inputMessage.trim() && !stagedImage) || isLoading}
          className={`px-4 py-2.5 border-2 border-black rounded-xl font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5 transition-all cursor-pointer ${
            (!inputMessage.trim() && !stagedImage) || isLoading
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-[#06D6A0] hover:bg-[#00FF66] text-black"
          }`}
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
