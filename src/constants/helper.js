
const CONVERT_SECONDS_TO_TIME_STRING = ((totalSeconds) => {
    totalSeconds = Math.floor(totalSeconds)
    const minutes = `${Math.floor(totalSeconds / 60)}`.padStart(2, "0")
    const seconds = `${totalSeconds % 60}`.padStart(2, "0")
    const timeFormatted = `${minutes}:${seconds}`
    return timeFormatted
})

export {CONVERT_SECONDS_TO_TIME_STRING}