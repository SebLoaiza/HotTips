from app.models.service_windows import SERVICE_WINDOWS
from app.services.shift_overlap import overlap_hours, build_window
from app.models.coverage import ShiftCoverage


def compute_coverage(employee_shift):

    results = []
    
    shift_start = employee_shift.clock_in
    shift_end = employee_shift.clock_out

    for window in SERVICE_WINDOWS:

        window_start, window_end = build_window(
            shift_start,
            window.start,
            window.end
        )

        hours = overlap_hours(
            shift_start,
            shift_end,
            window_start,
            window_end
        )

        window_total = (window_end - window_start).total_seconds() / 3600

        percent = (hours / window_total) * 100 if window_total > 0 else 0

        results.append(
            ShiftCoverage(
                shift_type=window.name,
                hours=round(hours, 2),
                percent_of_shift=round(percent, 2)
            )
        )

    return results