
class Event {
    /**
     * 
     * @param {String} name - The name of the event, e.g. 'SCV' or 'CommandCenter'
     * @param {String} imageSource - The connected image source path of the event
     * @param {String} type - The type of the event, one of ["worker", "action", "unit", "structure", "upgrade"] 
     * @param {Number} start - The start of the event 
     * @param {Number} end - The end frame of the event, end-start reveal the width of the event
     * @param {Number} id - The event id, should match the index of the build order element
     * @param {Number} supply - The supply the simulation was at, at 'event.start'
     */
    constructor(name, imageSource, type, start, end, id=0, supply=-1) {
        this.name = name
        // Source path of image, not the image itself
        this.imageSource = imageSource
        this.type = type
        this.start = start
        this.end = end
        this.id = id
        this.supply = supply
    }
}

export default Event