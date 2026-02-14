import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; BookzBot/1.0)',
            },
        })

        if (!response.ok) {
            throw new Error('Failed to fetch URL')
        }

        const html = await response.text()

        // Basic regex to extract OG tags
        const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/) || html.match(/<title>([^<]+)<\/title>/)
        const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/) || html.match(/<meta name="description" content="([^"]+)"/)
        const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/)

        const title = titleMatch ? titleMatch[1] : ''
        const description = descMatch ? descMatch[1] : ''
        const image = imageMatch ? imageMatch[1] : ''

        return NextResponse.json({
            title,
            description,
            image,
        })
    } catch (error) {
        console.error('Error fetching metadata:', error)
        return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 })
    }
}
