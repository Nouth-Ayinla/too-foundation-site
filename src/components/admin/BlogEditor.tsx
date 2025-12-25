import React, { useState, useRef } from 'react';

interface BlogEditorProps {
  onSave: (data: BlogFormData, status: 'draft' | 'published') => void;
  initialData?: BlogFormData;
  authorName?: string;
}

export interface BlogFormData {
  title: string;
  content: string;
  coverImage: string | null;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ onSave, initialData, authorName = 'Oluwatoyin Omotayo' }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [coverImage, setCoverImage] = useState<string | null>(initialData?.coverImage || null);
  const [isSaving, setIsSaving] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFormat = (command: 'bold' | 'italic') => {
    document.execCommand(command, false);
    contentRef.current?.focus();
  };

  const handleContentChange = () => {
    if (contentRef.current) {
      setContent(contentRef.current.innerHTML);
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

  const handleSubmit = async (status: 'draft' | 'published') => {
    setIsSaving(true);
    try {
      await onSave({ title, content, coverImage }, status);
    } finally {
      setIsSaving(false);
    }
  };

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex gap-6 p-8 min-h-[calc(100vh-48px)]">
      {/* Main Editor */}
      <div className="flex-1 bg-white rounded-lg shadow-sm p-8">
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
                onClick={() => handleFormat('bold')}
                className="w-8 h-8 flex items-center justify-center font-bold text-foreground hover:bg-muted rounded"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => handleFormat('italic')}
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
              className="min-h-[400px] p-4 focus:outline-none"
              dangerouslySetInnerHTML={{ __html: content }}
              data-placeholder="Enter Title Here"
            />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-[280px] flex flex-col gap-4">
        {/* Cover Image Upload */}
        <div 
          className="bg-white rounded-lg shadow-sm p-6 aspect-square flex items-center justify-center cursor-pointer hover:bg-muted/30 transition-colors"
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
        <p className="text-sm font-medium text-foreground text-center">
          Upload Cover Image Here
        </p>

        {/* Live Preview */}
        <div className="bg-white rounded-lg shadow-sm">
          <button className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/30 transition-colors">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Live Preview
            </span>
            <span>→</span>
          </button>
        </div>

        {/* Meta Info */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div>
            <span className="text-xs text-muted-foreground">Author:</span>
            <span className="text-sm font-medium text-foreground ml-1">{authorName}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Post Date:</span>
            <span className="text-sm font-medium text-foreground ml-1">{today}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => handleSubmit('draft')}
            disabled={isSaving || !title}
            className="flex-1 px-6 py-3 bg-[#4a4a4a] text-white font-medium rounded-md hover:bg-[#3a3a3a] transition-colors disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => handleSubmit('published')}
            disabled={isSaving || !title}
            className="flex-1 px-6 py-3 bg-green text-white font-medium rounded-md hover:bg-green-dark transition-colors disabled:opacity-50"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
