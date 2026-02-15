

# Interior Design Portfolio & Admin Dashboard

## Design System
- **Colors**: Deep Emerald Green (`#064E3B`), Charcoal Grey (`#1F2937`), White — luxury minimalist aesthetic
- **Typography**: Clean serif headings + sans-serif body text
- **Fully responsive** mobile & desktop

---

## Part 1: Admin Dashboard (Private)

### 1. Secure Admin Login
- Email/password authentication via Supabase Auth
- Protected admin routes — only authenticated users can access `/admin/*`
- Role-based access using a `user_roles` table to verify admin status

### 2. Project Management
- Form to create/edit projects: Name, Client, Location, Budget, Square Feet, Description, Status
- Project list with search/filter and edit/delete actions
- Status field for site progress tracking (e.g., "Design Phase", "Woodwork Started", "Painting in Progress", "Completed")

### 3. Media Manager
- Upload multiple photos per project to Supabase Storage
- Categorize photos (Living Room, Kitchen, Bedroom, Before/After, etc.)
- Drag-and-drop upload interface with image preview
- Set a featured/cover image for each project

### 4. Site Status Tracker
- Integrated into each project's detail — update work progress with predefined stages
- Dashboard overview showing all active projects and their current status at a glance

### 5. Lead Management
- Table view of all inquiry submissions from the public website
- Show client name, email, phone, project type, budget range, message, and submission date
- Mark leads as "New", "Contacted", "In Progress", or "Closed"

---

## Part 2: Public Website (Client-Facing)

### 6. Homepage
- Full-screen hero section with background image, tagline, and "Book Consultation" CTA button
- Brief about section highlighting expertise
- Featured projects grid (auto-populated from admin)
- Testimonials section (static initially)
- Footer with contact info and social links

### 7. Portfolio Gallery Page
- Filterable grid of all published projects
- Each card shows cover image, project name, location, and category
- Automatically updates when projects are added/published from admin

### 8. Project Details Page
- Full photo gallery with lightbox viewer
- Project info: client, location, budget, square footage
- Description / transformation story
- "Get a Quote" CTA button

### 9. Inquiry / Get a Quote Form
- Contact form: Name, Email, Phone, Project Type, Budget Range, Message
- Submissions saved to Supabase and visible in Admin Lead Management
- Success confirmation after submission

---

## Backend (Supabase)

- **Database tables**: projects, project_images, inquiries, profiles, user_roles
- **Storage**: `project-images` bucket for all media
- **Auth**: Email/password login for admin
- **RLS policies**: Public read access for published projects; admin-only write access
- **No edge functions needed initially** — direct Supabase client queries

