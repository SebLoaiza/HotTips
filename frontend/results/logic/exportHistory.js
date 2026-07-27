export function exportHistory(
    tipDistribution
) {


    const history = {

        version: 1,

        exported_at:
            new Date().toISOString(),

        tipDistribution:
            tipDistribution

    };



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
        "HotTips_History.json";


    link.click();



    URL.revokeObjectURL(
        url
    );

}