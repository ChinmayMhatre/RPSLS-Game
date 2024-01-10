'use client'
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import detectEthereumProvider from '@metamask/detect-provider';
import { useEffect,useState } from "react";


export default function Home() {
  const router = useRouter()

  
  useEffect(() => {
  let setEthProvider = async () => {
    const provider = await detectEthereumProvider();
    if (provider) {
      setProvider(provider)
    } else {
      setProvider(null)
    }
  }
  setEthProvider()
}, [])

//add types to the useState
  const [provider, setProvider] = useState<any>(null);

  const noProvider = () => {
    return (
      <Card className='p-10 mx-auto text-center'>
        <CardHeader>
          <CardTitle>
            Please install metamask
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            <p className='text-center'>Metamask is required to play this game</p>
          </CardDescription>
        </CardContent>
        <CardFooter>
          <a href='https://metamask.io/download.html' className='text-center w-full underline'>Download Metamask</a>
        </CardFooter>                                                                             
      </Card>
    )
  }


  // if (!provider) return noProvider()
    
  

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
