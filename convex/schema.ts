import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table
  users: defineTable({
    email: v.string(),
    name: v.string(),
    password_hash: v.string(), // Hashed password
    role: v.union(v.literal("admin"), v.literal("user")), // admin or user
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"]),

  // Blogs table
  blogs: defineTable({
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(),
    author_id: v.id("users"),
    featured_image: v.optional(v.string()), // URL to image
    featured_image_storage_id: v.optional(v.string()), // Convex storage ID
    tags: v.array(v.string()),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
    published_at: v.optional(v.number()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_author", ["author_id"])
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),

  // Events table
  events: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    start_date: v.number(), // Unix timestamp
    end_date: v.optional(v.number()),
    location: v.string(),
    image: v.optional(v.string()),
    image_storage_id: v.optional(v.string()),
    capacity: v.optional(v.number()),
    registrations: v.number(), // count of registrations
    status: v.union(v.literal("upcoming"), v.literal("ongoing"), v.literal("completed"), v.literal("cancelled")),
    organizer_id: v.id("users"),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_organizer", ["organizer_id"])
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_start_date", ["start_date"]),

  // Gallery table
  gallery: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    images: v.array(
      v.object({
        url: v.string(),
        storage_id: v.optional(v.string()),
        alt_text: v.string(),
      })
    ),
    category: v.string(), // e.g., "impact", "events", "team"
    featured: v.boolean(),
    created_by: v.id("users"),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_created_by", ["created_by"]),

  // Event Registrations table
  event_registrations: defineTable({
    event_id: v.id("events"),
    user_email: v.string(),
    user_name: v.string(),
    phone: v.optional(v.string()),
    registered_at: v.number(),
  })
    .index("by_event", ["event_id"])
    .index("by_email", ["user_email"]),

  // Password Reset Tokens table
  password_reset_tokens: defineTable({
    email: v.string(),
    token: v.string(),
    expires_at: v.number(),
    used: v.boolean(),
    created_at: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_token", ["token"]),
});
