import React from 'react'

const FullscreenLoading = () => {
  return <div className="min-h-screen min-w-screen flex items-center justify-center flex-col bg-gray-100">
    <img 
      className="animate-bounce object-contain h-52" 
      src="/kokopelli.png" 
      alt="Kokopelli Logo"/>
    <h1 className="text-3xl font-extrabold text-gray-900">
      Loading...
    </h1>
  </div>
}

export default FullscreenLoading