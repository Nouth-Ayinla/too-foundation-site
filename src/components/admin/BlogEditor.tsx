import React, { useState, useRef } from "react";
import { sanitizeHtml } from "../../lib/sanitize";

interface BlogEditorProps {
  onSave: (data: BlogFormData, status: "draft" | "published") => void;
  onDelete?: () => void;
  initialData?: BlogFormData;
  authorName?: string;
  isEditing?: boolean;
}

export interface BlogFormData {
  title: string;
  content: string;
  coverImage: string | null;
  author?: string;
  publishDate?: string;
}

const BlogEditor: React.FC<BlogEditorProps> = ({
  onSave,
  onDelete,
  initialData,
  authorName = "Oluwatoyin Omotayo",
  isEditing = false,
}) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [coverImage, setCoverImage] = useState<string | null>(
    initialData?.coverImage || null
  );
  const [author, setAuthor] = useState(initialData?.author || authorName);
  const [publishDate, setPublishDate] = useState(
    initialData?.publishDate || new Date().toISOString().split("T")[0]
  );
  const [isSaving, setIsSaving] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFormat = (command: "bold" | "italic") => {
    document.execCommand(command, false);
    contentRef.current?.focus();
  };

  const handleContentChange = () => {
    if (contentRef.current) {
      // Sanitize the HTML content before storing
      const sanitized = sanitizeHtml(contentRef.current.innerHTML);
      setContent(sanitized);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (status: "draft" | "published") => {
    setIsSaving(true);
    try {
      await onSave({ title, content, coverImage, author, publishDate }, status);
    } finally {
      setIsSaving(false);
    }
  };

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6 lg:p-8 min-h-[calc(100vh-48px)] bg-background">
      {/* Main Editor */}
      <div className="flex-1 bg-white rounded-lg shadow-sm p-4 md:p-6 overflow-y-auto max-h-[calc(100vh-80px)]">
        {/* Title */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-foreground mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter Title Here"
            className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
          />
        </div>

        {/* Article Body */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Article Body
          </label>
          <div className="border border-border rounded-md overflow-hidden">
            {/* Toolbar */}
            <div className="flex gap-2 p-3 border-b border-border bg-muted/30">
              <button
                type="button"
                onClick={() => handleFormat("bold")}
                className="w-8 h-8 flex items-center justify-center font-bold text-foreground hover:bg-muted rounded"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => handleFormat("italic")}
                className="w-8 h-8 flex items-center justify-center italic text-foreground hover:bg-muted rounded"
              >
                I
              </button>
            </div>
            {/* Content Area */}
            <div
              ref={contentRef}
              contentEditable
              onInput={handleContentChange}
              className="min-h-[300px] md:min-h-[400px] p-4 focus:outline-none text-sm md:text-base overflow-y-auto max-h-[500px]"
              dangerouslySetInnerHTML={{ __html: content }}
              data-placeholder="Enter Title Here"
            />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-[300px] flex flex-col gap-4 max-h-[calc(100vh-80px)] overflow-y-auto">
        {/* Cover Image Upload */}
        <div
          className="bg-white rounded-lg shadow-sm p-4 aspect-square lg:aspect-auto flex items-center justify-center cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {coverImage ? (
            <img
              src={coverImage}
              alt="Cover"
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <span className="text-4xl text-muted-foreground/50">+</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
        <p className="text-xs md:text-sm font-medium text-foreground text-center">
          Upload Cover Image Here
        </p>

        {/* Author Input */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <label className="block text-xs font-semibold text-foreground mb-2">
            Author Name
          </label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author name"
            className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
          />
        </div>

        {/* Date Input */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <label className="block text-xs font-semibold text-foreground mb-2">
            Publish Date
          </label>
          <input
            type="text"
            value={publishDate}
            onChange={(e) => setPublishDate(e.target.value)}
            placeholder="e.g. January 15, 2025"
            className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
          />
        </div>

        {/* Live Preview */}
        <div className="bg-white rounded-lg shadow-sm">
          <button className="w-full flex items-center justify-between px-4 py-3 text-xs md:text-sm font-medium text-foreground hover:bg-muted/30 transition-colors">
            <span className="flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              Live Preview
            </span>
            <span>→</span>
          </button>
        </div>

        {/* Meta Info */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-xs md:text-sm">
          <div>
            <span className="text-xs text-muted-foreground">Author:</span>
            <span className="text-xs md:text-sm font-medium text-foreground ml-1">
              {author || "No author set"}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Post Date:</span>
            <span className="text-xs md:text-sm font-medium text-foreground ml-1">
              {new Date(publishDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 sticky bottom-0 bg-background p-4 rounded-lg shadow-sm">
          <button
            onClick={() => handleSubmit("draft")}
            disabled={isSaving || !title}
            className="flex-1 px-4 md:px-6 py-2 md:py-3 bg-[#4a4a4a] text-white text-sm md:text-base font-medium rounded-md hover:bg-[#3a3a3a] transition-colors disabled:opacity-50"
          >
            {isEditing ? "Update" : "Save"}
          </button>
          <button
            onClick={() => handleSubmit("published")}
            disabled={isSaving || !title}
            className="flex-1 px-4 md:px-6 py-2 md:py-3 bg-green text-white text-sm md:text-base font-medium rounded-md hover:bg-green-dark transition-colors disabled:opacity-50"
          >
            {isEditing ? "Update & Publish" : "Publish"}
          </button>
          {isEditing && onDelete && (
            <button
              onClick={onDelete}
              disabled={isSaving}
              className="px-4 md:px-6 py-2 md:py-3 bg-red-600 text-white text-sm md:text-base font-medium rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              title="Delete this blog post"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
