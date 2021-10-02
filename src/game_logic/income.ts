// Mule: 211 minerals per minute (real time), source: https://youtu.be/kmxeG8I5p1Y?t=14s
// source: http://www.teamliquid.net/forum/sc2-strategy/140055-scientifically-measuring-mining-speed

const incomeMinerals = (workers: number, bases: number, mules = 0): number => {
    // Returns mineral income per second.
    if ((workers === 0 && mules === 0) || bases === 0) {
        return 0
    }

    // How many close and far mineral patches there are per base
    const amount_close_patches = 5
    const amount_far_patches = 3
    const full_saturation = 3 * (amount_close_patches + amount_far_patches)

    // Ignore workers that oversaturate a base (more than 24 workers)
    workers = Math.min(full_saturation * bases, workers)
    if (bases > 1) {
        const w1 = Math.floor(workers / bases)
        const w2 = workers % bases
        const base1Income = incomeMinerals(w1 + w2, 1, mules)
        const otherBasesIncome = incomeMinerals(w1, 1) * (bases - 1)
        return base1Income + otherBasesIncome
    }

    let third_worker_close_patch = 0
    let third_worker_far_patch = 0
    let workers_far_patch = 0

    const income_workers_far_patch = 32
    const income_third_worker_far_patch = 32

    const income_workers_close_patch = 46
    const income_third_worker_close_patch = Math.max(0, 102 - 2 * income_workers_close_patch)

    // Add workers as third workers to close patches
    if (workers > 19) {
        third_worker_close_patch = workers - 19
        workers -= third_worker_close_patch
    }
    if (workers > 16) {
        third_worker_far_patch = workers - 16
        workers -= third_worker_far_patch
    }
    if (workers > 10) {
        workers_far_patch = workers - 10
        workers -= workers_far_patch
    }
    // Remaining workers are on close patch
    const workers_close_patch = workers

    let income_per_min = 0
    const array = [
        workers_close_patch * income_workers_close_patch,
        workers_far_patch * income_workers_far_patch,
        income_third_worker_far_patch * third_worker_far_patch,
        income_third_worker_close_patch * third_worker_close_patch,
    ]
    array.forEach((value) => {
        income_per_min += value
    })

    // Income per second
    const mule_rate = 225 / 64
    return (1.4 * income_per_min) / 60 + mules * mule_rate
}

const incomeVespenePerGeyser = (workers: number): number => {
    // Returns vespene income per second for one geyser.
    if (workers === 0) {
        return 0
    }
    const gas_per_trip = 4
    const seconds_per_trip_close_gas = [6.3, 2.9, 2.07]
    const seconds_per_trip =
        seconds_per_trip_close_gas[Math.min(seconds_per_trip_close_gas.length, workers) - 1]
    return 1.4 * gas_per_trip * (1 / seconds_per_trip)
}

const incomeVespene = (workers: number, geysers: number, baseCount: number): number => {
    // Returns vespene income per second.

    if (workers === 0 || geysers === 0) {
        return 0
    }
    const closeGeysers = Math.min(geysers, baseCount * 2)
    const closeDistanceWorkers = Math.min(3 * closeGeysers, workers)
    const minWorkersPerGeyser = Math.floor(closeDistanceWorkers / closeGeysers)
    const workersLeft = closeDistanceWorkers % closeGeysers
    const closeDistanceIncome =
        closeGeysers * incomeVespenePerGeyser(minWorkersPerGeyser) +
        workersLeft *
            (incomeVespenePerGeyser(minWorkersPerGeyser + 1) -
                incomeVespenePerGeyser(minWorkersPerGeyser))

    let longDistanceIncome = 0
    workers -= closeDistanceWorkers
    geysers -= closeGeysers
    const longDistanceMiningRatio = [8.175, 8.95, 10.4, 14.8] //Distance from long distance geyser divided by distance from base geyser
    for (const miningRatio of longDistanceMiningRatio) {
        if (geysers > 0) {
            geysers--
            const longDistanceWorkers = Math.min(Math.floor(miningRatio * 3), workers)
            if (longDistanceWorkers > 0) {
                workers -= longDistanceWorkers
                longDistanceIncome +=
                    (incomeVespenePerGeyser(3) * longDistanceWorkers) / 3 / miningRatio
            }
        }
    }
    return closeDistanceIncome + longDistanceIncome
}

export { incomeMinerals, incomeVespene }
