import React, { useState, useRef } from "react";

interface EventEditorProps {
  onSave: (data: EventFormData, status: "draft" | "published") => void;
  onDelete?: () => void;
  initialData?: EventFormData;
  isEditing?: boolean;
}

export interface EventFormData {
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime?: string;
  location: string;
  capacity?: number;
  image: string | null;
}

const EventEditor: React.FC<EventEditorProps> = ({
  onSave,
  onDelete,
  initialData,
  isEditing = false,
}) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [startDate, setStartDate] = useState(initialData?.startDate || "");
  const [startTime, setStartTime] = useState(initialData?.startTime || "");
  const [endDate, setEndDate] = useState(initialData?.endDate || "");
  const [endTime, setEndTime] = useState(initialData?.endTime || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [capacity, setCapacity] = useState(
    initialData?.capacity?.toString() || ""
  );
  const [image, setImage] = useState<string | null>(initialData?.image || null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (status: "draft" | "published") => {
    setIsSaving(true);
    try {
      await onSave(
        {
          title,
          description,
          startDate,
          startTime,
          endDate,
          endTime,
          location,
          capacity: capacity ? parseInt(capacity) : undefined,
          image,
        },
        status
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6 lg:p-8 min-h-[calc(100vh-48px)] bg-background">
      {/* Main Editor */}
      <div className="flex-1 bg-white rounded-lg shadow-sm p-4 md:p-6 overflow-y-auto max-h-[calc(100vh-80px)]">
        {/* Title */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-foreground mb-2">
            Event Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter event title"
            className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-green/20 focus:border-green"
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-foreground mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter event description"
            rows={6}
            className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-green/20 focus:border-green resize-none"
          />
        </div>

        {/* Date & Time Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-green/20 focus:border-green"
            />
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-green/20 focus:border-green"
            />
          </div>
        </div>

        {/* End Date & Time Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* End Date */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              End Date (Optional)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-green/20 focus:border-green"
            />
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              End Time (Optional)
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-green/20 focus:border-green"
            />
          </div>
        </div>

        {/* Location */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-foreground mb-2">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter event location"
            className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-green/20 focus:border-green"
          />
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Capacity (Optional)
          </label>
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="Maximum attendees"
            min="1"
            className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-green/20 focus:border-green"
          />
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-[300px] flex flex-col gap-4 max-h-[calc(100vh-80px)] overflow-y-auto">
        {/* Event Image Upload */}
        <div
          className="bg-white rounded-lg shadow-sm p-4 aspect-square lg:aspect-auto flex items-center justify-center cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {image ? (
            <img
              src={image}
              alt="Event"
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
          Upload Event Image
        </p>

        {/* Event Details Summary */}
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
          <h3 className="font-semibold text-foreground text-sm">
            Event Details
          </h3>

          {title && (
            <div>
              <p className="text-xs text-muted-foreground">Title</p>
              <p className="text-sm font-medium text-foreground line-clamp-2">
                {title}
              </p>
            </div>
          )}

          {startDate && (
            <div>
              <p className="text-xs text-muted-foreground">Start Date/Time</p>
              <p className="text-sm font-medium text-foreground">
                {new Date(`${startDate}T${startTime}`).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }
                )}
                {startTime && ` at ${startTime}`}
              </p>
            </div>
          )}

          {location && (
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="text-sm font-medium text-foreground">{location}</p>
            </div>
          )}

          {capacity && (
            <div>
              <p className="text-xs text-muted-foreground">Capacity</p>
              <p className="text-sm font-medium text-foreground">
                {capacity} attendees
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 sticky bottom-0 bg-background p-4 rounded-lg shadow-sm">
          <button
            onClick={() => handleSubmit("draft")}
            disabled={isSaving || !title || !startDate || !location}
            className="flex-1 px-4 md:px-6 py-2 md:py-3 bg-[#4a4a4a] text-white text-sm md:text-base font-medium rounded-md hover:bg-[#3a3a3a] transition-colors disabled:opacity-50"
          >
            {isEditing ? "Update" : "Save"}
          </button>
          <button
            onClick={() => handleSubmit("published")}
            disabled={isSaving || !title || !startDate || !location}
            className="flex-1 px-4 md:px-6 py-2 md:py-3 bg-green text-white text-sm md:text-base font-medium rounded-md hover:bg-green-dark transition-colors disabled:opacity-50"
          >
            {isEditing ? "Update & Publish" : "Publish"}
          </button>
          {isEditing && onDelete && (
            <button
              onClick={onDelete}
              disabled={isSaving}
              className="px-4 md:px-6 py-2 md:py-3 bg-red-600 text-white text-sm md:text-base font-medium rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              title="Delete this event"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventEditor;
