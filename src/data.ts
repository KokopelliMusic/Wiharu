import { EventTypeEnum, Song, SessionSettings, Spotify, Session, SongTypeEnum } from 'sipapu-2'

export type Weights = Map<string, number>

export type Weight = number

const DEFAULT_WEIGHT = 10

export const incrementPlayCount = (session: Session, song: Song) => {
  if (song.song_type === SongTypeEnum.Event) {
    return
  }

  fetch(process.env.REACT_APP_TAWA_URL + 'song/increment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      session_id: session.$id,
      song_id: song.$id 
    })
  })
}

export const setCurrentlyPlaying = (session: Session, song: Song, userId: string) => {
  const perm = [`team:${session.$id}`, `user:${userId}`]
  
  window.db.updateDocument('session', session.$id, {
    currently_playing: JSON.stringify(song)
  })
}

export const emitEvent = (eventType: EventTypeEnum, sessionId: string, userId: string, payload: any) => {
  const event = { 
    session_id: sessionId,
    user_id: userId,
    event: {
      type: eventType,
      session_id: sessionId,
      payload: JSON.stringify(payload)
    }
  }

  console.log('Emitting event: ', event)

  fetch(process.env.REACT_APP_TAWA_URL + 'session/emit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(event)
  })
    .then(res => res.json())
    .then(console.log)
    .catch(console.error)
}

type UsernameResponse = {
  status: number
  users: string[]
}

export const getUsernamesFromCurrentSession = (session: Session): Promise<UsernameResponse> => {
  return fetch(process.env.REACT_APP_TAWA_URL + 'session/usernames', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      session_id: session.$id
    })
  }).then(res => res.json())
}

export const saveSettings = (settings: SessionSettings) => {
  localStorage.setItem('sipapu:settings', JSON.stringify(settings))
}

export const getSettings = (): SessionSettings => {
  const settings = localStorage.getItem('sipapu:settings')
  return settings ? JSON.parse(settings) : {}
}

export const saveCode = (code: string) => {
  localStorage.setItem('sipapu:code', code)
}

export const getCode = (): string => {
  return localStorage.getItem('sipapu:code') || ''
}

export const saveSpotify = (token: Spotify) => {
  localStorage.setItem('sipapu:spotify', JSON.stringify(token))
}

export const getSpotify = (): Spotify => {
  const token = localStorage.getItem('sipapu:spotify')
  return token ? JSON.parse(token) : {}
}

export const saveUid = (uid: string) => {
  localStorage.setItem('sipapu:uid', uid)
}

export const getUid = (): string => {
  return localStorage.getItem('sipapu:uid') || ''
}

/**
 * Save the weights for the users into localStorage
 * @param playlist The playlist which is used to calculate the weights
 * @param user The user to update the weights for
 * @param weight The new weight for the user
 * 
 */
export const saveWeight = (session: Session, user: string, weight: Weight): void => {
  let weights = getWeights(session)

  if (Array.from(weights.keys()).length === 0) {
    // If the weights are empty, we need to initialize them
    weights = initWeights(session)
  }

  weights.set(user, weight)
  
  localStorage.setItem('sipapu:weights', JSON.stringify(Array.from(weights.entries())))
}

export const saveWeights = (weights: Weights): void => {
  localStorage.setItem('sipapu:weights', JSON.stringify(Array.from(weights.entries())))
}

export const decrementWeight = (session: Session, user: string): void => {
  saveWeight(session, user, getWeight(session, user) - 1)
}

const initWeights = (session: Session): Weights => {
  const weights = new Map<string, number>()

  session.users.forEach(user => {
    weights.set(user, DEFAULT_WEIGHT)
  })

  return weights
}

export const getWeights = (session: Session): Weights => {
  const w = localStorage.getItem('sipapu:weights')
  let weights
  
  if (!w) {
    weights = initWeights(session)
  } else {
    weights = new Map<string, number>(JSON.parse(w))
  }

  return weights
}

export const getWeight = (session: Session, user: string): Weight => {
  const weights = getWeights(session)
  return weights.get(user) || DEFAULT_WEIGHT
}

export const savePlaylist = (playlist: Song[]): void => {
  localStorage.setItem('sipapu:playlist', JSON.stringify(playlist))
}

export const getPlaylist = (): Song[] => {
  const playlist = localStorage.getItem('sipapu:playlist')
  return playlist ? JSON.parse(playlist) : {}
}