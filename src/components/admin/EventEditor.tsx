import React, { useState } from "react";

interface EventEditorProps {
  onSave: (data: EventFormData, status: "draft" | "published") => void;
  initialData?: EventFormData;
}

export interface EventFormData {
  title: string;
  subHeading: string;
  date: string;
  time: string;
  location?: string;
  description?: string;
}

const EventEditor: React.FC<EventEditorProps> = ({ onSave, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [subHeading, setSubHeading] = useState(initialData?.subHeading || "");
  const [date, setDate] = useState(initialData?.date || "");
  const [time, setTime] = useState(initialData?.time || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (status: "draft" | "published") => {
    setIsSaving(true);
    try {
      await onSave(
        { title, subHeading, date, time, location, description },
        status
      );
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6 lg:p-8 min-h-[calc(100vh-48px)] bg-background">
      {/* Main Form */}
      <div className="flex-1 bg-white rounded-lg shadow-sm p-4 md:p-6 overflow-y-auto max-h-[calc(100vh-80px)]">
        <div className="space-y-6">
          {/* Event Title/Theme */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Event Title/Theme
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter Title Here"
              className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
            />
          </div>

          {/* Sub Heading */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Sub Heading
            </label>
            <input
              type="text"
              value={subHeading}
              onChange={(e) => setSubHeading(e.target.value)}
              placeholder="Enter Sub Heading Here"
              className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter Location Here"
              className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
            />
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter Event Description Here"
              className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy min-h-[200px] resize-none"
            />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-[300px] flex flex-col gap-4 max-h-[calc(100vh-80px)] overflow-y-auto">
        {/* Event Summary */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Event Summary
          </h3>
          <div className="space-y-3 text-xs md:text-sm">
            <div>
              <span className="text-xs text-muted-foreground">Title:</span>
              <p className="text-xs md:text-sm font-medium text-foreground mt-1 line-clamp-2">
                {title || "No title set"}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Date:</span>
              <p className="text-xs md:text-sm font-medium text-foreground mt-1">
                {formatDate(date) || "No date set"}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Time:</span>
              <p className="text-xs md:text-sm font-medium text-foreground mt-1">
                {time || "No time set"}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Location:</span>
              <p className="text-xs md:text-sm font-medium text-foreground mt-1 line-clamp-2">
                {location || "No location set"}
              </p>
            </div>
          </div>
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

        {/* Information Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-xs font-semibold text-navy mb-2">
            Event Information
          </h4>
          <ul className="text-xs text-muted-foreground space-y-2">
            <li>✓ Event will be displayed publicly</li>
            <li>✓ People can register to attend</li>
            <li>✓ Changes can be updated anytime</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 sticky bottom-0 bg-background p-4 rounded-lg shadow-sm">
          <button
            onClick={() => handleSubmit("draft")}
            disabled={isSaving || !title}
            className="flex-1 px-4 md:px-6 py-2 md:py-3 bg-[#4a4a4a] text-white text-sm md:text-base font-medium rounded-md hover:bg-[#3a3a3a] transition-colors disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => handleSubmit("published")}
            disabled={isSaving || !title}
            className="flex-1 px-4 md:px-6 py-2 md:py-3 bg-green text-white text-sm md:text-base font-medium rounded-md hover:bg-green-dark transition-colors disabled:opacity-50"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventEditor;
