import React, { FC } from 'react'

interface PageProps {
  
}

const Page: FC<PageProps> = ({  }) => {

  const noOwner = () => {
    return (
      <div className='flex flex-col items-center w-full h-full justify-center space-y-4'>
        <h1 className='text-3xl'>You do not have access to this game</h1>
        <h2 className='text-xl'>Please create a new game</h2>
      </div>
    
    )
  }

  return (
    <div>
      {noOwner()}
    </div>
  )
}

export default Page;