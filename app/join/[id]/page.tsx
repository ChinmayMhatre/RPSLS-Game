'use client'
import React, { FC, useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner';
import Web3 from 'web3';
import { useRouter } from 'next/navigation';
import RPSLS from '../../../contracts/RPS.json'
import { set } from 'zod';
import { Button } from '@/components/ui/button';
import detectEthereumProvider from '@metamask/detect-provider';

const Page = ({ params }: { params: { id: string } }) => {
  const router = useRouter()
  const [gameContract, setGameContract] = useState<any>(null)
  const [redeem, setRedeem] = useState(false)
  const [message, setMessage] = useState('loading...')
  const web3 = new Web3((window as any)?.ethereum);

  const fetchContract = useCallback(async () => {
    const web3 = new Web3((window as any)?.ethereum);
    try {
      const accounts = await web3.eth.getAccounts();
      const code = await web3.eth.getCode(params.id);
      if (code == '0x') {
        toast.error('Contract does not exist')
        return;
      }
      const contract = new web3.eth.Contract(RPSLS.abi, params.id);
      setGameContract(contract)
    } catch (error) {
      toast.error('Something went wrong while setting contract')
    }
  }, [params.id])

  useEffect(() => {
    fetchContract()
  }, [])

  useEffect(() => {
    if(gameContract) {
      fetchData()
    }
  }, [gameContract])
  
  const checkUser = async () => {
    try {
      const web3 = new Web3((window as any)?.ethereum);
      const accounts = await web3.eth.getAccounts();
      const p2 = await gameContract.methods.j2().call();
      if (accounts[0] === p2) {
        return true
      } else {
        toast.message('You do not have access to the game', {
          description: 'redirecting you to home page',
          onAutoClose(toast) {
            router.push('/')
          },
        })
        return false
      }
    } catch (error) {
      toast.error('Something went wrong')
      return false
    }

  }

  const fetchData = async () => {
    const isUser = await checkUser()    
    if(!isUser) return;
    
    try {
      const c2 = await gameContract.methods.c2().call();
      if (Number(c2) === 0){
        toast.message('You need to play a move', {
          description: 'redirecting you to join page',
          onAutoClose() {
            router.push('/join')
          },
        })
        return;
      }
      const interval = setInterval(async () => {
      const stake = await gameContract.methods.stake().call();
      const lastAction = await gameContract.methods.lastAction().call();
      const timeout = Math.floor(Date.now() / 1000) > Number(lastAction) + 300
      if(timeout && Number(stake) > 0){
        setRedeem(true)
        setMessage("Game has timed out, you can claim your funds")
        clearInterval(interval)
        return
      }
      console.log(timeout);
      
      if(Number(stake) === 0) {
        // game over someone has claimed funds or won
        setMessage('Game over!')
        clearInterval(interval)
        return
      }
      // wait for player 1 to reveal
      setMessage('Waiting for player 1 to reveal the move')
      }, 5000);

    } catch (error) {
      console.log(error);
      
    }
  }

  const reclaimFunds = async () => {
    const provider:any = await detectEthereumProvider();
        try {
            await provider.request({ method: 'eth_requestAccounts' });
            const accounts = await web3.eth.getAccounts();
            const rpslsGame = new web3.eth.Contract(RPSLS.abi, params.id);
            await rpslsGame.methods.j1Timeout().send({ from: accounts[0] });
            toast.success('Funds recovered successfully', {
              description: 'redirecting you to home page',
              onAutoClose: () => {
                router.push('/')
              }
            })
        } catch (error) {
          toast.error('Something went wrong')
        }
}

  return (
    <div className='flex justify-center items-center flex-col gap-2 h-full'>
        <h1>
          {message}
        </h1>
        {
          redeem && (
            <Button onClick={reclaimFunds}>
              Reclaim funds
            </Button>
          )
        }
    </div>
  )
}

export default Page;