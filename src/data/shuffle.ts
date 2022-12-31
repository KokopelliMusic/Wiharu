import { KokopelliEvent, Playlist, Settings, Song } from '../types/tawa'


export type PlayerEvent = Song | KokopelliEvent

/**
 * Generate a player queue consisting of settings.event_frequency songs and then an KokopelliEvent
 * @param playlist The playlist to generate the queue from
 * @param settings The settings to use for the queue
 */
export const generateQueue = (playlist: Playlist, settings: Settings): PlayerEvent[] => {
  let queue: PlayerEvent[] = []
  const songs = playlist.songs!

  if (settings.algorithm_used === 'random') {
    queue = randomAlgorithm(songs, settings.event_frequency)
  } else if (settings.algorithm_used === 'weighted-song') {
    queue = weightedSongAlgorithm(songs, settings.event_frequency)
  } 

  if (settings.allow_events) {
    queue.push(randomEvent(settings.allowed_events))
  }

  return queue
}

/**
 * Generate a list of [eventFrequency] amount of songs to play next, in random order. It does not repeat a song twice in the queue.
 */
export const randomAlgorithm = (songs: Song[], eventFrequency: number): PlayerEvent[] => {
  const queue = []
  const songsCopy = [...songs]
  let len = eventFrequency

  // If there are less songs than the eventFrequency, just play all the songs
  if (eventFrequency > songs.length) {
    len = songs.length
  }

  // Now, we can start filling the queue. We do this by picking a random song from the songsCopy array, 
  // and then deleting it from the array so it can't be picked again
  for (let i = 0; i < len; i++) {
    const song = songsCopy[Math.floor(Math.random() * songsCopy.length)]
    // Delete the song from the array so it can't be picked again
    songsCopy.splice(songsCopy.indexOf(song), 1)
    queue.push(song)
  }

  // Done!
  return queue
}


/**
 *  Grab a random event from the list of allowed events
 */
const randomEvent = (allowedEvents: KokopelliEvent[]): KokopelliEvent => {
  return allowedEvents[Math.floor(Math.random() * allowedEvents.length)]
}


/**
 *  Algorithm that will favor songs that have a lower play_count
 */
export const weightedSongAlgorithm = (songs: Song[], eventFrequency: number): PlayerEvent[] => {
  const queue = []

  // First, divide the songs into buckets based on their play_count
  const buckets = new Map<number, Song[]>()
  const playCounts = []

  for (const song of songs) {
    const playCount = song.play_count

    if (buckets.has(playCount)) {
      // @ts-expect-error - Hou je bek zie je de if statement niet ofzo
      buckets.get(playCount).push(song)
    } else {
      playCounts.push(playCount)
      buckets.set(playCount, [song])
    }
  }

  // Now we have a map of buckets, we can start filling the queue

  // First, we need to find the lowest play_count
  let lowestPlayCount = Math.min(...playCounts)

  // Now we can start filling the queue
  let amountOfSongs = songs.length

  if (amountOfSongs > eventFrequency) {
    // If the amount of songs is more than the eventFrequency, just take the eventFrequency
    amountOfSongs = eventFrequency
  }

  console.log(`We need ${amountOfSongs} songs`)

  while (queue.length < amountOfSongs) {
    // If we still need more songs, we can start picking songs from the next bucket
    const nextPlayCount = playCounts[playCounts.indexOf(lowestPlayCount)]

    const bucket = buckets.get(nextPlayCount)!

    // amount of songs we still need
    const amountOfSongsLeft = amountOfSongs - queue.length

    // Select amountOfSongsLeft songs from the bucket
    const random = randomAlgorithm(bucket, amountOfSongsLeft)

    queue.push(...random)

    if (queue.length !== amountOfSongs) {
      console.log('We still need more songs')
      // We're not done, selecting the next bucket
      
      // first, remove the current bucket from the buckets map
      buckets.delete(nextPlayCount)
      // remove the current play_count from the playCounts array
      playCounts.splice(playCounts.indexOf(nextPlayCount), 1)

      // Now, find the next lowest play_count
      lowestPlayCount = Math.min(...playCounts)

      console.log('Next lowest play_count: ', lowestPlayCount)

      if (!buckets.has(lowestPlayCount)) {
        // If the lowest play_count doesn't exist in the buckets map, we're done
        break
      }
      // Else, we can continue
    }
  }
  
  return queue
}