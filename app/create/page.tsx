"use client"
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'

const createGameSchema = z.object({
  stake: z.number(),
  player2Address: z.string().min(42).max(42),
  move: z.enum(['rock', 'paper', 'scissors', 'lizard', 'spock']),
})

const Page = () => {

  const form = useForm<z.infer<typeof createGameSchema>>({
    resolver: zodResolver(createGameSchema),
    defaultValues: {
      stake: 0,
      player2Address: '',
      move: 'rock',
    },
  })

  const onSubmit = (values: z.infer<typeof createGameSchema>) => {
    console.log(values)
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