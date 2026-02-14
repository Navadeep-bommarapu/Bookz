'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function CallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const code = searchParams.get('code')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const handleCallback = async () => {
            if (code) {
                const { error } = await supabase.auth.exchangeCodeForSession(code)
                if (error) {
                    setError(error.message)
                } else {
                    router.replace('/dashboard')
                }
            } else {
                const { data: { session } } = await supabase.auth.getSession()
                if (session) {
                    router.replace('/dashboard')
                } else {
                    router.replace('/dashboard')
                }
            }
        }

        handleCallback()
    }, [code, router])

    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center">
                <p className="text-red-500">Error: {error}</p>
                <button onClick={() => router.push('/login')} className="mt-4 text-blue-500 hover:underline">
                    Back to Login
                </button>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <p>Authenticating...</p>
        </div>
    )
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
            <CallbackContent />
        </Suspense>
    )
}
