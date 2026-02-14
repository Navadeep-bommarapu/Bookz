'use client'

import { useState, useMemo } from 'react'
import { Trash2, ExternalLink, Pin, Search, Tag } from 'lucide-react'
import Button from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

export type Bookmark = {
    id: string
    title: string
    url: string
    created_at: string
    user_id: string
    is_pinned?: boolean
    tags?: string[]
    description?: string
    image?: string
}

interface BookmarkListProps {
    bookmarks: Bookmark[]
    onDelete: (id: string) => void
}

export default function BookmarkList({ bookmarks, onDelete }: BookmarkListProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [localBookmarks, setLocalBookmarks] = useState(bookmarks)

    // Sync local state when props change
    useMemo(() => {
        setLocalBookmarks(bookmarks)
    }, [bookmarks])

    const handlePin = async (id: string, currentPinState: boolean) => {
        // Optimistic update
        const updatedBookmarks = localBookmarks.map(b =>
            b.id === id ? { ...b, is_pinned: !currentPinState } : b
        )
        setLocalBookmarks(updatedBookmarks) // Update local UI immediately

        // We know that the parent component (DashboardPage) also listens to realtime changes
        // But for pin action, we can just trigger the DB update and let realtime sync it back 
        // or just let the local optimistic update hold until then.

        try {
            await supabase.from('bookmarks').update({ is_pinned: !currentPinState }).eq('id', id)
        } catch (error) {
            console.error('Error updating pin:', error)
            // Revert on error
            setLocalBookmarks(bookmarks)
        }
    }

    const filteredBookmarks = useMemo(() => {
        return localBookmarks.filter(b => {
            const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
            return matchesSearch
        }).sort((a, b) => {
            // Sort by pinned first, then by date desc
            if (a.is_pinned === b.is_pinned) {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            }
            return a.is_pinned ? -1 : 1
        })
    }, [localBookmarks, searchTerm])

    if (bookmarks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-xl bg-card/50">
                <Tag className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-foreground">No bookmarks yet</h3>
                <p className="text-muted-foreground">Add your first bookmark above to get started!</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                    type="text"
                    placeholder="Search bookmarks, tags, or URLs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/50"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBookmarks.map((bookmark) => (
                    <div
                        key={bookmark.id}
                        className={`
                            group flex flex-col bg-card border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1
                            ${bookmark.is_pinned ? 'border-primary/50 shadow-md bg-gradient-to-br from-card to-primary/5' : 'border-border hover:border-primary/30'}
                        `}
                    >
                        {bookmark.image && (
                            <div className="h-32 w-full overflow-hidden relative bg-muted">
                                <img src={bookmark.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                {bookmark.is_pinned && (
                                    <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full shadow-lg z-10">
                                        <Pin size={12} fill="currentColor" />
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="p-4 flex-1 flex flex-col">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-lg text-card-foreground truncate leading-tight group-hover:text-primary transition-colors" title={bookmark.title}>
                                        {bookmark.title}
                                    </h3>
                                    {!bookmark.image && bookmark.is_pinned && (
                                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-primary mt-1">
                                            <Pin size={10} fill="currentColor" /> Pinned
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center -mr-2 -mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`h-8 w-8 p-0 ${bookmark.is_pinned ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                                        onClick={() => handlePin(bookmark.id, !!bookmark.is_pinned)}
                                        title={bookmark.is_pinned ? "Unpin" : "Pin to top"}
                                    >
                                        <Pin size={16} fill={bookmark.is_pinned ? "currentColor" : "none"} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                        onClick={() => onDelete(bookmark.id)}
                                        title="Delete bookmark"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>

                            {bookmark.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                                    {bookmark.description}
                                </p>
                            )}

                            <div className="mt-auto pt-2 flex flex-wrap gap-2 items-center justify-between border-t border-border/50">
                                <a
                                    href={bookmark.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-muted-foreground group-hover:text-primary flex items-center gap-1.5 truncate max-w-[60%] transition-colors py-1"
                                >
                                    <div className="p-1 bg-accent rounded-full">
                                        <ExternalLink size={10} />
                                    </div>
                                    <span className="truncate">{new URL(bookmark.url).hostname}</span>
                                </a>

                                <div className="flex gap-1 overflow-hidden justify-end flex-1">
                                    {bookmark.tags?.slice(0, 2).map((tag, idx) => (
                                        <span key={idx} className="text-[10px] px-2 py-0.5 bg-accent/50 text-accent-foreground rounded-full font-medium truncate max-w-[60px]">
                                            {tag}
                                        </span>
                                    ))}
                                    {bookmark.tags && bookmark.tags.length > 2 && (
                                        <span className="text-[10px] px-1.5 py-0.5 bg-accent/50 text-muted-foreground rounded-full">
                                            +{bookmark.tags.length - 2}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredBookmarks.length === 0 && searchTerm && (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No results found for "{searchTerm}"</p>
                    <button onClick={() => setSearchTerm('')} className="text-primary hover:underline mt-2 text-sm">Clear search</button>
                </div>
            )}
        </div>
    )
}
