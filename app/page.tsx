'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, BookOpen } from 'lucide-react'
import Button from '@/components/ui/Button'
import AuthModal from '@/components/AuthModal'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace('/dashboard')
      }
    }
    checkUser()
  }, [router])

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-background text-foreground selection:bg-primary selection:text-white">
      <header className="fixed top-0 w-full z-40 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
            <div className="p-1.5 bg-primary rounded-lg text-white">
              <BookOpen size={20} fill="currentColor" />
            </div>
            <span>Bookz</span>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setIsAuthModalOpen(true)}
              className="hidden sm:inline-flex"
            >
              Sign In
            </Button>
            <Button onClick={() => setIsAuthModalOpen(true)}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center pt-20 px-4 relative z-10 w-full">
        <div className="text-center w-full max-w-5xl mx-auto flex flex-col items-center justify-center h-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-4 sm:mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            New: Smart Collections
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-4 sm:mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 leading-tight">
            Your personal <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">digital library</span>
          </h1>

          <p className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-100 px-4">
            Organize, track, and discover books with an interface designed for readers.
            Beautiful, dark, and distraction-free.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-200 w-full sm:w-auto">
            <Button size="lg" onClick={() => setIsAuthModalOpen(true)} className="w-full sm:w-auto group text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 h-auto">
              Start Reading <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <footer className="fixed bottom-0 w-full py-4 text-center text-muted-foreground text-xs sm:text-sm bg-background/80 backdrop-blur-sm z-20 border-t border-white/5">
        <p>&copy; {new Date().getFullYear()} Bookz App. All rights reserved.</p>
      </footer>
    </div>
  )
}
