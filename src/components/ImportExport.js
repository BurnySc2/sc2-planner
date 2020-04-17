import React, { Component } from 'react'
import ReactTooltip from 'react-tooltip';

import CLASSES from '../constants/classes'

export default class ImportExport extends Component {
    /**
     * Allow export: shareable-url, SALT, instructions
     * Allow import: shareable-url, instructions
     */
    state = {
        // Variable to show dropdown
        export: false,
        import: false,
        tooltipText: ""
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

    onClickExport = (e, name) => {
        // https://developer.mozilla.org/en-US/docs/Web/API/Clipboard
        let clipBoardText = ""
        // TODO Create build order in the desired format
        navigator.clipboard.writeText(clipBoardText).then(() => {
            console.log(name);
        }, () => {
            console.log("fail");
        })
        
        this.setState({
            tooltipText: "Copied!"
        })
    }
    
    onClickImport = (e, name) => {
        // https://developer.mozilla.org/en-US/docs/Web/API/Clipboard
        navigator.clipboard.readText().then(data => {
            console.log(data);
            // TODO Parse build order
        })

        this.setState({
            tooltipText: "Pasted!"
        })
    }

    onLeaveButton = (e) => {
        this.setState({
            tooltipText: ""
        })
    }

    render() {
        const classes = CLASSES.dropDown
        const classesExportDropdown = this.state.export ? `visible ${classes}` : `hidden ${classes}`
        const classesImportDropdown = this.state.import ? `visible ${classes}` : `hidden ${classes}`

        const exportElements = [
            "Copy shareable link",
            "Copy build order instructions",
            "Copy SALT encoding"
        ].map((item) => {
            // TODO Popup should appear when copied
            // TODO on click events
            return (
                <div key={`${item}`} data-tip={this.state.tooltipText} data-for='importExportTooltip' onMouseLeave={this.onLeaveButton} onClick={(e) => this.onClickExport(e, item)} className={CLASSES.dropDownContainer}>
                    <div className={CLASSES.dropDownLabel}>
                        {item}
                    </div>
                </div>
            )
        })

        const importElements = [
            "Paste shareable link",
            "Paste spawning tool instructions",
        ].map((item) => {
            // TODO Popup should appear when copied
            // TODO on click events
            return (
                <div key={`${item}`} data-tip={this.state.tooltipText} data-for='importExportTooltip' onMouseLeave={this.onLeaveButton} onClick={(e) => this.onClickImport(e, item)} className={CLASSES.dropDownContainer}>
                    <div className={CLASSES.dropDownLabel}>
                        {item}
                    </div>
                </div>
            )
        })

        const exportButton = 
            <div className={CLASSES.buttons} onMouseEnter={(e) => this.onMouseEnter(e, "export")} onMouseLeave={(e) => this.onMouseLeave(e, "export")}>
                Export
                <div className={classesExportDropdown}>
                    {exportElements}
                </div>
            </div>

        const importButton = 
            <div className={CLASSES.buttons} onMouseEnter={(e) => this.onMouseEnter(e, "import")} onMouseLeave={(e) => this.onMouseLeave(e, "import")}>
                Import
                <div className={classesImportDropdown}>
                    {importElements}
                </div>
            </div>

        return (
            <div className="flex flex-row">
                <ReactTooltip place="bottom" id="importExportTooltip">{this.state.tooltipText}</ReactTooltip>
                {exportButton}
                {importButton}
            </div>
        )
    }
}
