import { PlaylistWithSongsType } from 'sipapu/dist/src/services/playlist'
import { SongType } from 'sipapu/dist/src/services/song'

/**
 * Shuffle the events according to the 'Random' algorithm
 * This is shit
 */
export const shuffleRandomWithoutEvents = (playlist: PlaylistWithSongsType): SongType[] => {
  const shuffled = knuthShuffle(playlist.songs)

  return shuffled
}

export const classicShuffle = (playlist: Playlist): SongType[] => {
  // TODO
}

/**
 * Zelf code schrijven man man man
 * https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 * https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 */
function knuthShuffle<T>(array: T[]): T[] {
  let currentIndex = array.length
  let randomIndex

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // and swap it with the current element
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
  }

  return array
}