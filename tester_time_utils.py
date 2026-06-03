#tester_time_utils.py
def time_to_minutes(t: str) -> int:
    if not t:
        return 0

    t = t.strip()
    time_part, meridian = t.split(" ")
    hour, minute = map(int, time_part.split(":"))

    meridian = meridian.upper()

    if meridian == "PM" and hour != 12:
        hour += 12
    if meridian == "AM" and hour == 12:
        hour = 0

    return hour * 60 + minute


def normalize_overnight(start_min: int, end_min: int) -> int:
    if end_min < start_min:
        end_min += 1440
    return end_min

def format_time(mins: int) -> str:
    mins %= 1440
    return f"{mins // 60:02d}:{mins % 60:02d}"










