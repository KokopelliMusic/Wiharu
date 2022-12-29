/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useEffect, useState } from 'react'
import { Session, Song } from 'sipapu-2'

interface SpotifyEventProps {
  song: Song
  session: Session
  paused: boolean
}


const SpotifyEvent = (props: SpotifyEventProps) => {

  const [progressInterval, setProgressInterval] = useState<number | undefined>(undefined)
  const [progress, setProgress]                 = useState<number>(0)
  
  useEffect(() => {
    return () => clearInterval(progressInterval)
  }, [])

  useEffect(() => {
    if (props.song) {
      setProgress(0)
    }

    if (progressInterval === undefined) {
      makeInterval(1000)
    }
  }, [props.song])

  useEffect(() => {
    console.log('WTF', props.paused)
    if (props.paused) {
      clearInterval(progressInterval)
      setProgressInterval(undefined)
    }
  }, [props.paused])

  useEffect(() => {
    if (progress === 0) return

    const length = props.song.length
    const maxProgress = length - (length % 1000)
    if (progress >= maxProgress) {
      clearInterval(progressInterval)
      setProgressInterval(undefined)
    }
  }, [progress])

  const makeInterval = (increment: number) => {
    setProgressInterval(window.setInterval(() => setProgress(p => p + increment), 1000))
  }

  return <div 
    className="h-screen font-player bg-indigo-900 text-white" 
    style={{ 
      transition: 'all .5s ease',
      WebkitTransition: 'all .5s ease',
      MozTransition: 'all .5s ease'
    }}>
    <div className="grid grid-cols-9">

      <div className="col-span-5">
        <div className="grid grid-rows-6 h-screen">

          <div className="row-span-1">
            {/* <div className="text-red-500 pl-20 pt-12 text-4xl">
              {props.code}
            </div> */}
          </div>

          <div className="row-span-4 flex flex-col justify-center items-center">
            <div>
              <img 
                className="rounded-3xl shadow-2xl-white"     
                src={props.song.cover} 
                crossOrigin="anonymous"
                alt="cover" />
            
              <div className="flex pt-6">
              
                <div className="w-16 text-xl">
                  {formatTime(progress)}
                </div>
                  
                <div className="flex-grow">
                  <div className="pt-3">
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-red-200">
                      <div style={{ width: calcTimeStyle(progress, props.song.length!) }} 
                        className="shadow-none flex flex-col text-center whitespace-nowrap justify-center bg-red-500" />
                    </div>
                  </div>
                </div>

                  
                <div className="w-16 text-xl text-right">
                  {formatTime(props.song.length!)}
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="col-span-4 grid grid-rows-6">
        <div />


        <div className="row-span-3 pt-20">
          <div className="text-7xl">
            {props.song.title}
          </div>

          <div className="pt-3 pl-1.5 text-5xl text-red-500">
            {props.song.artists}
          </div>
          <div className="pt-3 pl-2 text-2xl">
            Added by <span className="text-red-500">{props.song.user_name}</span> 
          </div>
          <div className="pt-4 pl-2 text-2xl">
            Code <span className="text-red-500">{props.session.$id}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
}

const calcTimeStyle = (time: number, length: number) => {
  const percent = time / (length - 1000)
  return `${percent * 100}%`
}

const formatTime = (time: number) => {
  const date = new Date(time)
  return `${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const pad = (num: number) => {
  return num.toString().padStart(2, '0')
}

export default SpotifyEvent