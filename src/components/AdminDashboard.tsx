import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import AdminSidebar from "./admin/AdminSidebar";
import BlogEditor, { BlogFormData } from "./admin/BlogEditor";
import EventEditor, { EventFormData } from "./admin/EventEditor";
import UserManager from "./admin/UserManager";

interface AdminDashboardProps {
  userEmail: string;
}

type DashboardTab = "blogs" | "events" | "users";

const AdminDashboard: React.FC<AdminDashboardProps> = ({ userEmail }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DashboardTab>("blogs");
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Queries
  const users = useQuery(api.auth.listAllUsers, { admin_email: userEmail });
  const blogs = useQuery(api.blogs.getAllBlogs, { admin_email: userEmail });
  const events = useQuery(api.events.getAllEvents, { admin_email: userEmail });

  // Mutations
  const createBlog = useMutation(api.blogs.createBlog);
  const updateBlog = useMutation(api.blogs.updateBlog);
  const deleteBlog = useMutation(api.blogs.deleteBlog);
  const createEvent = useMutation(api.events.createEvent);
  const updateEvent = useMutation(api.events.updateEvent);
  const deleteEvent = useMutation(api.events.deleteEvent);
  const promoteToAdmin = useMutation(api.auth.promoteToAdmin);
  const demoteFromAdmin = useMutation(api.auth.demoteFromAdmin);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/auth");
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleBlogSave = async (
    data: BlogFormData,
    status: "draft" | "published"
  ) => {
    try {
      const publishDate = data.publishDate
        ? new Date(data.publishDate).getTime()
        : Date.now();

      if (editingBlogId) {
        // Update existing blog
        await updateBlog({
          admin_email: userEmail,
          blog_id: editingBlogId as any,
          title: data.title,
          excerpt: data.content.substring(0, 150).replace(/<[^>]*>/g, ""),
          content: data.content,
          featured_image: data.coverImage || undefined,
          tags: [],
          status,
        });
        alert(`Blog updated successfully!`);
        setEditingBlogId(null);
      } else {
        // Create new blog
        await createBlog({
          admin_email: userEmail,
          title: data.title,
          slug: generateSlug(data.title),
          excerpt: data.content.substring(0, 150).replace(/<[^>]*>/g, ""),
          content: data.content,
          featured_image: data.coverImage || undefined,
          tags: [],
          status,
          publish_date: publishDate,
        });
        alert(
          `Blog ${status === "published" ? "published" : "saved"} successfully!`
        );
      }
    } catch (error: any) {
      alert(error.message || "Failed to save blog");
    }
  };

  const handleBlogDelete = async () => {
    if (!editingBlogId) return;
    if (
      !window.confirm(
        "Are you sure you want to delete this blog? This cannot be undone."
      )
    ) {
      return;
    }
    try {
      await deleteBlog({
        admin_email: userEmail,
        blog_id: editingBlogId as any,
      });
      alert("Blog deleted successfully!");
      setEditingBlogId(null);
    } catch (error: any) {
      alert(error.message || "Failed to delete blog");
    }
  };

  const handleEventSave = async (
    data: EventFormData,
    status: "draft" | "published"
  ) => {
    try {
      const startDate = new Date(
        `${data.startDate}T${data.startTime || "00:00"}`
      ).getTime();
      const endDate = data.endDate
        ? new Date(`${data.endDate}T${data.endTime || "00:00"}`).getTime()
        : undefined;

      if (editingEventId) {
        // Update existing event
        await updateEvent({
          admin_email: userEmail,
          event_id: editingEventId as any,
          title: data.title,
          description: data.description,
          start_date: startDate,
          end_date: endDate,
          location: data.location,
          image: data.image || undefined,
          capacity: data.capacity,
          status: status === "published" ? "upcoming" : "upcoming",
        });
        alert(`Event updated successfully!`);
        setEditingEventId(null);
      } else {
        // Create new event
        await createEvent({
          admin_email: userEmail,
          title: data.title,
          slug: generateSlug(data.title),
          description: data.description,
          start_date: startDate,
          end_date: endDate,
          location: data.location,
          image: data.image || undefined,
          capacity: data.capacity,
        });
        alert(
          `Event ${status === "published" ? "published" : "saved"} successfully!`
        );
      }
    } catch (error: any) {
      alert(error.message || "Failed to save event");
    }
  };

  const handleEventDelete = async () => {
    if (!editingEventId) return;
    if (
      !window.confirm(
        "Are you sure you want to delete this event? This cannot be undone."
      )
    ) {
      return;
    }
    try {
      await deleteEvent({
        admin_email: userEmail,
        event_id: editingEventId as any,
      });
      alert("Event deleted successfully!");
      setEditingEventId(null);
    } catch (error: any) {
      alert(error.message || "Failed to delete event");
    }
  };

  const handlePromote = (userId: string) => {
    promoteToAdmin({ admin_email: userEmail, target_user_id: userId as any });
  };

  const handleDemote = (userId: string) => {
    demoteFromAdmin({ admin_email: userEmail, target_user_id: userId as any });
  };

  return (
    <div className="flex min-h-screen bg-muted">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1">
        {activeTab === "blogs" && (
          <>
            {editingBlogId && blogs ? (
              <>
                <div className="p-4 md:p-6 border-b border-border bg-blue-50">
                  <button
                    onClick={() => setEditingBlogId(null)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    ← Back to Blog List
                  </button>
                  <h2 className="text-xl font-bold text-foreground mt-2">
                    Editing Blog
                  </h2>
                </div>
                <BlogEditor
                  onSave={handleBlogSave}
                  onDelete={handleBlogDelete}
                  initialData={
                    blogs.find((b: any) => b._id === editingBlogId)
                      ? {
                          title: blogs.find((b: any) => b._id === editingBlogId)
                            .title,
                          content: blogs.find(
                            (b: any) => b._id === editingBlogId
                          ).content,
                          coverImage: blogs.find(
                            (b: any) => b._id === editingBlogId
                          ).featured_image,
                          publishDate: blogs.find(
                            (b: any) => b._id === editingBlogId
                          ).published_at
                            ? new Date(
                                blogs.find((b: any) => b._id === editingBlogId)
                                  .published_at
                              )
                                .toISOString()
                                .split("T")[0]
                            : new Date().toISOString().split("T")[0],
                        }
                      : undefined
                  }
                  authorName="Oluwatoyin Omotayo"
                  isEditing={true}
                />
              </>
            ) : (
              <>
                <div className="p-4 md:p-6 border-b border-border flex justify-between items-center">
                  <h2 className="text-xl font-bold text-foreground">
                    Create New Blog
                  </h2>
                  {blogs && blogs.length > 0 && (
                    <button
                      onClick={() => setActiveTab("blogs")}
                      className="text-sm bg-muted text-foreground px-4 py-2 rounded hover:bg-muted/80"
                    >
                      View All Blogs ({blogs.length})
                    </button>
                  )}
                </div>
                <BlogEditor
                  onSave={handleBlogSave}
                  authorName="Oluwatoyin Omotayo"
                />
              </>
            )}
          </>
        )}

        {activeTab === "events" && (
          <>
            {editingEventId && events ? (
              <>
                <div className="p-4 md:p-6 border-b border-border bg-blue-50">
                  <button
                    onClick={() => setEditingEventId(null)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    ← Back to Event List
                  </button>
                  <h2 className="text-xl font-bold text-foreground mt-2">
                    Editing Event
                  </h2>
                </div>
                <EventEditor
                  onSave={handleEventSave}
                  onDelete={handleEventDelete}
                  initialData={
                    events.find((e: any) => e._id === editingEventId)
                      ? {
                          title: events.find(
                            (e: any) => e._id === editingEventId
                          ).title,
                          description: events.find(
                            (e: any) => e._id === editingEventId
                          ).description,
                          startDate: new Date(
                            events.find((e: any) => e._id === editingEventId)
                              .start_date
                          )
                            .toISOString()
                            .split("T")[0],
                          startTime: new Date(
                            events.find((e: any) => e._id === editingEventId)
                              .start_date
                          )
                            .toISOString()
                            .split("T")[1]
                            .substring(0, 5),
                          endDate: events.find(
                            (e: any) => e._id === editingEventId
                          ).end_date
                            ? new Date(
                                events.find(
                                  (e: any) => e._id === editingEventId
                                ).end_date
                              )
                                .toISOString()
                                .split("T")[0]
                            : undefined,
                          endTime: events.find(
                            (e: any) => e._id === editingEventId
                          ).end_date
                            ? new Date(
                                events.find(
                                  (e: any) => e._id === editingEventId
                                ).end_date
                              )
                                .toISOString()
                                .split("T")[1]
                                .substring(0, 5)
                            : undefined,
                          location: events.find(
                            (e: any) => e._id === editingEventId
                          ).location,
                          capacity: events.find(
                            (e: any) => e._id === editingEventId
                          ).capacity,
                          image: events.find(
                            (e: any) => e._id === editingEventId
                          ).image,
                        }
                      : undefined
                  }
                  isEditing={true}
                />
              </>
            ) : (
              <>
                <div className="p-4 md:p-6 border-b border-border">
                  <h2 className="text-xl font-bold text-foreground">
                    Create New Event
                  </h2>
                </div>
                <EventEditor onSave={handleEventSave} />
              </>
            )}
          </>
        )}

        {activeTab === "users" && (
          <UserManager
            users={users as any}
            onPromote={handlePromote}
            onDemote={handleDemote}
            currentUserEmail={userEmail}
          />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
