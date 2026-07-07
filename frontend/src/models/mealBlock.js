export function createMealBlock(date, dayKey, meal, start, end) {

    return {
        date: date,
        day_key: dayKey,

        meal: meal,

        start: start,
        end: end,

        online_total: 0,

        employees: [],
        orders: []
    };

}