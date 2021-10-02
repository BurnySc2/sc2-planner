// Speedtest for measuring adding, removing, 'in' checks for array vs set vs object

const testValues = [3, 20, 100, 125000]
testValues.forEach((size) => {
    const limit = size
    const array = []
    const mySet = new Set()

    console.log(`\nitem size: ${size}`)

    console.time("Test Array add")
    for (let i = 0; i < limit; i++) {
        array.push(i)
    }
    console.timeEnd("Test Array add")

    console.time("Test Set add")
    for (let i = 0; i < limit; i++) {
        mySet.add(i)
    }
    console.timeEnd("Test Set add")

    console.time("Test Array includes")
    for (let i = 0; i < limit; i++) {
        array.includes(i)
    }
    console.timeEnd("Test Array includes")

    console.time("Test Set has")
    for (let i = 0; i < limit; i++) {
        mySet.has(i)
    }
    console.timeEnd("Test Set has")

    console.time("Test Array remove")
    for (let i = 0; i < limit; i++) {
        array.splice(i, 1)
    }
    console.timeEnd("Test Array remove")

    console.time("Test Set delete")
    for (let i = 0; i < limit; i++) {
        mySet.delete(i)
    }
    console.timeEnd("Test Set delete")
})

export default testValues
