'use client'
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  return (
    <main className="flex flex-col justify-between items-center h-full">
      <h1 className="text-2xl font-bold">Rock Paper Scissor Lizard Spock</h1>
      <div className="flex flex-col gap-6 w-full md:max-w-[70%] justify-end item">
        <Button onClick={()=>router.push('/create')} >
          Create Game
        </Button>
        <Button onClick={()=>router.push('/join')}>
          Join Game
        </Button>
      </div>
    </main>
  )
}
