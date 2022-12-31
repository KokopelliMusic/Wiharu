// oh god ik schrijf test cases 

import { randomAlgorithm, weightedSongAlgorithm } from './shuffle'
import { playlist_20, playlist_5 } from './data.test'
import { instanceOfSong, Song } from '../types/tawa'


const isArrayUnique = (arr: Array<unknown>) => Array.isArray(arr) && new Set(arr).size === arr.length

test('random algorithm shuffles 20 songs', () => {
  const songs = playlist_20.songs as unknown as Song[]
  const queue = randomAlgorithm(songs, 10)

  // We expect a few things from this algorithm
  // First: it returns an array of 10 songs 
  // Second, every song is unique
  expect(queue.length).toBe(10)
  expect(isArrayUnique(queue)).toBeTruthy()
})

test('random algorithm does nothing with 0 songs', () => {
  const songs: Song[] = []
  const queue = randomAlgorithm(songs, 10)

  expect(queue.length).toBe(0)
  expect(isArrayUnique(queue)).toBeTruthy()
})

test('random algorithm returns 5 songs with 5 songs', () => {
  const songs = playlist_5.songs as unknown as Song[]
  const queue = randomAlgorithm(songs, 10)

  expect(queue.length).toBe(5)
  expect(isArrayUnique(queue)).toBeTruthy()
})

/**
 * Weighted song algorithm
 */

test('weighted algorithm shuffles 20 songs and returns 10', () => {
  const songs = playlist_20.songs as unknown as Song[]
  const queue = weightedSongAlgorithm(songs, 10)

  expect(queue.length).toBe(10)
  expect(isArrayUnique(queue)).toBeTruthy()
})

test('weighted algorithm does nothing with 0 songs', () => {
  const songs: Song[] = []
  const queue = weightedSongAlgorithm(songs, 10)

  expect(queue.length).toBe(0)
  expect(isArrayUnique(queue)).toBeTruthy()
})

test('weighted algorithm returns 5 songs with 5 songs', () => {
  const songs = playlist_5.songs as unknown as Song[]
  const queue = weightedSongAlgorithm(songs, 10)

  expect(queue.length).toBe(5)
  expect(isArrayUnique(queue)).toBeTruthy()
})

test('weighted song algorithm takes into account the play_count', () => {
  // This test will test if songs with a higher play_count will end up later in the playlist
  // For example, song 8 has a play_count of 6, so it should be the last in the queue
  const songs = playlist_20.songs as unknown as Song[]
  const queue = weightedSongAlgorithm(songs, 20)

  // First the standard tests
  expect(queue.length).toBe(20)
  expect(isArrayUnique(queue)).toBeTruthy()

  // The last song in the queue should be song 11
  const lastSong = queue[queue.length - 1]
  // is this a song?
  expect(instanceOfSong(lastSong)).toBeTruthy()
  // @ts-expect-error - we know this is a song
  expect(lastSong.id).toBe(11)

  // The second last song should be song 8
  const secondLastSong = queue[queue.length - 2]
  // is this a song?
  expect(instanceOfSong(secondLastSong)).toBeTruthy()
  // @ts-expect-error - we know this is a song
  expect(secondLastSong.id).toBe(8)

  // The third last song should be song 1 or 3
  const thirdLastSong = queue[queue.length - 3]
  // is this a song?
  expect(instanceOfSong(thirdLastSong)).toBeTruthy()
  // @ts-expect-error - we know this is a song
  expect(thirdLastSong.id).toBe(1 || 3)

  // The fifth last song should be song 4 or 5
  const fifthLastSong = queue[queue.length - 5]
  // is this a song?
  expect(instanceOfSong(fifthLastSong)).toBeTruthy()
  // @ts-expect-error - we know this is a song
  expect(fifthLastSong.id).toBe(4 || 5)
})