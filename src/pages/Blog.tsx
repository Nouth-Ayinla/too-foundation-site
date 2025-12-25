import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const Blog = () => {
  const [showAll, setShowAll] = useState(false);

  // Fetch published blogs from Convex
  const blogs = useQuery(api.blogs.getPublishedBlogs);

  if (!blogs) {
    return (
      <div className="container py-24 text-center">
        <p className="text-muted-foreground">Loading blogs...</p>
      </div>
    );
  }

  const blogPosts = blogs.map((blog: any) => ({
    slug: blog.slug,
    title: blog.title,
    image: blog.featured_image || "/assets/images/blog-placeholder.jpg",
    author: blog.author_name || "Oluwatoyin Omotayo",
    date: blog.published_at
      ? new Date(blog.published_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
    featured: blog.featured || false,
  }));

  const featuredPost = blogPosts.find((p) => p.featured);
  const regularPosts = blogPosts.filter((p) => !p.featured);
  const visiblePosts = showAll ? regularPosts : regularPosts.slice(0, 6);

  return (
    <>
      {/* Featured Post */}
      {featuredPost && (
        <section className="py-8 lg:py-12">
          <div className="container">
            <Link
              to={`/blog/${featuredPost.slug}`}
              className="block relative h-[400px] lg:h-[600px] rounded-2xl overflow-hidden group"
            >
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute left-8 lg:left-12 right-8 lg:right-12 bottom-8 lg:bottom-12 text-white">
                <h2 className="text-2xl lg:text-4xl font-bold leading-tight mb-4 max-w-3xl">
                  {featuredPost.title}
                </h2>
                <div className="flex items-center gap-3 text-white/90">
                  <span>{featuredPost.author}</span>
                  <span className="w-1 h-1 rounded-full bg-white/60" />
                  <time>{featuredPost.date}</time>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Blog List */}
      <section className="py-8 lg:py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visiblePosts.map((post) => (
              <article key={post.slug}>
                <Link to={`/blog/${post.slug}`} className="block group">
                  <div className="relative h-[200px] lg:h-[240px] rounded-xl overflow-hidden mb-4">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-foreground leading-tight mb-2 group-hover:text-green transition-colors line-clamp-3">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{post.author}</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/60" />
                    <time>{post.date}</time>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {/* Load More */}
          {regularPosts.length > 6 && (
            <div className="text-center mt-12">
              <button
                onClick={() => setShowAll(!showAll)}
                className="btn bg-foreground text-background px-8 py-4 text-lg hover:bg-foreground/80 transition-colors"
              >
                {showAll ? "Show Less" : "Load More"}
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Blog;
