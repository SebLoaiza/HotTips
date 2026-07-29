import {
    History
}
from "../model/History.js";



export function saveTipDistributionJSON(
    tipDistribution
) {


    const history =
        new History(
            tipDistribution
        );



    const json =
        JSON.stringify(
            history,
            null,
            2
        );



    const blob =
        new Blob(
            [
                json
            ],
            {
                type:
                "application/json"
            }
        );



    const url =
        URL.createObjectURL(
            blob
        );



    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;



    link.download =
        `${history.start_date}_to_${history.end_date}_HotTips.json`;



    document.body.appendChild(
        link
    );


    link.click();



    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );


}