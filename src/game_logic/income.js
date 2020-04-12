
const incomeMinerals = (workers, bases, mules = 0) => {
    // Returns mineral income per second. """
    if ((workers === 0 || mules === 0) && bases === 0) {
        return 0
    }
    const amount_close_patches = 5
    const amount_far_patches = 3
    const full_saturation = 3 * (amount_close_patches + amount_far_patches)
    workers = Math.min(full_saturation * bases, workers)
    if (bases > 1) {
        const w1 = Math.floor(workers, bases)
        const w2 = workers % bases
        return (
            bases * incomeMinerals(w1, 1)
            + w2 * (incomeMinerals(w1 + 1, 1) - incomeMinerals(w1, 1))
            + incomeMinerals(0, 1, mules)
        )
    }
    let third_worker_close_patch = 0; 
    let third_worker_far_patch = 0; 
    let workers_far_patch = 0;

    const income_third_worker_close_patch = 102 - 90
    const income_third_worker_far_patch = 102 - 78
    const income_workers_far_patch = 39
    const income_workers_close_patch = 45
    if (workers > full_saturation - amount_close_patches){
        third_worker_close_patch = workers - (24 - amount_far_patches)
        workers -= third_worker_close_patch
    }
    if (workers > full_saturation - amount_close_patches - amount_far_patches) {
        third_worker_far_patch = workers - 2 * (amount_close_patches + amount_far_patches)
        workers -= third_worker_far_patch
    }
    if (workers > 2 * amount_close_patches) {
        const workers_far_patch = workers - 2 * amount_close_patches
        workers -= workers_far_patch
    }
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
    const mule_rate = 211 / 1.4
    return 1.4 * income_per_min / 60 + 1.4 * mules * mule_rate / 60
}

// TODO install eslint

const incomeVespene = (workers, geysers) => {
    // Returns vespene income per second. """
    if (workers === 0 || geysers === 0) {
        return 0
    }
    workers = Math.min(4 * geysers, workers)
    if (geysers > 1) {
        const w1 = Math.floor(workers, geysers)
        const w2 = workers % geysers
        return geysers * incomeVespene(w1, 1) + w2 * (incomeVespene(w1 + 1, 1) - incomeVespene(w1, 1))
    }
    const gas_per_trip = 4
    const seconds_per_trip_close_gas = [6.3, 2.9, 2.1, 2.1]
    const seconds_per_trip_far_gas = [7.1, 3.7, 2.4, 2.1]
    let seconds_per_trip_avg = [0, 1, 2, 3].map((index) => {
        return ((seconds_per_trip_close_gas[index] + seconds_per_trip_far_gas[index]) / 2)
    })
    return 1.4 * gas_per_trip * (1 / seconds_per_trip_avg[workers - 1])
}

export {incomeMinerals, incomeVespene}