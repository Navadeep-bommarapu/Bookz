'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BookmarkForm from '@/components/BookmarkForm'
import BookmarkList, { Bookmark } from '@/components/BookmarkList'
import Button from '@/components/ui/Button'
import { LogOut, Loader2 } from 'lucide-react'

export default function DashboardPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [bookmarksLoading, setBookmarksLoading] = useState(true)
    const [userEmail, setUserEmail] = useState<string | null>(null)
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.replace('/login')
            } else {
                const { user } = session
                let name = user.user_metadata.full_name || user.email?.split('@')[0] || 'User'
                // Capitalize first letter
                name = name.charAt(0).toUpperCase() + name.slice(1)
                setUserEmail(name)
                setLoading(false)
            }
        }
        checkUser()
    }, [router])

    useEffect(() => {
        fetchBookmarks()

        const channel = supabase
            .channel('realtime bookmarks')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bookmarks' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setBookmarks((prev) => {
                        // Prevent duplicates if already added via onAdd
                        if (prev.find(b => b.id === payload.new.id)) return prev
                        return [payload.new as Bookmark, ...prev]
                    })
                } else if (payload.eventType === 'DELETE') {
                    setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== payload.old.id))
                } else if (payload.eventType === 'UPDATE') {
                    setBookmarks((prev) => prev.map((bookmark) => bookmark.id === payload.new.id ? payload.new as Bookmark : bookmark))
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const fetchBookmarks = async () => {
        try {
            const { data, error } = await supabase
                .from('bookmarks')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            if (data) setBookmarks(data)
        } catch (error) {
            console.error('Error fetching bookmarks:', error)
        } finally {
            setBookmarksLoading(false)
        }
    }

    const handleAddBookmark = (newBookmark: Bookmark) => {
        setBookmarks((prev) => [newBookmark, ...prev])
    }

    const handleDeleteBookmark = async (id: string) => {
        // Optimistic update
        setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== id))

        try {
            const { error } = await supabase.from('bookmarks').delete().eq('id', id)
            if (error) {
                // Revert if failed
                fetchBookmarks()
            }
        } catch (error) {
            console.error('Error deleting bookmark:', error)
            fetchBookmarks()
        }
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.replace('/')
    }

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center">Loading dashboard...</div>
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="bg-card shadow border-b border-border">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground hidden sm:inline">{userEmail}</span>
                        <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2 text-foreground hover:text-primary-foreground hover:bg-primary">
                            <LogOut size={16} /> Sign Out
                        </Button>
                    </div>
                </div>
            </header>
            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <BookmarkForm onAdd={handleAddBookmark} />
                        <div className="border-t border-border mt-8 pt-8">
                            <h2 className="text-xl font-semibold mb-4 text-foreground">Your Bookmarks</h2>
                            {bookmarksLoading ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                            ) : (
                                <BookmarkList bookmarks={bookmarks} onDelete={handleDeleteBookmark} />
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
