import { Session, Song, SongTypeEnum } from 'sipapu-2'
import { PlaylistWithSongsType } from 'sipapu/dist/src/services/playlist'
import { SongType } from 'sipapu/dist/src/services/song'

const SHUFFLE_LENGTH = 10
const MAX_PLAY_COUNT = 2

export type PlayerEvent = SongType | 'adtrad'

/**
 * Shuffle the events according to the 'Random' algorithm
 * This is shit
 * Returns a list of 10 songs
 */
export const shuffleRandomWithoutEvents = (playlist: PlaylistWithSongsType): SongType[] => {
  const shuffled = knuthShuffle(playlist.songs)

  return shuffled.slice(0, SHUFFLE_LENGTH)
}

/**
 * Shuffle the playlist is the most fair way possible and return the top 10 songs
 * 
 * First: Select an user according to the weighted distribution 
 * (this favors the users with the highest weights (thus having the least songs played))
 * 
 * Second: Aggregate the songs of the user and sort them based on artist and select the artist with the
 * lowest total playCount
 * 
 * Third: Select a random song from the artist, favoring the songs with the lowest playCount
 * 
 * Fourth: Repeat this 10 times, and make sure that the songs are not repeated
 */
// export const modernShuffle = (session: Session, songList: Song[]): Song[] => {
//   const weights = getWeights(session)
//   const queue: Song[] = []

//   while (queue.length < SHUFFLE_LENGTH) {
//     // first check if there are songs left lol
//     if (Array.from(weights.keys()).length === 0) {
//       // No users left, so reset the playCount
//       const songs = resetPlayCount(session, songList)
//       // playlist = {
//       //   ...playlist,
//       //   songs
//       // }
//     }

//     // First select an user according to the weighted distribution
//     // To do this, we first need to calculate the discrete cumulative density function (CDF)
//     let cdf = 0
//     weights.forEach(weight => cdf += weight)

//     // Now we have the total weight, we can generate a random number between 0 and the total weight
//     const randomWeight = Math.ceil(Math.random() * cdf)

//     // Now all thats left is to select the correct weight
//     const arr = Array.from(weights.entries())
//     // select the first user, to shut up ts
//     let selectedUser = arr[0][0]

//     let i = 0
//     // Iterate over the weights and find the correct user
//     for (const [user, weight] of arr) {
//       i += weight
//       // If the random weight is smaller than the current weight, we have found the user
//       if (i >= randomWeight) {
//         selectedUser = user
//         break
//       }
//     }

//     // Now we have the user, we can aggregate the songs of the user
//     // First select the songs of the user
//     const songs = playlist.songs.filter(song => song.addedBy === selectedUser)

//     // If this user has no songs (left), then we remove them and try again
//     if (songs.length === 0) {
//       weights.delete(selectedUser)
//       continue
//     }
//     // else we can continue

//     // Now we have to select the correct artist
//     // We do this by first grouping the artists
//     const groupedSongs = new Map<string, SongType[]>()

//     songs.forEach(song => {
//       const artist = song.artist || 'Kokopelli:unknown'

//       if (!groupedSongs.has(artist)) {
//         groupedSongs.set(artist, [song])
//       } else {
//         // Piss off ts, cant you see the fucking if statement?
//         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//         groupedSongs.get(artist)!.push(song)
//       }
//     })

//     // Now we have the grouped songs, we can select the artist with the lowest playCount
//     let selectedArtist = Array.from(groupedSongs.keys())[0]
//     let lowestPlayCount = 0

//     groupedSongs.forEach((songs, artist) => {
//       // Sum up the playCount of the songs
//       const playCount = songs.reduce((acc, song) => acc + song.playCount, 0)

//       // If the current artist has a lower playCount, then we select this artist
//       if (playCount < lowestPlayCount || lowestPlayCount === 0) {
//         lowestPlayCount = playCount
//         selectedArtist = artist
//       }
//     })

//     // Now we have the artist, we can select a random song with the lowest playCount
//     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//     const artistGroup = groupedSongs.get(selectedArtist)!
//     let selectedSong = artistGroup[0]

