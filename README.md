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

## License

This project is licensed under the MIT License.
