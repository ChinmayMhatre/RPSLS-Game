"use client"
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Web3 from 'web3'
import detectEthereumProvider from '@metamask/detect-provider'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Hasher from '../../contracts/Hasher.json'
import RPSLSContract from '../../contracts/RPS.json'
import { generateSaltUint256, moveMap, resetGame, saveGame } from '../utils/utils'

const createGameSchema = z.object({
  stake: z.string(),
  player2Address: z.string().min(42).max(42),
  move: z.enum(['rock', 'paper', 'scissors', 'lizard', 'spock']),
})

const Page = () => {
  let loading:any
  const router = useRouter()
  const [disable, setDisable] = useState(false)

  const form = useForm<z.infer<typeof createGameSchema>>({
    resolver: zodResolver(createGameSchema),
    defaultValues: {
      stake: '0',
      player2Address: '',
      move: 'rock',
    },
  })

  const onSubmit = async (values: z.infer<typeof createGameSchema>) => {
    setDisable(true)
    resetGame()
    const provider:any = await detectEthereumProvider();
    if (!provider) {
      toast.error('Please install metamask')
      setDisable(false)
      return;
    }

    if(Number(values.stake) <= 0) {
      toast.error('Stake amount should be greater than 0')
      setDisable(false)
      return;
    }

    try {
      await provider.request({
        method: 'eth_requestAccounts',
      });
      const web3 = new Web3((window as any)?.ethereum);
      const accounts = await web3.eth.getAccounts();
      const moveValue = moveMap[values.move]
      let chain = await web3.eth.getChainId();

      if (chain != BigInt(5)) {
        await web3.currentProvider?.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x5' }],
        })
      }
      if (chain === BigInt(5)) {
        const hasherContractAddress = '0x8013F929F90B929ACB0E30fcE200af4Bc17F9634';

        const generatedSalt = generateSaltUint256();

        const hasherContract: any = new web3.eth.Contract(Hasher.abi, hasherContractAddress);

        const generateMoveHash = async (move: number, salt: string) => {
          return await hasherContract.methods.hash(move, salt).call();
        }

        const hashedMove: any = await generateMoveHash(moveValue, generatedSalt);

        const RPSLS: any = new web3.eth.Contract(RPSLSContract.abi);
          loading = toast.loading('Creating game...',
          {
            duration: 1000000
          }
        )
        const rpslsInstance = await RPSLS.deploy({
          data: RPSLSContract.bytecode,
          arguments: [hashedMove, values.player2Address]
        })
          .send({ from: accounts[0], value: web3.utils.toWei(values.stake, 'ether'), gas: 1000000 });
        saveGame(generatedSalt, values.move, rpslsInstance.options.address)
        toast.success(`Game created successfully at ${rpslsInstance.options.address} `, {
          description: 'redirecting you to the game page',
          onAutoClose: () => {
            toast.dismiss(loading)
            router.push(`/${rpslsInstance.options.address}`)
          }
        })
      }
    } catch (error) {
      toast.dismiss(loading)
      toast((error as Error).message);
      console.log(error);
      setDisable(false)
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
                  <FormMessage />
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="move"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Move</FormLabel>
                  <FormControl>
                    <Select {...field} onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder='select a move' />
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={disable} type='submit'>Create Game</Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default Page