import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Fetch the blog post by slug
  const post = useQuery(api.blogs.getBlogBySlug, slug ? { slug } : "skip");

  if (post === undefined) {
    return (
      <div className="container py-24 text-center">
        <p className="text-muted-foreground">Loading blog post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container py-24 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Post Not Found
        </h1>
        <p className="text-muted-foreground mb-8">
          The blog post you're looking for doesn't exist.
        </p>
        <Link to="/blog" className="btn btn-green px-8 py-4">
          Back to Blog
        </Link>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Split content into paragraphs if it's a string
  const contentParagraphs =
    typeof post.content === "string"
      ? post.content.split("\n").filter((p: string) => p.trim())
      : Array.isArray(post.content)
        ? post.content
        : [post.content];

  return (
    <>
      {/* Hero Image */}
      <section className="w-full">
        <img
          src={post.featured_image || "/assets/images/blog-placeholder.jpg"}
          alt={post.title}
          className="w-full h-[300px] md:h-[400px] lg:h-[500px] object-cover"
        />
      </section>

      {/* Title & Meta */}
      <section className="py-8 lg:py-12">
        <div className="container max-w-4xl">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-3 text-muted-foreground">
            <span>{post.author_name || "Oluwatoyin Omotayo"}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <time>{formatDate(post.published_at || post.created_at)}</time>
          </div>
        </div>
      </section>

      {/* Article Body */}
      <article className="pb-16 lg:pb-24">
        <div className="container max-w-4xl">
          <div className="prose prose-lg max-w-none">
            {contentParagraphs.map((paragraph: string, index: number) => (
              <p
                key={index}
                className="text-muted-foreground leading-relaxed mb-6"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Navigation */}
          <nav className="flex justify-between items-center pt-12 mt-12 border-t border-border">
            <Link
              to="/blog"
              className="flex items-center gap-2 text-lg font-medium text-foreground hover:text-green transition-colors"
            >
              <span className="text-2xl">‹</span>
              <span>Back to Blog</span>
            </Link>
          </nav>
        </div>
      </article>
    </>
  );
};

export default BlogPost;
