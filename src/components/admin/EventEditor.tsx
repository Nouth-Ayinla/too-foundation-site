import React, { useState } from 'react';

interface EventEditorProps {
  onSave: (data: EventFormData, status: 'draft' | 'published') => void;
  initialData?: EventFormData;
}

export interface EventFormData {
  title: string;
  subHeading: string;
  date: string;
  time: string;
}

const EventEditor: React.FC<EventEditorProps> = ({ onSave, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [subHeading, setSubHeading] = useState(initialData?.subHeading || '');
  const [date, setDate] = useState(initialData?.date || '');
  const [time, setTime] = useState(initialData?.time || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (status: 'draft' | 'published') => {
    setIsSaving(true);
    try {
      await onSave({ title, subHeading, date, time }, status);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-start justify-center p-8 min-h-[calc(100vh-48px)]">
      <div className="w-full max-w-2xl">
        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
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
              placeholder="Enter Title Here"
              className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="Enter Title Here"
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
              placeholder="Enter Title Here"
              className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => handleSubmit('draft')}
            disabled={isSaving || !title}
            className="px-12 py-3 bg-[#4a4a4a] text-white font-medium rounded-md hover:bg-[#3a3a3a] transition-colors disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => handleSubmit('published')}
            disabled={isSaving || !title}
            className="px-12 py-3 bg-green text-white font-medium rounded-md hover:bg-green-dark transition-colors disabled:opacity-50"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventEditor;
