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
import { toast } from 'sonner'
import Web3 from 'web3'
import Hasher from '../../contracts/Hasher.json'
import RPSLSContract from '../../contracts/RPS.json'

const createGameSchema = z.object({
  stake: z.number(),
  player2Address: z.string(),
  move: z.enum(['rock', 'paper', 'scissors', 'lizard', 'spock']),
})

const Page = () => {
  const [salt, setSalt] = useState('')

  const form = useForm<z.infer<typeof createGameSchema>>({
    resolver: zodResolver(createGameSchema),
    defaultValues: {
      stake: 0,
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
            // const hasherContractAddress = hashInstance.options.address;

            const generateSaltUint256 = (): string => {
              const randomValues = new Uint32Array(8);
              window.crypto.getRandomValues(randomValues);
              const saltUint256 = randomValues.reduce((acc, value) => acc + value.toString(16).padStart(8, '0'), '');
              return `0x${saltUint256}`;
            };

            const generatedSalt = generateSaltUint256();
            setSalt(salt.toString())
            console.log(salt);
            
            // const hasherContract = new web3.eth.Contract(Hasher.abi, hasherContractAddress);
          
            // const generateMoveHash = async (move: number, salt: number) => {
            //     return await hasherContract.methods.hash(move, salt).call();
            // }
          
            // const hashedMove = generateMoveHash(moveValue, generatedSalt); 
          //   const RPSLS = new web3.eth.Contract(RPSLSContract.abi);
          //   const rpslsInstance = await RPSLS.deploy({
          //     data: RPSLSContract.bytecode,
          //     arguments: [hashedMove, values.player2Address]
          // })
          //     .send({ from: accounts[0], value: web3.utils.toWei(values.stake, 'ether') });
              // saveGame(generatedSalt,values.move,rpslsInstance.options.address)
              // router.push(`/${rpslsInstance.options.address}`)
          }
            
            
          console.log("here");
          
        } catch (error) {
          toast(error.message)
          
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
