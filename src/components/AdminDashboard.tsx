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

  // Queries
  const users = useQuery(api.auth.listAllUsers, { admin_email: userEmail });

  // Mutations
  const createBlog = useMutation(api.blogs.createBlog);
  const createEvent = useMutation(api.events.createEvent);
  const promoteToAdmin = useMutation(api.auth.promoteToAdmin);
  const demoteFromAdmin = useMutation(api.auth.demoteFromAdmin);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/auth");
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleBlogSave = async (data: BlogFormData, status: 'draft' | 'published') => {
    try {
      await createBlog({
        admin_email: userEmail,
        title: data.title,
        slug: generateSlug(data.title),
        excerpt: data.content.substring(0, 150).replace(/<[^>]*>/g, ''),
        content: data.content,
        featured_image: data.coverImage || undefined,
        tags: [],
        status,
      });
      alert(`Blog ${status === 'published' ? 'published' : 'saved'} successfully!`);
    } catch (error: any) {
      alert(error.message || 'Failed to save blog');
    }
  };

  const handleEventSave = async (data: EventFormData, status: 'draft' | 'published') => {
    try {
      const startDate = new Date(`${data.date}T${data.time}`).getTime();
      await createEvent({
        admin_email: userEmail,
        title: data.title,
        slug: generateSlug(data.title),
        description: data.subHeading,
        start_date: startDate,
        location: 'TBD',
      });
      alert(`Event ${status === 'published' ? 'published' : 'saved'} successfully!`);
    } catch (error: any) {
      alert(error.message || 'Failed to save event');
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
          <BlogEditor onSave={handleBlogSave} authorName="Oluwatoyin Omotayo" />
        )}
        
        {activeTab === "events" && (
          <EventEditor onSave={handleEventSave} />
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
