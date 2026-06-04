import type React from "react"
import { Component } from "react"
import ReactTooltip from "react-tooltip"

import CLASSES from "../constants/classes"
import type { IButton } from "../constants/interfaces"

// biome-ignore lint/complexity/noBannedTypes: Component has no props
type MyProps = {}

interface MyState {
    tooltipText: React.ReactElement | string
}
export default class Footer extends Component<MyProps, MyState> {
    constructor(props: MyProps) {
        super(props)
        this.state = {
            tooltipText: "",
        }
    }

    redirect = {
        donate: {
            name: "Donate",
            url: "https://www.paypal.me/BurnySc2", // paypal url
            tooltip: "https://www.paypal.me/BurnySc2",
        },
        contribute: {
            name: "Contribute",
            url: "https://github.com/BurnySc2/sc2-planner", // github url
            tooltip: "https://github.com/BurnySc2/sc2-planner",
        },
        report_bugs: {
            name: "Report Bugs",
            url: "https://github.com/BurnySc2/sc2-planner/issues/new", // github issues url
            tooltip: "https://github.com/BurnySc2/sc2-planner/issues/new",
        },
        contact: {
            name: "Contact",
            url: "",
            tooltip: (
                <div>
                    <div>Discord: burnysc2</div>
                    <div>Twitter: https://twitter.com/Buuurny</div>
                    <div>Reddit: BurnySc2</div>
                </div>
            ),
        },
        shortcuts: {
            name: "Shortcuts",
            url: "",
            tooltip: (
                <div>
                    <div>Click on an item anywhere with:</div>
                    <div>Nothing to remove it</div>
                    <div>Ctrl, to remove it and all future occurences</div>
                    <div>Shift, to move it earlier without delaying any other item</div>
                    <div>Shift + Ctrl, to move it as early as possible without delaying the end of the BO</div>
                    <div>Shift + Alt, to move it earlier where it shortens the BO the most</div>
                    <div>
                        These shortcuts can be used from where you can add new items! It will add them then try to
                        prepone them.
                    </div>
                </div>
            ),
        },
        legal: {
            name: "Legal",
            url: "http://blizzard.com/company/about/legal-faq.html",
            tooltip: (
                <div className="max-w-md">
                    <div>
                        Most image assets are owned by Blizzard and are used according to
                        http://blizzard.com/company/about/legal-faq.html.
                    </div>
                    <div>
                        ©Blizzard Entertainment, Inc. All rights reserved. Wings of Liberty, Heart of the Swarm, Legacy
                        of the Void, StarCraft, Brood War, Battle.net, and Blizzard Entertainment are trademarks or
                        registered trademarks of Blizzard Entertainment, Inc. in the U.S. and/or other countries.
                    </div>
                </div>
            ),
        },
    }

    onMouseEnter = (
        _e: React.MouseEvent<HTMLDivElement, MouseEvent> | React.MouseEvent<HTMLAnchorElement, MouseEvent>,
        item: string | React.ReactElement,
    ): void => {
        this.setState({
            tooltipText: item,
        })
    }

    render(): React.ReactElement {
        const buttonNames: Array<IButton> = ["donate", "contribute", "report_bugs", "contact", "shortcuts", "legal"]
        const buttons = buttonNames.map((myKey, _index) => {
            const item = this.redirect[myKey]
            const mouseEnterFunc = (
                e: React.MouseEvent<HTMLDivElement, MouseEvent> | React.MouseEvent<HTMLAnchorElement, MouseEvent>,
            ) => {
                this.onMouseEnter(e, item.tooltip)
            }
            if (item.url === "") {
                return (
                    /* biome-ignore lint/a11y/useSemanticElements: Tooltip trigger element, not a button */
                    <div
                        key={item.name}
                        role="button"
                        tabIndex={0}
                        data-tip
                        data-for="footerTooltip"
                        onMouseEnter={mouseEnterFunc}
                        className={CLASSES.buttons}
                    >
                        {item.name}
                    </div>
                )
            } else {
                return (
                    <a
                        key={item.name}
                        data-tip
                        data-for="footerTooltip"
                        onMouseEnter={mouseEnterFunc}
                        className={CLASSES.buttons}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {item.name}
                    </a>
                )
            }
        })

        return (
            <div className={`sticky bottom-0 flex ${CLASSES.backgroundcolor}`}>
                <ReactTooltip place="top" id="footerTooltip">
                    {this.state.tooltipText}
                </ReactTooltip>
                {buttons}
            </div>
        )
    }
}
