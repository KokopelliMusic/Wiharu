import React, { useEffect, useState } from 'react'
import SpotifyWebPlayback from 'react-spotify-web-playback-sdk-headless'
import { PlaylistWithSongsType } from 'sipapu/dist/src/services/playlist'
import { SessionType } from 'sipapu/dist/src/services/session'
import FullscreenLoading from './FullscreenLoading'

interface EventHandlerProps {
  spotifyPlayer: React.RefObject<SpotifyWebPlayback>
  playlist: PlaylistWithSongsType
  session: SessionType
}

const EventHandler = (props: EventHandlerProps) => {

  const [event, setEvent] = useState<React.ReactNode>(<FullscreenLoading />)

  useEffect(() => {

    // Once loaded, sealect the first event
    selectNextEvent()
  }, [])

  const selectNextEvent = (): void => {
    setEvent(<div>Event</div>)
  }

  return <div id="EventHandler">
    {event}
  </div>
}

export default EventHandler