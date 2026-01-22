'use client';

import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  const handleDiscoverFuture = () => {
    router.push('/interview');
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black text-white">
      {/* Bluish hazy gradient background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[100px]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-10">
        <h1 className="text-6xl font-bold tracking-tight text-white md:text-8xl">
          Welcome to Orb
        </h1>
        
        <button onClick={handleDiscoverFuture} className="group relative overflow-hidden rounded-full border border-white/10 bg-white/5 px-10 py-4 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]">
          <span className="relative z-10 text-lg font-medium text-white">
            Discover your future
          </span>
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
        </button>
      </div>
    </main>
  )
}
