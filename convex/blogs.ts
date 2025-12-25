import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new blog post (admin only)
export const createBlog = mutation({
  args: {
    admin_email: v.string(),
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(),
    featured_image: v.optional(v.string()),
    tags: v.array(v.string()),
    status: v.union(v.literal("draft"), v.literal("published")),
    author_name: v.optional(v.string()),
    publish_date: v.optional(v.number()),
  },
  async handler(ctx, args) {
    // Verify admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.admin_email))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Only admins can create blogs");
    }

    // Check for duplicate slug
    const existing = await ctx.db
      .query("blogs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      throw new Error("A blog with this slug already exists");
    }

    const blogId = await ctx.db.insert("blogs", {
      title: args.title,
      slug: args.slug,
      excerpt: args.excerpt,
      content: args.content,
      author_id: user._id,
      featured_image: args.featured_image,
      featured_image_storage_id: undefined,
      tags: args.tags,
      status: args.status,
      published_at: args.status === "published" ? (args.publish_date || Date.now()) : undefined,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    return await ctx.db.get(blogId);
  },
});

// Update blog post (admin only)
export const updateBlog = mutation({
  args: {
    admin_email: v.string(),
    blog_id: v.id("blogs"),
    title: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    featured_image: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
  },
  async handler(ctx, args) {
    // Verify admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.admin_email))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Only admins can update blogs");
    }

    const blog = await ctx.db.get(args.blog_id);
    if (!blog) {
      throw new Error("Blog not found");
    }

    const updates: any = {
      updated_at: Date.now(),
    };

    if (args.title !== undefined) updates.title = args.title;
    if (args.excerpt !== undefined) updates.excerpt = args.excerpt;
    if (args.content !== undefined) updates.content = args.content;
    if (args.featured_image !== undefined) updates.featured_image = args.featured_image;
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.status !== undefined) {
      updates.status = args.status;
      if (args.status === "published" && !blog.published_at) {
        updates.published_at = Date.now();
      }
    }

    await ctx.db.patch(args.blog_id, updates);
    return await ctx.db.get(args.blog_id);
  },
});

// Delete blog post (admin only)
export const deleteBlog = mutation({
  args: {
    admin_email: v.string(),
    blog_id: v.id("blogs"),
  },
  async handler(ctx, args) {
    // Verify admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.admin_email))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Only admins can delete blogs");
    }

    const blog = await ctx.db.get(args.blog_id);
    if (!blog) {
      throw new Error("Blog not found");
    }

    await ctx.db.delete(args.blog_id);
    return { success: true, deletedId: args.blog_id };
  },
});

// Get all published blogs (public)
export const getPublishedBlogs = query({
  async handler(ctx) {
    const blogs = await ctx.db
      .query("blogs")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .collect();
    
    // Enrich blogs with author information
    const enrichedBlogs = await Promise.all(
      blogs.map(async (blog) => {
        const author = await ctx.db.get(blog.author_id);
        return {
          ...blog,
          author_name: author?.name || "Unknown Author",
        };
      })
    );
    
    return enrichedBlogs;
  },
});

// Get blog by slug (public)
export const getBlogBySlug = query({
  args: { slug: v.string() },
  async handler(ctx, args) {
    const blog = await ctx.db
      .query("blogs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    
    if (!blog) return null;
    
    const author = await ctx.db.get(blog.author_id);
    return {
      ...blog,
      author_name: author?.name || "Unknown Author",
    };
  },
});

// Get all blogs (admin only)
export const getAllBlogs = query({
  args: { admin_email: v.string() },
  async handler(ctx, args) {
    // Verify admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.admin_email))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Only admins can view all blogs");
    }

    return await ctx.db.query("blogs").order("desc").collect();
  },
});

// Get blogs by author (admin only)
export const getBlogsByAuthor = query({
  args: { admin_email: v.string(), author_id: v.id("users") },
  async handler(ctx, args) {
    // Verify admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.admin_email))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Only admins can filter blogs by author");
    }

    return await ctx.db
      .query("blogs")
      .withIndex("by_author", (q) => q.eq("author_id", args.author_id))
      .order("desc")
      .collect();
  },
});
