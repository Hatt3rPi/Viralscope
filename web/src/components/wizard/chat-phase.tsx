"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";

interface ChatPhaseProps {
  messages: ChatMessage[];
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  onSendMessage: (text: string) => void;
  onGenerateParrilla: () => void;
  onContinueChat: () => void;
}

export function ChatPhase({
  messages,
  isLoading,
  isReady,
  error,
  onSendMessage,
  onGenerateParrilla,
  onContinueChat,
}: ChatPhaseProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isLoading) inputRef.current?.focus();
  }, [isLoading]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
  }

  function handleQuickResponse(text: string) {
    if (isLoading) return;
    onSendMessage(text);
  }

  // Get quick responses from the last assistant message
  const lastAssistantMsg = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");
  const quickResponses =
    !isReady && !isLoading ? lastAssistantMsg?.quick_responses || [] : [];

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl border border-purple-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-purple-50 bg-purple-50/50">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-purple-900">Estratega</p>
          <p className="text-xs text-purple-600">
            Planificador estrategico de contenido
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3 max-w-[85%]",
              msg.role === "user" ? "ml-auto flex-row-reverse" : ""
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full mt-0.5",
                msg.role === "assistant"
                  ? "bg-purple-100"
                  : "bg-gray-100"
              )}
            >
              {msg.role === "assistant" ? (
                <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              ) : (
                <User className="h-3.5 w-3.5 text-gray-600" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={cn(
                "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                msg.role === "assistant"
                  ? "bg-gray-50 text-gray-800 rounded-tl-sm"
                  : "bg-purple-600 text-white rounded-tr-sm"
              )}
            >
              {msg.role === "assistant" ? (
                <div
                  className="prose prose-sm max-w-none [&_strong]:text-purple-700 [&_li]:my-0.5"
                  dangerouslySetInnerHTML={{
                    __html: simpleMarkdown(msg.content),
                  }}
                />
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-100 mt-0.5">
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-gray-50 px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0ms]" />
                <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce [animation-delay:150ms]" />
                <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Ready confirmation */}
        {isReady && !isLoading && (
          <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <p className="font-semibold text-purple-900">
                Tengo toda la informacion necesaria
              </p>
            </div>
            <p className="text-sm text-purple-700">
              Puedo generar la parrilla estrategica ahora, o podemos seguir conversando si quieres agregar mas detalles.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={onGenerateParrilla}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generar Parrilla
              </Button>
              <Button variant="outline" onClick={onContinueChat}>
                Seguir conversando
              </Button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick responses */}
      {quickResponses.length > 0 && (
        <div className="flex flex-wrap gap-2 px-5 py-2 border-t border-gray-50">
          {quickResponses.map((qr, i) => (
            <button
              key={i}
              onClick={() => handleQuickResponse(qr)}
              disabled={isLoading}
              className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-100 hover:border-purple-300 transition-colors disabled:opacity-50"
            >
              {qr}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50/50"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isReady
              ? "Agrega mas contexto o genera la parrilla..."
              : "Escribe tu respuesta..."
          }
          disabled={isLoading}
          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none disabled:opacity-50"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!input.trim() || isLoading}
          className="bg-purple-600 hover:bg-purple-700 h-9 w-9 p-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}

/** Minimal markdown: **bold**, *italic*, - lists, \n → <br> */
function simpleMarkdown(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*?<\/li>)/g, "<ul class='list-disc pl-4 my-1'>$1</ul>")
    .replace(/\n/g, "<br>");
}
