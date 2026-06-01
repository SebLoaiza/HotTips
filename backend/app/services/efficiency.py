from app.services.time_utils import to_minutes, overlap

SHIFT_BLOCKS = {
    "breakfast": (330, 690),   # 5:30 - 11:30
    "lunch": (690, 1050),      # 11:30 - 5:30
    "dinner": (1050, 1500),    # 5:30 - 1:00
}


def compute_efficiency_minutes(start_time, end_time):
    start = to_minutes(start_time)
    end = to_minutes(end_time)

    if start is None or end is None:
        return {}

    results = {}

    for name, (b_start, b_end) in SHIFT_BLOCKS.items():
        worked = overlap(start, end, b_start, b_end)

        # raw minutes only (NO normalization yet)
        results[name] = worked

    return results