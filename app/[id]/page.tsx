"use client"
import detectEthereumProvider from '@metamask/detect-provider';
import React, { FC, useEffect, useState } from 'react'
import {
  useRouter
} from 'next/navigation'
import Web3 from 'web3';
import RPSLS from '../../contracts/RPS.json'
import { toast } from 'sonner';
import { getGameState, moveMap, resetGame } from '../utils/utils';
import { Button } from '@/components/ui/button';

const Page = ({ params }: { params: { id: string } }) => {
  const [provider, setProvider] = useState<any>(null);
  const [gameContract, setGameContract] = useState<any>(null)
  const [allowUserTimeout, setAllowUserTimeout] = useState<any>(false)
  const web3 = new Web3((window as any)?.ethereum);
  const timeout = 300

  const [salt, setSalt] = useState<any>(null)
  const [move, setMove] = useState<any>(null)
  const [message, setMessage] = useState('loading...')
  const [disabled, setDisabled] = useState(false)

  const [player2Played, setPlayer2Played] = useState(false)
  const router = useRouter()


  const checkPlayer2Move = async (contract: any) => {
    const interval = setInterval(async () => {
      try {
        const [lastAction, player2Move] = await Promise.all([
          contract.methods.lastAction().call(),
          contract.methods.c2().call()
        ]);
        
        if (Number(player2Move) !== 0) {
          setMessage('Player 2 has played, you can reveal your move')
          setPlayer2Played(true)
          clearInterval(interval);
          return
        }
        else if (BigInt(Math.floor(Date.now() / 1000)) > BigInt(parseInt(lastAction) + timeout)) {
          setAllowUserTimeout(true)
          setMessage('Player 2 has not played in the last 5 minutes, you can reclaim your funds')
          clearInterval(interval);
          return
        }
        setMessage('Waiting for player 2 to play...')
      } catch (error) {
        toast.message((error as Error).message)
      }
    }, 5000)

  }

  const reclaimFunds = async () => {
    try {
      setDisabled(true)
      await provider.request({ method: 'eth_requestAccounts' });
      const accounts = await web3.eth.getAccounts();
      const loading = toast.loading('Reclaiming funds...', {
        duration: 1000000
      })
      await gameContract.methods.j2Timeout().send({ from: accounts[0] });
      toast.success('Funds recovered successfully', {
        description: 'redirecting you to home page',
        onAutoClose: () => {
          toast.dismiss(loading)
          resetGame()
          router.push('/')
        }
      })
    } catch (error) {
      toast.error('Something went wrong')
      setDisabled(false)
    }
  }


  const fetchContract = async (address: string) => {
    const detectedProvider = await detectEthereumProvider();
    if (detectedProvider) {
      setProvider(detectedProvider)
    } else {
      toast.message('Please install metamask', {
        description: 'redirecting you to home page',
        onAutoClose() {
          router.push('/')
        },
      })
    }
    try {
      const code = await web3.eth.getCode(address);
      if (code === '0x') {
        toast.message('This is not a valid contract address', {
          description: 'redirecting you to home page',
          onAutoClose() {
            router.push('/')
          },
        })
      } else {
        const contract = new web3.eth.Contract(RPSLS.abi, address);
        setGameContract(contract)
      }
    } catch (error) {
      toast.message('This is not a valid contract address', {
        description: 'redirecting you to home page',
        onAutoClose(toast) {
          router.push('/')
        },
      })
    }

  }

  useEffect(() => {
    fetchContract(params.id)
  }, [])

  useEffect(() => {
    if (gameContract) {
      fetchData()
    }
  }, [gameContract])

  const fetchData = async () => {
    try {
      const isUser = await checkUser(gameContract)
      if (!isUser) return
      const gameDataPresent = await checkGameData()
      if (!gameDataPresent) return
      const stake = checkStake(gameContract)
      if (!stake) return
      checkPlayer2Move(gameContract)
    } catch (error) {
      toast.error('Something went wrong',
        {
          description: 'redirecting you to home page',
          onAutoClose() {
            router.push('/')
          },
        }
      )
    }

  }

  const checkUser = async (contract: any) => {
    try {
      const accounts = await web3.eth.getAccounts();
      const owner = await contract.methods.j1().call();
      if (accounts[0] === owner) {
        return true
      } else {
        toast.message('You do not have access to the game', {
          description: 'redirecting you to home page',
          onAutoClose() {
            router.push('/')
          },
        })
        return false
      }
    } catch (error) {
      toast.error('Something went wrong',
        {
          description: 'redirecting you to home page',
          onAutoClose() {
            router.push('/')
          },
        }
      )
      return false
    }

  }

  const checkGameData = async () => {
    const gameData = getGameState()
    if (!gameData.contractAddress || !gameData.move || !gameData.salt) {
      toast.message('Game Data missing!', {
        description: 'redirecting you to home page',
        onAutoClose(toast) {
          router.push('/')
        },
      })
      return false
    }

    if (gameData.contractAddress !== params.id) {
      toast.message('Game Data stored does not match the contract address', {
        description: 'redirecting you to home page',
        onAutoClose() {
          router.push('/')
        },
      })
      return false
    }

    setMove(gameData.move)
    setSalt(gameData.salt)
    return true
  }

  const checkStake = async (contract: any) => {
    const stake = await contract.methods.stake().call()
    if (Number(stake) === 0) {
      toast.message('Game over stake has been redeemed', {
        description: 'redirecting you to home page',
        onAutoClose() {
          router.push('/')
        },
      })
      return false
    }
    return true
  }


  const revealMove = async () => {
    try {
      setDisabled(true)
      await provider.request({ method: 'eth_requestAccounts' });
      const web3 = new Web3((window as any)?.ethereum);
      const accounts = await web3.eth.getAccounts();
      const moveValue = moveMap[move as keyof typeof moveMap];
      const loading = toast.loading('Checking winner...', {
        duration: 100000
      })
      await gameContract.methods.solve(Number(moveValue),salt).send({ from: accounts[0] })      
      const player2Move = await gameContract.methods.c2().call()
      
      if (Number(moveValue) === Number(player2Move)) {
        toast.message('Game has ended in a tie', {
          onAutoClose() {
            toast.dismiss(loading)
            resetGame()
            router.push('/')
          },
        })
        return
      }
      const winner = await gameContract.methods.win(moveValue, player2Move).call()
      toast.dismiss(loading)
      if (winner) {
        toast.message('Congratulations! You have won', {
          onAutoClose(toast) {
            resetGame()
            router.push('/')
          },
        })
      } else {
        toast.message(':((( You have lost, try again!', {
          onAutoClose(toast) {
            resetGame()
            router.push('/')
          },
        })
      }

    } catch (error: any) {
      toast.message(error.message)
      console.log(error);
      setDisabled(false)
    }
  }



  return (
    <div className=' h-full flex flex-col justify-center items-center gap-2'>
      <h1>
        {message}
      </h1>
      {
        allowUserTimeout && (
          <Button disabled={disabled} onClick={reclaimFunds}>
            Recover your funds
          </Button>
        )
      }
      {
        player2Played && (
          <Button disabled={disabled} onClick={revealMove}>Reveal your move</Button>
        )
      }
    </div>
  )
}

export default Page;
