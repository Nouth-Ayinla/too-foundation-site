# Convex Backend Setup Guide

This guide will help you set up the Convex backend for user authentication and admin dashboard functionality.

## Prerequisites

- Node.js 16+ installed
- npm or yarn package manager
- A Clerk account for authentication (https://clerk.com)
- A Convex account (https://convex.dev)

## Installation Steps

### 1. Install Convex CLI

```bash
npm install -g convex
```

### 2. Install Dependencies

```bash
npm install convex @clerk/clerk-react
```

### 3. Initialize Convex Project

From the project root:

```bash
convex init
```

This will:

- Create a `.env.local` file with your Convex deployment URL
- Link your project to Convex

### 4. Configure Environment Variables

Create a `.env.local` file in the project root with:

```env
CONVEX_DEPLOYMENT=YOUR_DEPLOYMENT_URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

Get these values from:

- **Convex URL**: From `convex init` output or dashboard
- **Clerk Keys**: From Clerk dashboard → API Keys

### 5. Push Schema to Convex

```bash
convex push
```

This deploys your schema to the Convex backend.

## Project Structure

```
convex/
├── schema.ts          # Database schema definition
├── auth.ts            # Authentication functions
├── blogs.ts           # Blog CRUD operations
├── events.ts          # Event management functions
├── gallery.ts         # Gallery management functions
└── _generated/        # Auto-generated types (after convex push)

src/
├── components/
│   ├── AdminDashboard.tsx     # Admin panel component
│   └── AdminDashboard.css     # Admin styles
└── pages/
    └── Auth.tsx       # Authentication page
```

## Database Schema

### Users Table

- `clerk_id` - Unique Clerk user identifier
- `email` - User email
- `name` - User full name
- `role` - Either "admin" or "user"
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

### Blogs Table

- `title` - Blog post title
- `slug` - URL-friendly identifier
- `excerpt` - Short summary
- `content` - Full blog content
- `author_id` - Reference to users table
- `featured_image` - Image URL
- `tags` - Array of tags
- `status` - "draft", "published", or "archived"
- `published_at` - Publication timestamp

### Events Table

- `title` - Event name
- `slug` - URL-friendly identifier
- `description` - Event details
- `start_date` - Event start time (Unix timestamp)
- `end_date` - Event end time (optional)
- `location` - Event location
- `image` - Event image URL
- `capacity` - Maximum attendees (optional)
- `registrations` - Current registration count
- `status` - "upcoming", "ongoing", "completed", or "cancelled"
- `organizer_id` - Reference to users table

### Gallery Table

- `title` - Gallery collection title
- `description` - Collection description
- `images` - Array of image objects (url, alt_text)
- `category` - Gallery category (e.g., "impact", "events")
- `featured` - Boolean for featured collections
- `created_by` - Reference to users table

### Event Registrations Table

- `event_id` - Reference to events table
- `user_name` - Registrant name
- `user_email` - Registrant email
- `phone` - Registrant phone (optional)
- `registered_at` - Registration timestamp

## Available Functions

### Authentication

- `getOrCreateUser(clerk_id, email, name)` - Create user on first login
- `getCurrentUser(clerk_id)` - Fetch current user
- `promoteToAdmin(clerk_id, target_user_id)` - Promote user to admin
- `demoteFromAdmin(clerk_id, target_user_id)` - Demote admin to user
- `listAllUsers(clerk_id)` - List all users (admin only)

### Blog Management

- `createBlog(clerk_id, ...)` - Create new blog (admin)
- `updateBlog(clerk_id, blog_id, ...)` - Update blog (admin)
- `deleteBlog(clerk_id, blog_id)` - Delete blog (admin)
- `getPublishedBlogs()` - Get all published blogs (public)
- `getBlogBySlug(slug)` - Get blog by slug (public)
- `getAllBlogs(clerk_id)` - Get all blogs (admin)

### Event Management

- `createEvent(clerk_id, ...)` - Create event (admin)
- `updateEvent(clerk_id, event_id, ...)` - Update event (admin)
- `deleteEvent(clerk_id, event_id)` - Delete event (admin)
- `getPublicEvents()` - Get public events
- `getEventBySlug(slug)` - Get event details
- `getAllEvents(clerk_id)` - Get all events (admin)
- `registerForEvent(event_id, user_name, user_email, ...)` - Register for event (public)
- `getEventRegistrations(clerk_id, event_id)` - Get registrations (admin)

### Gallery Management

- `createGalleryCollection(clerk_id, ...)` - Create gallery (admin)
- `updateGalleryCollection(clerk_id, gallery_id, ...)` - Update gallery (admin)
- `deleteGalleryCollection(clerk_id, gallery_id)` - Delete gallery (admin)
- `getFeaturedGallery()` - Get featured galleries (public)
- `getGalleryByCategory(category)` - Get galleries by category (public)
- `addImageToGallery(clerk_id, gallery_id, url, alt_text)` - Add image (admin)
- `removeImageFromGallery(clerk_id, gallery_id, image_index)` - Remove image (admin)

## Running Locally

1. **Start the dev server:**

   ```bash
   npm run dev
   ```

2. **In another terminal, run Convex dev:**

   ```bash
   convex dev
   ```

3. **Access the admin dashboard at:**
   ```
   http://localhost:5173/admin
   ```

## Integration with React

### Setup ConvexProvider

In your main app entry point (e.g., `src/main.tsx`):

```tsx
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ClerkProvider } from "@clerk/clerk-react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

ReactDOM.render(
  <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </ClerkProvider>,
  document.getElementById("root")
);
```

### Using Convex Hooks in Components

```tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

function MyComponent() {
  const blogs = useQuery(api.blogs.getPublishedBlogs);
  const createBlog = useMutation(api.blogs.createBlog);

  const handleCreate = async () => {
    await createBlog({
      clerk_id: userId,
      title: "My Blog",
      slug: "my-blog",
      excerpt: "...",
      content: "...",
      tags: [],
      status: "published",
    });
  };

  return (
    <div>
      {blogs?.map((blog) => (
        <div key={blog._id}>{blog.title}</div>
      ))}
    </div>
  );
}
```

## Security Considerations

1. **Admin-Only Operations**: All sensitive mutations check `user.role === "admin"`
2. **User Identification**: Clerk IDs are used to identify users securely
3. **Data Validation**: All inputs are validated using Convex's type system
4. **Role-Based Access Control**: Different functions have different permission requirements

## Deployment

### Deploy to Convex Production

```bash
convex deploy
```

This will:

- Deploy your schema to production
- Update indexes and functions
- Keep your data safe

### Environment Variables for Production

Set these in your production environment:

- `CONVEX_DEPLOYMENT` - Production Convex URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key

### Email (Brevo) Configuration

```bash
# Ensure you are targeting the deployment used by VITE_CONVEX_URL
# Option A: Use the Convex dashboard to set env vars for the deployment
# Option B: Use the CLI after switching to the correct deployment

# Required
npx convex env set BREVO_API_KEY "<your_brevo_api_key>"


# Deploy functions so HTTP actions are live
npx convex deploy
```

Notes:

- The frontend calls `https://<deployment>.convex.site/send-reset-email` derived from `VITE_CONVEX_URL`.
- If emails fail, check Convex logs for `BREVO_API_KEY not configured` or Brevo error details.
- Make sure your sender is verified in Brevo; otherwise Brevo returns 400 with details.

## Troubleshooting

### "Module not found" errors

```bash
npm install
convex push
```

### Authentication not working

- Verify Clerk keys in `.env.local`
- Check that `getOrCreateUser` is called on first login
- Ensure ClerkProvider wraps your app

### Database schema errors

- Run `convex push` to sync schema
- Check schema.ts for syntax errors
- Clear `.convex` folder and retry

### Functions not found

- Ensure files are in the `convex/` folder
- Export functions as named exports
- Run `convex push` after adding new functions

## Support

- Convex Docs: https://docs.convex.dev
- Clerk Docs: https://clerk.com/docs
- Community: Join Convex Discord for help
