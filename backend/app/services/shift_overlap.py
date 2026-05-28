from datetime import datetime, timedelta


def overlap_hours(start1, end1, start2, end2):
    latest_start = max(start1, start2)
    earliest_end = min(end1, end2)

    delta = (earliest_end - latest_start).total_seconds() / 3600

    return max(0, delta)


def build_window(date, start_time, end_time):
    start_dt = datetime.combine(date.date(), start_time)
    end_dt = datetime.combine(date.date(), end_time)

    if end_dt <= start_dt:
        end_dt += timedelta(days=1)

    return start_dt, end_dt