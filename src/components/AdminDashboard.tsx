import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import "./AdminDashboard.css";

interface AdminDashboardProps {
  userEmail: string;
}

type DashboardTab = "blogs" | "events" | "gallery" | "users";

const AdminDashboard: React.FC<AdminDashboardProps> = ({ userEmail }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DashboardTab>("blogs");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Queries
  const blogs = useQuery(api.blogs.getAllBlogs, { admin_email: userEmail });
  const events = useQuery(api.events.getAllEvents, { admin_email: userEmail });
  const galleries = useQuery(api.gallery.getAllGalleryCollections, {
    admin_email: userEmail,
  });
  const users = useQuery(api.auth.listAllUsers, { admin_email: userEmail });

  // Mutations
  const createBlog = useMutation(api.blogs.createBlog);
  const updateBlog = useMutation(api.blogs.updateBlog);
  const deleteBlog = useMutation(api.blogs.deleteBlog);

  const createEvent = useMutation(api.events.createEvent);
  const updateEvent = useMutation(api.events.updateEvent);
  const deleteEvent = useMutation(api.events.deleteEvent);

  const createGallery = useMutation(api.gallery.createGalleryCollection);
  const updateGallery = useMutation(api.gallery.updateGalleryCollection);
  const deleteGallery = useMutation(api.gallery.deleteGalleryCollection);

  const promoteToAdmin = useMutation(api.auth.promoteToAdmin);
  const demoteFromAdmin = useMutation(api.auth.demoteFromAdmin);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/auth");
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h2>Admin Panel</h2>
        </div>
        <nav className="admin-nav">
          <button
            className={`nav-item ${activeTab === "blogs" ? "active" : ""}`}
            onClick={() => setActiveTab("blogs")}
          >
            📝 Blogs
          </button>
          <button
            className={`nav-item ${activeTab === "events" ? "active" : ""}`}
            onClick={() => setActiveTab("events")}
          >
            📅 Events
          </button>
          <button
            className={`nav-item ${activeTab === "gallery" ? "active" : ""}`}
            onClick={() => setActiveTab("gallery")}
          >
            🖼️ Gallery
          </button>
          <button
            className={`nav-item ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            👥 Users
          </button>
        </nav>
        <div className="mt-auto p-4">
          <button
            onClick={handleLogout}
            className="nav-item w-full text-left text-red-500 hover:bg-red-50"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-header">
          <h1>
            {activeTab === "blogs" && "Manage Blogs"}
            {activeTab === "events" && "Manage Events"}
            {activeTab === "gallery" && "Manage Gallery"}
            {activeTab === "users" && "Manage Users"}
          </h1>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            + Create New
          </button>
        </div>

        {/* Blogs Tab */}
        {activeTab === "blogs" && (
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs?.map((blog: any) => (
                  <tr key={blog._id}>
                    <td>{blog.title}</td>
                    <td>{blog.author_id}</td>
                    <td>
                      <span className={`status ${blog.status}`}>
                        {blog.status}
                      </span>
                    </td>
                    <td>{new Date(blog.created_at).toLocaleDateString()}</td>
                    <td className="actions">
                      <button className="btn-sm edit">Edit</button>
                      <button
                        className="btn-sm delete"
                        onClick={() =>
                          deleteBlog({
                            admin_email: userEmail,
                            blog_id: blog._id,
                          })
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Registrations</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events?.map((event: any) => (
                  <tr key={event._id}>
                    <td>{event.title}</td>
                    <td>{new Date(event.start_date).toLocaleDateString()}</td>
                    <td>{event.location}</td>
                    <td>{event.registrations}</td>
                    <td>
                      <span className={`status ${event.status}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="actions">
                      <button className="btn-sm edit">Edit</button>
                      <button
                        className="btn-sm delete"
                        onClick={() =>
                          deleteEvent({
                            admin_email: userEmail,
                            event_id: event._id,
                          })
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === "gallery" && (
          <div className="admin-gallery">
            {galleries?.map((gallery: any) => (
              <div key={gallery._id} className="gallery-card">
                <h3>{gallery.title}</h3>
                <p>{gallery.category}</p>
                <div className="gallery-images">
                  {gallery.images.map((img: any, idx: number) => (
                    <img
                      key={idx}
                      src={img.url}
                      alt={img.alt_text}
                      className="gallery-thumbnail"
                    />
                  ))}
                </div>
                <div className="gallery-actions">
                  <button className="btn-sm edit">Edit</button>
                  <button
                    className="btn-sm delete"
                    onClick={() =>
                      deleteGallery({
                        admin_email: userEmail,
                        gallery_id: gallery._id,
                      })
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user: any) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="actions">
                      {user.role === "user" ? (
                        <button
                          className="btn-sm promote"
                          onClick={() =>
                            promoteToAdmin({
                              admin_email: userEmail,
                              target_user_id: user._id,
                            })
                          }
                        >
                          Promote
                        </button>
                      ) : (
                        <button
                          className="btn-sm demote"
                          onClick={() =>
                            demoteFromAdmin({
                              admin_email: userEmail,
                              target_user_id: user._id,
                            })
                          }
                        >
                          Demote
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
