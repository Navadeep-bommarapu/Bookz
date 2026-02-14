# Bookz - Your Personal Digital Library

Bookz is a smart bookmark manager designed for readers. It helps you organize, track, and discover books with a beautiful, dark, and distraction-free interface.

## Features

-   **Modern Dark UI**: A premium aesthetic with deep dark backgrounds and vibrant accents.
-   **Smart Bookmarks**: Save links to your favorite books, articles, or resources.
-   **Immediate Updates**: Add and remove bookmarks instantly without page reloads.
-   **Google Authentication**: Secure and fast login with Google OAuth.
-   **Responsive Design**: Works perfectly on desktop, tablet, and mobile.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS + `tailwindcss-animate`
-   **Backend & Auth**: [Supabase](https://supabase.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)

## Project Structure

```bash
├── app/
│   ├── dashboard/      # Protected dashboard page
│   ├── auth/callback/  # OAuth callback handler
│   ├── globals.css     # Global styles & theme variables
│   └── page.tsx        # Landing Page
├── components/
│   ├── ui/             # Reusable UI components (Modal, Button)
│   ├── AuthModal.tsx   # Login/Signup Modal
│   ├── BookmarkForm.tsx# Add Bookmark Form
│   └── BookmarkList.tsx# Bookmark Display List
├── lib/
│   └── supabase.ts     # Supabase client configuration
└── public/             # Static assets
```

## Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/bookz.git
    cd bookz
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env.local` file in the root directory and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Schema

Run the following SQL in your Supabase SQL Editor to set up the database:

```sql
-- Create a table for bookmarks
create table if not exists bookmarks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  url text not null,
  user_id uuid references auth.users not null
);

-- Enable RLS
alter table bookmarks enable row level security;

-- Policies
create policy "Users can view their own bookmarks" on bookmarks
  for select using (auth.uid() = user_id);

create policy "Users can insert their own bookmarks" on bookmarks
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own bookmarks" on bookmarks
  for delete using (auth.uid() = user_id);
```

## Challenges & Solutions

During the development of Bookz, we encountered and solved several technical challenges:

### 1. **Vercel Build Errors (Missing Env Vars)**
- **Problem**: The build failed on Vercel because `NEXT_PUBLIC_SUPABASE_URL` was missing during the static generation phase.
- **Solution**: We updated `lib/supabase.ts` to provide fallback values during the build process, ensuring the app builds successfully even without immediate access to environment variables.

### 2. **Authentication Flow UX**
- **Problem**: The original page-based login was disruptive and not user-friendly.
- **Solution**: We refactored Authentication into a **Modal-based flow** (`AuthModal.tsx`), allowing users to sign in without leaving the landing page. We also removed Email/Password login to streamline the experience with Google OAuth.

### 3. **Real-time UI Updates**
- **Problem**: The bookmarks list required a page refresh to show new items.
- **Solution**: We implemented **Optimistic UI Updates**. When a user adds or deletes a bookmark, the local state updates *instantly*, while the database operation happens in the background.

### 4. **Complex Metadata Fetching**
- **Problem**: Fetching Open Graph (OG) tags from client-side code causes CORS errors.
- **Solution**: We built a dedicated API route (`app/api/metadata/route.ts`) that acts as a proxy to securely fetch and parse metadata from target URLs on the server side.
