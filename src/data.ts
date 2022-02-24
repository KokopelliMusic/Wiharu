import { PlaylistWithSongsType } from 'sipapu/dist/src/services/playlist'
import { SessionSettings } from 'sipapu/dist/src/services/session'

export type SpotifyToken = {
  accessToken: string
  refreshToken: string
}

export type Weights = Map<string, number>

export type Weight = number

const DEFAULT_WEIGHT = 10

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

export const saveSpotify = (token: SpotifyToken) => {
  localStorage.setItem('sipapu:spotify', JSON.stringify(token))
}

export const getSpotify = (): SpotifyToken => {
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
export const saveWeight = (playlist: PlaylistWithSongsType, user: string, weight: Weight): void => {
  let weights = getWeights(playlist)

  if (Array.from(weights.keys()).length === 0) {
    // If the weights are empty, we need to initialize them
    weights = initWeights(playlist)
  }

  weights.set(user, weight)
  
  localStorage.setItem('sipapu:weights', JSON.stringify(Array.from(weights.entries())))
}

export const saveWeights = (weights: Weights): void => {
  localStorage.setItem('sipapu:weights', JSON.stringify(Array.from(weights.entries())))
}

export const decrementWeight = (playlist: PlaylistWithSongsType, user: string): void => {
  saveWeight(playlist, user, getWeight(playlist, user) - 1)
}

const initWeights = (playlist: PlaylistWithSongsType): Weights => {
  const weights = new Map<string, number>()

  playlist.users.forEach(user => {
    weights.set(user, DEFAULT_WEIGHT)
  })

  return weights
}

export const getWeights = (playlist: PlaylistWithSongsType): Weights => {
  const w = localStorage.getItem('sipapu:weights')
  let weights
  
  if (!w) {
    weights = initWeights(playlist)
  } else {
    weights = new Map<string, number>(JSON.parse(w))
  }

  return weights
}

export const getWeight = (playlist: PlaylistWithSongsType, user: string): Weight => {
  const weights = getWeights(playlist)
  return weights.get(user) || DEFAULT_WEIGHT
}

export const savePlaylist = (playlist: PlaylistWithSongsType): void => {
  localStorage.setItem('sipapu:playlist', JSON.stringify(playlist))
}

export const getPlaylist = (): PlaylistWithSongsType => {
  const playlist = localStorage.getItem('sipapu:playlist')
  return playlist ? JSON.parse(playlist) : {}
}