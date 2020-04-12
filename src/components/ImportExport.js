import React, { Component } from 'react'
import CLASSES from "../constants/classes"

export default class ImportExport extends Component {
    /**
     * Allow export: shareable-url, SALT, instructions
     * Allow import: shareable-url, instructions
     */
    state = {
        // Variable to show dropdown, true = show drop down
        export: false,
        import: false,
    }

    onMouseEnter = (e) => {
        // On mouse enter: open drop down menu with various options
        let key
        if (this.refs.export === e.target) {
            key = "export"
        } else if (this.refs.import === e.target) {
            key = "import"
        } else {
            return
        }
        this.setState({
            [key]: true
        })
        // console.log({[key]: true});
    }

    onMouseLeave = (e) => {
        // On mouse exit: close the above
        let key
        if (this.refs.export === e.target) {
            key = "export"
        } else if (this.refs.import === e.target) {
            key = "import"
        } else {
            return
        }
        this.setState({
            [key]: false
        })
    }

    render() {
        // TODO On state condition, show dropdown
        const exportButton = <div className={CLASSES.buttons} ref="export" onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>Export</div>
        const importButton = <div className={CLASSES.buttons} ref="import" onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>Import</div>

        return (
            <div className="flex flex-row">
                {exportButton}
                {importButton}
            </div>
        )
    }
}
