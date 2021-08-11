import React, { Component } from "react"
import ReactTooltip from "react-tooltip"

import CLASSES from "../constants/classes"
import { IButton } from "../constants/interfaces"

interface MyProps {}

interface MyState {
    tooltipText: JSX.Element | string
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
                    <div>Discord: BuRny#8752</div>
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
                    <div>Ctrl to remove it and all future occurences</div>
                    <div>Shift to move (or insert) it earlier without delaying any other item</div>
                    <div>
                        Shift and Ctrl to move (or insert) it earlier without delaying the end of
                        the BO
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
                        ©Blizzard Entertainment, Inc. All rights reserved. Wings of Liberty, Heart
                        of the Swarm, Legacy of the Void, StarCraft, Brood War, Battle.net, and
                        Blizzard Entertainment are trademarks or registered trademarks of Blizzard
                        Entertainment, Inc. in the U.S. and/or other countries.
                    </div>
                </div>
            ),
        },
    }

    onMouseEnter = (
        e:
            | React.MouseEvent<HTMLDivElement, MouseEvent>
            | React.MouseEvent<HTMLAnchorElement, MouseEvent>,
        item: string | JSX.Element
    ) => {
        this.setState({
            tooltipText: item,
        })
    }

    render() {
        const buttonNames: Array<IButton> = [
            "donate",
            "contribute",
            "report_bugs",
            "contact",
            "shortcuts",
            "legal",
        ]
        const buttons = buttonNames.map((myKey, index) => {
            const item = this.redirect[myKey]
            const mouseEnterFunc = (
                e:
                    | React.MouseEvent<HTMLDivElement, MouseEvent>
                    | React.MouseEvent<HTMLAnchorElement, MouseEvent>
            ) => {
                this.onMouseEnter(e, item.tooltip)
            }
            if (item.url === "") {
                return (
                    <div
                        key={item.name}
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
