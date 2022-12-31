import React from 'react'
import Wheel from '../components/Wheel'
import { cache } from '../data/cache'
import { Playlist, Song, User } from '../types/tawa'

const WAIT_TIME = 30_000

export const getAdtRadSong = (playlistID: number) => {
  const added_by: User = {
    id: -1,
    username: 'Kokopelli',
    profile_picture: process.env.PUBLIC_URL + '/kokopelli.png'
  }
  
  const songs: Song[] = [
    // {
    //   id: '-1',
    //   title: 'Bier',
    //   artists: 'Steen',
    //   album: 'De Vader',
    //   length: 225053,
    //   cover: 'https://i.scdn.co/image/ab67616d0000b273f3566be24be3b427abf48d2d',
    //   added_by,
    //   song_type: 'spotify',
    //   platform_id: 'spotify:track:4cCL2ohDQEOV1qMeEoUwma',
    //   playlist_id: playlistID
    // },
    {
      id: -1,
      title: 'Atje voor de Sfeer',
      artists: 'Rene Karst',
      album: 'Atje voor de Sfeer - En Andere Sfeermakers',
      length: 198222,
      cover: 'https://i.scdn.co/image/ab67616d0000b273437e84d6f118fe0ef8e17af8',
      added_by,
      song_type: 'spotify',
      platform_id: 'spotify:track:2bJaewMbxlwnm69zvOAq3s',
      playlist_id: playlistID,
      play_count: 0
    }
  ]

  return songs[0]
}

interface AdtRadEventProps {
  playlist: Playlist
}

const AdtRadEvent = ({ playlist }: AdtRadEventProps) => {

  return <div className="w-screen h-screen flex justify-center">
    <Wheel timeout={WAIT_TIME} items={cache.get<User[]>('users')!.map(u => u.username)} />
  </div>
}

export default AdtRadEvent