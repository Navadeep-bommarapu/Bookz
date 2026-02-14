'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import { Plus } from 'lucide-react'

interface BookmarkFormProps {
    onAdd: (bookmark: any) => void
}

export default function BookmarkForm({ onAdd }: BookmarkFormProps) {
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !url) return alert('Please fill in all fields')

        try {
            setLoading(true)
            const { data: { session }, error: sessionError } = await supabase.auth.getSession()
            if (sessionError || !session) {
                console.error('Session error:', sessionError)
                throw new Error('User not authenticated. Please reload.')
            }

            const user = session.user
            const { data, error } = await supabase.from('bookmarks').insert({
                title,
                url,
                user_id: user.id,
            }).select().single()

            if (error) {
                console.error('Supabase insert error details:', error)
                throw new Error(error.message || 'Database error')
            }

            onAdd(data)
            setTitle('')
            setUrl('')
        } catch (error: any) {
            console.error('Full error object:', error)
            // Removed alert as per user request
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 items-end mb-8 p-4 bg-card border border-border rounded-lg shadow-sm">
            <div className="flex-1">
                <label htmlFor="title" className="block text-sm font-medium text-card-foreground">Title</label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2"
                    placeholder="My Bookmark"
                    required
                />
            </div>
            <div className="flex-1">
                <label htmlFor="url" className="block text-sm font-medium text-card-foreground">URL</label>
                <input
                    type="url"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2"
                    placeholder="https://example.com"
                    required
                />
            </div>
            <Button type="submit" disabled={loading} className="mb-0.5">
                {loading ? 'Adding...' : <><Plus size={16} className="mr-1" /> Add</>}
            </Button>
        </form>
    )
}
