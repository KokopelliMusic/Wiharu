import { SessionSettings } from 'sipapu/dist/src/services/session'

export type SpotifyToken = {
  accessToken: string
  refreshToken: string
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

