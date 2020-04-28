// Mule: 211 minerals per minute (real time), source: https://youtu.be/kmxeG8I5p1Y?t=14s
// source: http://www.teamliquid.net/forum/sc2-strategy/140055-scientifically-measuring-mining-speed

const incomeMinerals = (
    workers: number,
    bases: number,
    mules: number = 0
): number => {
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

const incomeVespene = (workers: number, geysers: number): number => {
    // Returns vespene income per second.
    if (workers === 0 || geysers === 0) {
        return 0
    }
    workers = Math.min(4 * geysers, workers)
    if (geysers > 1) {
        const w1 = Math.floor(workers / geysers)
        const w2 = workers % geysers
        return (
            geysers * incomeVespene(w1, 1) +
            w2 * (incomeVespene(w1 + 1, 1) - incomeVespene(w1, 1))
        )
    }
    const gas_per_trip = 4
    const seconds_per_trip_close_gas = [6.3, 2.9, 2.07, 2.07]
    return 1.4 * gas_per_trip * (1 / seconds_per_trip_close_gas[workers - 1])
}

export { incomeMinerals, incomeVespene }
