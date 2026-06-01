from app.services.time_utils import to_minutes, overlap

SHIFT_BLOCKS = {
    "breakfast": (330, 690),
    "lunch": (690, 1050),
    "dinner": (1050, 1500),
}


def compute_block_efficiency(start_time, end_time, breaks):
    start = to_minutes(start_time)
    end = to_minutes(end_time)

    if start is None or end is None:
        return {}

    # -------------------------
    # 🔥 OVERNIGHT FIX
    # -------------------------
    if end < start:
        end += 1440

    result = {}

    for name, (b_start, b_end) in SHIFT_BLOCKS.items():

        block_size = b_end - b_start

        # shift overlap
        raw = overlap(start, end, b_start, b_end)

        break_minutes = 0

        for br in breaks or []:
            br_start = to_minutes(br.get("start"))
            br_end = to_minutes(br.get("end"))

            if br_start is None or br_end is None:
                continue

            if br_end < br_start:
                br_end += 1440

            break_minutes += overlap(br_start, br_end, b_start, b_end)

        effective = max(0, raw - break_minutes)

        coverage = effective / block_size if block_size else 0

        result[name] = {
            "raw_minutes": raw,
            "break_minutes": break_minutes,
            "effective_minutes": effective,
            "coverage": round(coverage, 4)
        }

    return result