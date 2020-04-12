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

    onMouseEnter = (e, name) => {
        // On mouse enter: open drop down menu with various options
        this.setState({
            [name]: true
        })
    }

    onMouseLeave = (e, name) => {
        // On mouse exit: close the above
        this.setState({
            [name]: false
        })
    }

    render() {
        // TODO On state condition: show dropdown
        const exportButton = <div className={CLASSES.buttons} onMouseEnter={(e) => this.onMouseEnter(e, "export")} onMouseLeave={(e) => this.onMouseLeave(e, "export")}>Export</div>
        const importButton = <div className={CLASSES.buttons} onMouseEnter={(e) => this.onMouseEnter(e, "import")} onMouseLeave={(e) => this.onMouseLeave(e, "import")}>Import</div>

        return (
            <div className="flex flex-row">
                {exportButton}
                {importButton}
            </div>
        )
    }
}
