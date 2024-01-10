"use client"
import detectEthereumProvider from '@metamask/detect-provider';
import React, { FC, useEffect, useState } from 'react'
import { 
  useRouter
 } from 'next/navigation'
import Web3 from 'web3';
import RPSLS from '../../contracts/RPS.json'
import { toast } from 'sonner';
import { getGameState } from '../utils/utils';

const Page = ({params}:{params:{id:string}}) => {
  const [provider, setProvider] = useState<any>(null);
  const [gameContract, setGameContract] = useState<any>(null)
  const router = useRouter()

const checkIfContract = async (address: string) => {

  const detectedProvider = await detectEthereumProvider();
  if (detectedProvider) {
    setProvider(detectedProvider)
  } else {
    toast.message('Please install metamask',{
      description: 'redirecting you to home page',
      onAutoClose(toast) {
        router.push('/')
      },
    })
  }
  const web3 = new Web3((window as any)?.ethereum);
  try {
    const code = await web3.eth.getCode(address);
    if (code === '0x') {
      alert('This is not a contract address');
      router.replace('/')
    } else {
      const contract = new web3.eth.Contract(RPSLS.abi, address);
      // checkUser(contract)
      // checkGameData(contract)
      checkStatus(contract)
      console.log('This is a contract address');
      setGameContract(contract)
    }
  } catch (error) {
    // alert('This is not a contract address');
    toast.message('This is not a valid contract address',{
      description: 'redirecting you to home page',
      onAutoClose(toast) {
        router.push('/')
      },
    })
    // router.replace('/')
  }
  
}

useEffect(() => {
    checkIfContract(params.id)
}, [])

const checkUser = async (contract:any) => {

  try {
    const web3 = new Web3((window as any)?.ethereum);
    const accounts = await web3.eth.getAccounts();
    console.log(contract);
    const owner = await contract.methods.j1().call();
    if(accounts[2] === owner){
      return 
    }else{
      toast.message('You do not have access to the game',{
        description: 'redirecting you to home page',
        onAutoClose(toast) {
          router.push('/')
        },
      })
    }
  } catch (error) {
    console.log(error);
    
  }
 
}

//checkGameData take the data from local storage and check if the game is over
const checkGameData = async (contract:any) => {
  const gameData = getGameState()

  if(!gameData.contractAddress || !gameData.move || !gameData.salt){
    toast.message('Game Data missing!',{
      description: 'redirecting you to home page',
      onAutoClose(toast) {
        router.push('/')
      },
    })
  }

  if(gameData.contractAddress !== params.id){
    toast.message('Game Data stored does not match the contract address',{
      description: 'redirecting you to home page',
      onAutoClose(toast) {
        router.push('/')
      },
    })
  }



}

const checkStatus = async (contract:any) => {
  console.log(contract);
  const web3 = new Web3((window as any)?.ethereum);
  const stake = await contract.methods.stake().call()
  const stakeEther = web3.utils.fromWei(stake, 'ether');
  console.log(stakeEther);
  
  if(stakeEther === '0.'){
    toast.message('Game over stake has been redeemed',{
      description: 'redirecting you to home page',
      onAutoClose(toast) {
        router.push('/')
      },
    })
  }
}


  const noOwner = () => {
    return (
      <div className='flex flex-col items-center w-full h-full justify-center space-y-4'>
        <h1 className='text-3xl'>You do not have access to this game</h1>
        <h2 className='text-xl'>Please create a new game</h2>
      </div>
    
    )
  }


  const noProvider = () => {
    return (
      <div className='flex flex-col items-center w-full h-full justify-center space-y-4'>
        <h1 className='text-3xl'>Please connect to MetaMask</h1>
        <h2 className='text-xl'>Refresh after connecting to the wallet</h2>
      </div>
    
    )
  }

  const loading = () => {
    return (
      <div className='flex flex-col items-center w-full h-full justify-center space-y-4'>
        <h1 className='text-3xl'>Loading...</h1>
      </div>
    
    )
  }

  return (
    <div>
      {/* {provider?noOwner():noProvider()} */}
      {loading()}
    </div>
  )
}

export default Page;
