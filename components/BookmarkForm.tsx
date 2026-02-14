'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import { Plus, Loader2, Wand2 } from 'lucide-react'

interface BookmarkFormProps {
    onAdd: (bookmark: any) => void
}

export default function BookmarkForm({ onAdd }: BookmarkFormProps) {
    const [url, setUrl] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [image, setImage] = useState('')
    const [tags, setTags] = useState('')
    const [loading, setLoading] = useState(false)
    const [pitching, setPitching] = useState(false)

    const fetchMetadata = useCallback(async (urlToFetch: string) => {
        if (!urlToFetch) return
        setPitching(true)
        try {
            const res = await fetch(`/api/metadata?url=${encodeURIComponent(urlToFetch)}`)
            if (res.ok) {
                const data = await res.json()
                if (data.title) setTitle(data.title)
                if (data.description) setDescription(data.description)
                if (data.image) setImage(data.image)
            }
        } catch (error) {
            console.error('Error fetching metadata:', error)
        } finally {
            setPitching(false)
        }
    }, [])

    const handleUrlBlur = () => {
        if (url && !title) {
            fetchMetadata(url)
        }
    }

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

            // Process tags
            const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0)

            const { data, error } = await supabase.from('bookmarks').insert({
                title,
                url,
                description,
                image,
                tags: tagsArray,
                user_id: user.id,
            }).select().single()

            if (error) {
                console.error('Supabase insert error details:', error)
                throw new Error(error.message || 'Database error')
            }

            onAdd(data)
            setTitle('')
            setUrl('')
            setDescription('')
            setImage('')
            setTags('')
        } catch (error: any) {
            console.error('Full error object:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-card border border-border rounded-xl shadow-lg mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Plus size={20} className="text-primary" /> Add New Bookmark
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="col-span-1 md:col-span-2 relative">
                    <label htmlFor="url" className="text-sm font-medium text-muted-foreground mb-1 block">URL</label>
                    <div className="relative">
                        <input
                            type="url"
                            id="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onBlur={handleUrlBlur}
                            className="w-full rounded-md border border-input bg-background/50 text-foreground px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all pr-10"
                            placeholder="https://example.com"
                            required
                        />
                        {pitching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Loader2 className="animate-spin text-primary" size={16} />
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <label htmlFor="title" className="text-sm font-medium text-muted-foreground mb-1 block">Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full rounded-md border border-input bg-background/50 text-foreground px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        placeholder="Page Title"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="tags" className="text-sm font-medium text-muted-foreground mb-1 block">Tags (comma separated)</label>
                    <input
                        type="text"
                        id="tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="w-full rounded-md border border-input bg-background/50 text-foreground px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        placeholder="work, reading, recipe"
                    />
                </div>
            </div>

            {/* Hidden fields for metadata */}
            <input type="hidden" value={description} />
            <input type="hidden" value={image} />

            <div className="flex justify-end">
                <Button type="submit" disabled={loading} size="lg" className="w-full md:w-auto">
                    {loading ? <><Loader2 className="animate-spin mr-2" size={18} /> Adding...</> : 'Save Bookmark'}
                </Button>
            </div>

            {(title || description) && (
                <div className="mt-4 p-3 bg-accent/50 rounded-lg text-sm flex gap-3 items-start animate-in fade-in">
                    {image && <img src={image} alt="" className="w-16 h-16 object-cover rounded-md" />}
                    <div>
                        <div className="font-medium text-foreground">{title}</div>
                        <div className="text-muted-foreground line-clamp-2 text-xs mt-1">{description}</div>
                        <div className="flex flex-wrap gap-1 mt-2">
                            {tags.split(',').filter(t => t.trim()).map((t, i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-primary/20 text-primary text-[10px] rounded-full uppercase font-bold tracking-wider">
                                    {t.trim()}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </form>
    )
}
