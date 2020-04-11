import React, { Component } from 'react'

import Title from "./Title"
import ImportExport from './ImportExport'
import RaceSelection from './RaceSelection'
import Time from './Time'
import BuildOrder from './BuildOrder'
import BOArea from './BOArea'
import ActionsSelection from './ActionSelection'

export default class WebPage extends Component {
    actionButtonPressed = () => {
        // If a button is pressed in the action selection, add it to the build order
        // Then re-calculate the resulting time of all the items
        // Then send all items and events to teh BOArea
    }

    render() {
        return (
            <div className="flex-col h-full w-full bg-gray-500">
                <Title />
                <ImportExport />
                <div className="flex flex-row">
                    <div className="w-9/12">
                        <div className="flex flex-row">
                            <RaceSelection />
                            <Time />
                            <BuildOrder />
                        </div>
                        <BOArea />
                    </div>
                    <div className="w-3/12">
                        <ActionsSelection />
                    </div>
                </div>
            </div>
        )
    }
}
