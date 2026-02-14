'use client'

import { Trash2, ExternalLink } from 'lucide-react'
import Button from '@/components/ui/Button'

export type Bookmark = {
    id: string
    title: string
    url: string
    created_at: string
    user_id: string
}

interface BookmarkListProps {
    bookmarks: Bookmark[]
    onDelete: (id: string) => void
}

export default function BookmarkList({ bookmarks, onDelete }: BookmarkListProps) {
    if (bookmarks.length === 0) {
        return <div className="text-center text-gray-500 p-8">No bookmarks yet. Add one above!</div>
    }

    return (
        <div className="space-y-4">
            {bookmarks.map((bookmark) => (
                <div key={bookmark.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-all hover:border-primary/50 group">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-card-foreground truncate group-hover:text-primary transition-colors">{bookmark.title}</h3>
                        <a
                            href={bookmark.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 truncate transition-colors"
                        >
                            {bookmark.url}
                            <ExternalLink size={12} />
                        </a>
                    </div>
                    <Button
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-4 p-2 h-auto"
                        onClick={() => onDelete(bookmark.id)}
                        title="Delete bookmark"
                    >
                        <Trash2 size={18} />
                    </Button>
                </div>
            ))}
        </div>
    )
}
