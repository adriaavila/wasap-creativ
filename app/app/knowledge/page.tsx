"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function KnowledgePage() {
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  // const docs = useQuery(api.knowledge.listKnowledgeDocs, { search }) ?? [];
  // const create = useMutation(api.knowledge.createKnowledgeDoc);

  const docs = [
    { _id: "d1", title: "Return Policy", body: "Items can be returned within 30 days." },
    { _id: "d2", title: "Shipping Rates", body: "Standard shipping is $5 or free over $50." },
  ];
  const create = (args: any) => { };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <Input placeholder="Search docs" value={search} onChange={(e) => setSearch(e.target.value)} />
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h2 className="mb-3 font-semibold">Knowledge Docs</h2>
          <div className="space-y-2">
            {docs.map((doc) => (
              <div key={doc._id} className="rounded-md border border-border p-3">
                <p className="font-medium">{doc.title}</p>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{doc.body}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <h2 className="mb-3 font-semibold">Create Doc</h2>
          <div className="space-y-3">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Body" />
            <Button onClick={() => create({ title, body, tags: [] })}>Save</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
