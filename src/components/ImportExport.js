import React, { Component } from 'react'
import CLASSES from "../constants/classes"

export default class ImportExport extends Component {
    /**
     * Allow export: shareable-url, SALT, instructions
     * Allow import: shareable-url, instructions
     */
    state = {
        export: false,
        import: false,
    }

    onMouseEnter = (e) => {
        // On mouse enter: open drop down menu with various options
        this.setState({
            [e.target.attributes.name.value]: true
        })
    }
    onMouseLeave = (e) => {
        // On mouse exit: close the above
        this.setState({
            [e.target.attributes.name.value]: false
        })
    }

    render() {
        // TODO On state condition, show dropdown
        const exportButton = <div className={CLASSES.buttons} name="export" onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>Export</div>
        const importButton = <div className={CLASSES.buttons}  name="import" onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>Import</div>

        return (
            <div className="flex flex-row">
                {exportButton}
                {importButton}
            </div>
        )
    }
}
