import React, { Component } from 'react'

export default class ImportExport extends Component {
    /**
     * Allow export: shareable-url, SALT, instructions
     * Allow import: shareable-url, instructions
     */

    render() {
        // const exportButton = <div>asd</div>

        return (
            <div className="flex flex-row">
                <div>Export</div>
                <div>Import</div>
            </div>
        )
    }
}
