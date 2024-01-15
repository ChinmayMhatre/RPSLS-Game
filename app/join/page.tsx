"use client"
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import Web3 from 'web3'
import z from 'zod'
import RPSLS from '../../contracts/RPS.json'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import detectEthereumProvider from '@metamask/detect-provider'
import { moveMap } from '../utils/utils'

const joinGameSchema = z.object({
  contractAddress: z.string().min(42).max(42),
  move: z.enum(['null', 'rock', 'paper', 'scissors', 'lizard', 'spock']),
})

const Page = () => {
  const router = useRouter()

  const form = useForm<z.infer<typeof joinGameSchema>>({
    resolver: zodResolver(joinGameSchema),
    defaultValues: {
      contractAddress: '',
      move: 'rock',
    },
  })

  const joinGame = async (data: z.infer<typeof joinGameSchema>) => {
    const provider: any = await detectEthereumProvider();

    try {
      await provider?.request({ method: 'eth_requestAccounts' });
      const web3 = new Web3((window as any)?.ethereum);
      const accounts = await web3.eth.getAccounts();
      const contract = new web3.eth.Contract(RPSLS.abi, data.contractAddress);
      const stake:any = await contract.methods.stake().call();
      const lastAction: any = await contract.methods.lastAction().call();
      if (BigInt(Math.floor(Date.now() / 1000)) > BigInt(parseInt(lastAction) + 300000)) {
        toast.error('Game has timed out')
        return;
      }
      const moveValue:any = moveMap[data.move as keyof typeof moveMap];
      await contract.methods.play(moveValue).send({ from: accounts[0], value: stake });
      toast.success('Move played successfully', {
        onAutoClose: () => {
          router.push('/' + data.contractAddress)
        }
      })
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  const onSubmit = async (values: z.infer<typeof joinGameSchema>) => {
    const web3 = new Web3((window as any)?.ethereum);
    try {
      const accounts = await web3.eth.getAccounts();
      const code = await web3.eth.getCode(values.contractAddress);
      if (code == '0x') {
        toast.error('Contract does not exist')
        return;
      }
      const contract = new web3.eth.Contract(RPSLS.abi, values.contractAddress);
      const c2 = await contract.methods.c2().call();
      const j2: any = await contract.methods.j2().call();
      if (j2 != accounts[0]) {
        toast.error('You do not have access to this game!')
        return
      }
      if (Number(c2) != 0) {
        toast.error('Move already played', {
          onAutoClose: () => {
            router.push('/' + values.contractAddress)
          }
        })
        return
      }
      joinGame(values)

    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  return (
    <div>
      <div className="md:max-w-[70%] mx-auto">
        <Form {...form}>
          <form className='space-y-8' onSubmit={form.handleSubmit(onSubmit)}>
            <FormField control={form.control} name="contractAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract address</FormLabel>
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
                    <Select {...field}>
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
            <Button type='submit' className='w-full'>Join Game</Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default Page