export async function readCsv(file) {

    const text = await file.text();


    const result = Papa.parse(text, {
        header: true,
        skipEmptyLines: true
    });


    return result.data;

}