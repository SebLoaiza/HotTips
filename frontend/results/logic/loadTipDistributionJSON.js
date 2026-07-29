export function loadTipDistributionJSON(file) {


    return new Promise(
        (resolve, reject) => {


            const reader =
                new FileReader();



            reader.onload =
                () => {


                    try {


                        const history =
                            JSON.parse(
                                reader.result
                            );


                        if (
                            !history.tipDistribution
                        ) {


                            throw new Error(
                                "Invalid HotTips history file"
                            );


                        }



                        resolve(
                            history
                        );


                    }
                    catch(error) {


                        reject(error);


                    }


                };



            reader.onerror =
                () => {


                    reject(
                        reader.error
                    );


                };



            reader.readAsText(
                file
            );


        }
    );


}