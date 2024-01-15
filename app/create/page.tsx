"use client"
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { moveMap, resetGame, saveGame } from '../utils/utils'
import detectEthereumProvider from '@metamask/detect-provider'
import { MetaMaskEthereumProvider } from '@metamask/providers';
import {useRouter} from 'next/navigation'
import { toast } from 'sonner'
import Web3 from 'web3'
import Hasher from '../../contracts/Hasher.json'
import RPSLSContract from '../../contracts/RPS.json'

const createGameSchema = z.object({
  stake: z.string(),
  player2Address: z.string(),
  move: z.enum(['rock', 'paper', 'scissors', 'lizard', 'spock']),
})

const Page = () => {
  const router = useRouter()
  const [salt, setSalt] = useState('')

  const form = useForm<z.infer<typeof createGameSchema>>({
    resolver: zodResolver(createGameSchema),
    defaultValues: {
      stake: '0',
      player2Address: '',
      move: 'rock',
    },
  })

  const onSubmit = async (values: z.infer<typeof createGameSchema>) => {
    console.log(values)
    resetGame()
    const provider:MetaMaskEthereumProvider = await detectEthereumProvider();
        if (!provider) {
            toast.error('Please install metamask')
            return;
        }
        try {
            await provider.request({
            method: 'eth_requestAccounts',
          });
          const web3 = new Web3((window as any)?.ethereum);
            const accounts = await web3.eth.getAccounts();
            console.log(accounts);
            const moveValue = moveMap[values.move]
            console.log(moveValue);
            let chain = await web3.eth.getChainId();
            
            if(chain != BigInt(5)){
              await web3.currentProvider?.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x5' }],
              })
            }
            

            if (chain === BigInt(5)) {
            //   const HasherContract = new web3.eth.Contract(Hasher.abi);
            //   const hashInstance = await HasherContract.deploy({
            //     data: Hasher.bytecode,
            //   }).send({
            //     from: accounts[2],
            //   });
            const hasherContractAddress = '0x8013F929F90B929ACB0E30fcE200af4Bc17F9634';

            // const generateSaltUint256 = (): string => {
            //   const randomValues = new Uint32Array(8);
            //   window.crypto.getRandomValues(randomValues);
            //   const saltUint256 = randomValues.reduce((acc, value) => acc + value.toString(16).padStart(8, '0'), '');
            //   return BigInt(`0x${saltUint256}`).toString();
            // };

            const generateSaltUint256 = ()=>{
              const byteCount = 32; // 256 bits
              const randomBytes = new Uint8Array(byteCount);
              window.crypto.getRandomValues(randomBytes);
          
              // Convert the byte array to a big integer string
              let salt = '';
              for (let i = 0; i < randomBytes.length; i++) {
                  salt += ('00' + randomBytes[i].toString(16)).slice(-2);
              }
              /* global BigInt */
              return BigInt(`0x${salt}`).toString();
          }            

            const generatedSalt = generateSaltUint256();
            setSalt(generatedSalt)
            console.log(generatedSalt);
            
            const hasherContract:any = new web3.eth.Contract(Hasher.abi, hasherContractAddress);
          
            const generateMoveHash = async (move: number, salt: number) => {
                return await hasherContract.methods.hash(move, salt).call();
            }
          
            const hashedMove:any = await generateMoveHash(moveValue, generatedSalt); 
            console.log("hash",hashedMove);
            
            const RPSLS:any = new web3.eth.Contract(RPSLSContract.abi);
            const rpslsInstance = await RPSLS.deploy({
              data: RPSLSContract.bytecode,
              arguments: [hashedMove, values.player2Address]
          })
              .send({ from: accounts[0], value: web3.utils.toWei(values.stake, 'ether') , gas: 1000000});
              saveGame(generatedSalt,values.move,rpslsInstance.options.address)
              toast.success(`Game created successfully at ${rpslsInstance.options.address} ` , {
                description: 'redirecting you to the game page',
                onAutoClose: () => {
                  router.push(`/${rpslsInstance.options.address}`)
                }
              })
              console.log(rpslsInstance.options.address);
          }
            
          console.log("here");
          
        } catch (error) {
          toast(error.message)
          console.log(error);
          
        }
  }

  return (
    <div>
      <div className="md:max-w-[70%] mx-auto">
        <Form {...form}>
            <form className='space-y-8' onSubmit={form.handleSubmit(onSubmit)}>
              <FormField control={form.control} name="stake"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stake amount for the game</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter the amount' />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
              />
              <FormField control={form.control} name="player2Address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Player 2 address</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter the address' />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
              />
              <FormField control={form.control} name="move"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Move</FormLabel>
                  <FormControl>
                    <Select {...field}>
                      <SelectTrigger>
                          <SelectValue placeholder='select a move'/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='rock'>Rock</SelectItem>
                        <SelectItem value='paper'>Paper</SelectItem>
                        <SelectItem value='scissors'>Scissors</SelectItem>
                        <SelectItem value='lizard'>Lizard</SelectItem>
                        <SelectItem value='spock'>Spock</SelectItem>
                      </SelectContent>
                    </Select>

                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
              />
              <Button type='submit'>Create Game</Button>
            </form>
        </Form>
      </div>
    </div>
  )
}

export default Page

function generateMoveHash(moveValue: number, generatedSalt: string) {
  throw new Error('Function not implemented.')
}
