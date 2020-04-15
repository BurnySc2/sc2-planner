
class Event {
    constructor(name, imageSource, type, start, end) {
        this.name = name
        // Source path of image, not the image itself
        this.imageSource = imageSource
        this.type = type
        this.start = start
        this.end = end
    }
}

export default Event