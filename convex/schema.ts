import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  organizations: defineTable({
    name: v.string(),
    createdAt: v.number(),
  }),
  memberships: defineTable({
    orgId: v.id("organizations"),
    userId: v.string(),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("agent")),
  })
    .index("by_org_user", ["orgId", "userId"])
    .index("by_user", ["userId"]),
  agents: defineTable({
    orgId: v.id("organizations"),
    name: v.string(),
    isActive: v.boolean(),
    systemPromptMode: v.union(v.literal("file"), v.literal("stored")),
    systemPromptStored: v.optional(v.string()),
    model: v.string(),
    temperature: v.number(),
    maxTokens: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_org", ["orgId"]),
  contacts: defineTable({
    orgId: v.id("organizations"),
    phoneNumber: v.string(),
    displayName: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_org_phone", ["orgId", "phoneNumber"]),
  conversations: defineTable({
    orgId: v.id("organizations"),
    contactId: v.id("contacts"),
    agentId: v.id("agents"),
    lastMessageAt: v.number(),
    unreadCount: v.number(),
    status: v.union(v.literal("open"), v.literal("pending"), v.literal("closed")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org_lastMessageAt", ["orgId", "lastMessageAt"])
    .index("by_org_contact", ["orgId", "contactId"]),
  messages: defineTable({
    orgId: v.id("organizations"),
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("operator"), v.literal("system")),
    content: v.string(),
    providerMessageId: v.optional(v.string()),
    direction: v.union(v.literal("inbound"), v.literal("outbound")),
    sendStatus: v.union(v.literal("received"), v.literal("generated"), v.literal("sent"), v.literal("failed")),
    createdAt: v.number(),
  }).index("by_org_conversation_createdAt", ["orgId", "conversationId", "createdAt"]),
  labels: defineTable({
    orgId: v.id("organizations"),
    name: v.string(),
    color: v.optional(v.string()),
  }).index("by_org", ["orgId"]),
  conversationLabels: defineTable({
    orgId: v.id("organizations"),
    conversationId: v.id("conversations"),
    labelId: v.id("labels"),
  })
    .index("by_org_conversation", ["orgId", "conversationId"])
    .index("by_org_conversation_label", ["orgId", "conversationId", "labelId"]),
  notes: defineTable({
    orgId: v.id("organizations"),
    conversationId: v.id("conversations"),
    authorUserId: v.string(),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_org_conversation", ["orgId", "conversationId"]),
  knowledgeDocs: defineTable({
    orgId: v.id("organizations"),
    title: v.string(),
    body: v.string(),
    tags: v.array(v.string()),
    updatedAt: v.number(),
  }).index("by_org", ["orgId"]),
  quickReplies: defineTable({
    orgId: v.id("organizations"),
    title: v.string(),
    body: v.string(),
    shortcut: v.optional(v.string()),
  }).index("by_org", ["orgId"]),
});
