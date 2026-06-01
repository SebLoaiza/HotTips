from datetime import datetime

def to_minutes(t):
    if not t:
        return None

    if isinstance(t, (int, float)):
        return int(t)

    dt = datetime.strptime(t.strip(), "%I:%M %p")
    return dt.hour * 60 + dt.minute


def overlap(a_start, a_end, b_start, b_end):
    return max(0, min(a_end, b_end) - max(a_start, b_start))


def minutes_to_ampm(minutes):
    if minutes is None:
        return None

    minutes = minutes % 1440  

    hours = minutes // 60
    mins = minutes % 60

    period = "AM"
    if hours >= 12:
        period = "PM"
    if hours > 12:
        hours -= 12
    if hours == 0:
        hours = 12

    return f"{hours}:{mins:02d} {period}"

