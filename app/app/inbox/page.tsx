"use client";

import { useState } from "react";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function InboxPage() {
  const [search, setSearch] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  // const conversations = useQuery(api.inbox.listConversations, { search, filters: {} }) ?? [];
  // const selectedId = selectedConversationId ?? conversations[0]?._id ?? null;
  // const messages = usePaginatedQuery(
  //   api.inbox.listMessages,
  //   selectedId ? { conversationId: selectedId as never } : "skip",
  //   { initialNumItems: 30 },
  // );
  // const send = useMutation(api.inbox.sendOperatorMessage);

  const conversations = [
    { _id: "c1", contactName: "Alice", unreadCount: 2, lastMessageAt: Date.now() },
    { _id: "c2", contactName: "Bob", unreadCount: 0, lastMessageAt: Date.now() - 3600000 },
  ];
  const selectedId = selectedConversationId ?? conversations[0]?._id ?? null;
  const messages = {
    results: [
      { _id: "m1", role: "user", content: "Hello!" },
      { _id: "m2", role: "assistant", content: "Hi there! How can I help?" },
    ],
    status: "CanLoadMore",
    loadMore: () => { },
  };
  const send = (args: any) => Promise.resolve(null);

  return (
    <div className="grid min-h-[70vh] gap-4 lg:grid-cols-[320px_1fr_300px]">
      <Card className="p-3">
        <Input placeholder="Search conversations" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="mt-3 space-y-2">
          {conversations.map((conv) => (
            <button
              key={conv._id}
              onClick={() => setSelectedConversationId(conv._id)}
              className="w-full rounded-md border border-border p-3 text-left hover:bg-muted/60"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium">{conv.contactName}</p>
                {conv.unreadCount > 0 ? <Badge>{conv.unreadCount}</Badge> : null}
              </div>
              <p className="text-xs text-muted-foreground">{new Date(conv.lastMessageAt).toLocaleTimeString()}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col">
        <div className="border-b border-border p-4">{selectedId ? "Live conversation" : "Select a conversation"}</div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.results?.map((m) => (
            <div key={m._id} className={m.role === "user" ? "text-left" : "text-right"}>
              <div className="inline-block max-w-[80%] rounded-xl bg-muted px-3 py-2 text-sm">{m.content}</div>
            </div>
          ))}
        </div>
        <div className="border-t border-border p-4">
          <Textarea placeholder="Type a message" value={draft} onChange={(e) => setDraft(e.target.value)} />
          <div className="mt-2 flex justify-end">
            <Button
              onClick={async () => {
                if (!selectedId || !draft.trim()) return;
                await send({ conversationId: selectedId as never, content: draft.trim() });
                setDraft("");
              }}
            >
              Send
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-medium">Internal notes & labels</h3>
        <p className="mt-2 text-sm text-muted-foreground">Manage internal-only notes, labels, and contact details in this panel.</p>
      </Card>
    </div>
  );
}
