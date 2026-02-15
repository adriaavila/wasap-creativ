"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AgentsPage() {
  const agents = useQuery(api.agents.listAgents, {}) ?? [];
  const createAgent = useMutation(api.agents.createAgent);
  const setActive = useMutation(api.agents.setActiveAgent);
  const [name, setName] = useState("Support Agent");
  const [prompt, setPrompt] = useState("You are helpful and concise.");

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <Card className="p-4">
        <h1 className="mb-4 text-lg font-semibold">Agents</h1>
        <div className="space-y-2">
          {agents.map((agent) => (
            <div key={agent._id} className="rounded-md border border-border p-3">
              <div className="flex items-center justify-between">
                <p>{agent.name}</p>
                <Button variant="outline" onClick={() => setActive({ agentId: agent._id })}>
                  {agent.isActive ? "Active" : "Set Active"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-4">
        <h2 className="text-lg font-semibold">Create Agent</h2>
        <div className="mt-4 space-y-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Agent name" />
          <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Stored prompt" />
          <Button
            onClick={() =>
              createAgent({ name, model: "gpt-4o-mini", maxTokens: 500, temperature: 0.4, systemPromptMode: "stored", systemPromptStored: prompt })
            }
          >
            Save Agent
          </Button>
        </div>
      </Card>
    </div>
  );
}