//     // we first group the songs by playCount
//     const groupedByPlayCount = new Map<number, SongType[]>()

//     artistGroup.forEach(song => {
//       if (!groupedByPlayCount.has(song.playCount)) {
//         groupedByPlayCount.set(song.playCount, [song])
//       } else {
//         // Piss off ts, cant you see the fucking if statement?
//         // thank you github copilot for replicating my previous helpful comment
//         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//         groupedByPlayCount.get(song.playCount)!.push(song)
//       }
//     })

//     // Remove all songs with playCount === 3, since they are not interesting
//     groupedByPlayCount.get(3)?.forEach(song => {
//       playlist.songs = playlist.songs.filter(s => s.id !== song.id)
//     })

//     for (let i = 0; i < MAX_PLAY_COUNT; i++) {
//       // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//       const songs = groupedByPlayCount.get(i)!
      
//       if (songs.length === 0) continue

//       // Select a random song from the group
//       const randomIndex = Math.floor(Math.random() * songs.length)
//       selectedSong = songs[randomIndex]
//     }

//     queue.push(selectedSong)
//   }

//   saveWeights(weights)
//   return queue
// }

/**
 * This algorithm favors songs with a lower playCount
 * @returns an array of 10 SongType objects
 */
// export const shuffleWeightedSong = (playlist: PlaylistWithSongsType, length?: number): SongType[] => {
export const shuffleWeightedSong = (session: Session, songs: Song[], length?: number): Song[] => {
  const shuffled = weightedSongShuffle(session, songs)
  return shuffled.slice(0, length ?? SHUFFLE_LENGTH)
}
 
const resetPlayCount = (session: Session, songs: Song[]): Song[] => {
  fetch(process.env.REACT_APP_TAWA_URL + 'playlist/reset', {
    method: 'POST',
    body: JSON.stringify({
      playlist_id: session.playlist_id,
      session_id: session.$id
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  return songs.map(song => {
    song.play_count = 0
    return song
  })
}

// export const shuffleWeightedSongWithEvents = (playlist: PlaylistWithSongsType, session: SessionType): PlayerEvent[] => {
export const shuffleWeightedSongWithEvents = (songs: Song[], session: Session): Song[] => {
  const settings = JSON.parse(session.settings)
  const queue: Song[] = shuffleWeightedSong(session, songs, settings.eventFrequency)
  
  if (settings.allowEvents) {
    // TODO add song that is being played here
    
    queue.push({
      title: 'Wheel of Fortune',
      artists: 'Kokopelli',
      album: 'Events',
      length: -1,
      cover: 'https://api.kokopellimusic.nl/v1/storage/buckets/default/files/missing/view?project=kokopelli-dev',
      song_type: SongTypeEnum.Event,
      added_by: 'Kokopelli',
      play_count: 0,
      playlist_id: session.playlist_id,
      platform_id: '',
      user_name: 'Kokopelli'
    } as Song)
  }

  return queue
}

/**
 * Algorithm used by shuffleWeightedSong
 */
const weightedSongShuffle = (session: Session, playlist: Song[]): Song[] => {
  const queue: Song[] = []

  for (let i = 0; i < MAX_PLAY_COUNT; i++) {
    // Select all songs that have been played i times
    const songs = playlist.filter(song => song.play_count === i)

    // No songs found, so we try again
    if (songs.length === 0) continue

    // Select at most 10 songs from this group
    const shuffled = knuthShuffle(songs)

    // Calculate how much songs we still need
    const num = 10 - queue.length

    // Push the first x songs
    shuffled.slice(0, num).forEach(song => {
      if (!queue.includes(song)) queue.push(song)
    })

    if (queue.length === 10) {
      break
    }
  }

  // all songs have been played MAX_PLAY_COUNT times
  if (queue.length === 0) {
    // reset the playCount
    playlist = resetPlayCount(session, playlist)

    // and try again
    return weightedSongShuffle(session, playlist)
  }

  // this can be 10 or less songs
  return queue
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