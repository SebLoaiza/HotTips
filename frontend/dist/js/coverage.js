function calculateCoverage(session, property) {

    if (!session.employees.length) {
        return {
            percent: 0,
            covered: 0,
            total: 0,
            merged: []
        };
    }

    const start = Math.min(...session.employees.map(e => e.meal_start));
    const end = Math.max(...session.employees.map(e => e.meal_end));

    const totalMinutes = end - start;

    if (totalMinutes <= 0) {
        return {
            percent: 0,
            covered: 0,
            total: 0,
            merged: []
        };
    }

    const intervals = session.employees
        .filter(e => e[property])
        .map(e => [e.meal_start, e.meal_end])
        .sort((a, b) => a[0] - b[0]);

    if (!intervals.length) {
        return {
            percent: 0,
            covered: 0,
            total: totalMinutes,
            merged: []
        };
    }

    const merged = [];

    let [cs, ce] = intervals[0];

    for (let i = 1; i < intervals.length; i++) {

        const [s, e] = intervals[i];

        if (s <= ce) {
            ce = Math.max(ce, e);
        } else {
            merged.push([cs, ce]);
            cs = s;
            ce = e;
        }
    }

    merged.push([cs, ce]);

    let covered = 0;

    for (const [s, e] of merged) {
        covered += e - s;
    }

    return {
        percent: covered / totalMinutes * 100,
        covered,
        total: totalMinutes,
        merged
    };
}






function renderCoverageViz(title, percent, meta) {

    const width = 700;

    const start = Math.min(...meta.merged.flat().filter((_, i) => i % 2 === 0), 0);

    let html = `
        <div class="viz-wrap">

            <div class="viz-title">
                ${title} Coverage Breakdown
            </div>

            <div class="viz-label">
                Coverage:
                ${percent.toFixed(2)}%
                (${meta.covered}/${meta.total} mins)
            </div>
        </div>
    `;

    return html;
}