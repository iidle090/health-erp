import React, { useState } from "react";
import { Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const conversations: {
  id: number; patient: string; initials: string;
  lastMessage: string; time: string; unread: number;
  messages: { from: string; text: string; time: string }[];
}[] = [];

export function DoctorMessages() {
  const [selected, setSelected] = useState<number>(1);
  const [input, setInput] = useState("");
  const [convs, setConvs] = useState(conversations);

  const currentConv = convs.find((c) => c.id === selected);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    setConvs((prev) =>
      prev.map((c) =>
        c.id === selected
          ? { ...c, messages: [...c.messages, { from: "doctor", text: input.trim(), time: now }], lastMessage: input.trim(), time: "just now" }
          : c
      )
    );
    setInput("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        <p className="text-sm text-muted-foreground mt-1">Patient communications</p>
      </div>

      <div className="flex h-[560px] gap-4">
        {/* Conversation list */}
        <div className="w-72 flex-shrink-0 rounded-xl border border-border bg-card shadow-sm overflow-y-auto">
          {convs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-16 px-4 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground/20 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No messages yet</p>
              <p className="text-xs text-muted-foreground mt-1">Patient conversations will appear here.</p>
            </div>
          )}
          {convs.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/40 transition-colors border-b border-border/30 last:border-0 ${selected === c.id ? "bg-[#fdf2f4] border-l-2 border-l-[#8B1A2F]" : ""}`}
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-sm font-semibold">
                {c.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground truncate">{c.patient}</p>
                  <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{c.time}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{c.lastMessage}</p>
              </div>
              {c.unread > 0 && (
                <span className="flex-shrink-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#8B1A2F] text-xs text-white font-bold">{c.unread}</span>
              )}
            </button>
          ))}
        </div>

        {/* Message thread */}
        {currentConv ? (
          <div className="flex-1 rounded-xl border border-border bg-card shadow-sm flex flex-col overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border/50 bg-muted/10">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                {currentConv.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{currentConv.patient}</p>
                <p className="text-xs text-muted-foreground">Patient</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {currentConv.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "doctor" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${msg.from === "doctor" ? "bg-[#8B1A2F] text-white rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"}`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.from === "doctor" ? "text-white/60" : "text-muted-foreground"}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={send} className="flex gap-3 px-5 py-4 border-t border-border/50 bg-background">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-full"
              />
              <Button type="submit" size="icon" className="rounded-full h-10 w-10 flex-shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}
