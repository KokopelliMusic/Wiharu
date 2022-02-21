import React from 'react'
import { Event } from 'sipapu/dist/src/events'
import { SongType } from 'sipapu/dist/src/services/song'

interface SpotifyEventProps {
  song: SongType
  event: Event
}

const SpotifyEvent = (props: SpotifyEventProps) => {

  return <div>
    Spotify
    <h1>
      {props.song.title}
    </h1>
  </div>
}