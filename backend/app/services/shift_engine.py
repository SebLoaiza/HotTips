from collections import defaultdict
from app.services.section_engine import compute_block_efficiency
from app.services.time_utils import to_minutes, minutes_to_ampm


class ShiftEngine:
    def __init__(self, records=None):
        self.records = records or []

    def group_by_employee_day(self):
        grouped = defaultdict(list)

        for r in self.records:
            key = (r.employee.strip().lower(), r.date)
            grouped[key].append(r)

        return grouped

    def build_daily_shifts(self):
        grouped = self.group_by_employee_day()
        daily = []

        for (employee_key, date), records in grouped.items():

            roles = sorted(set(r.role for r in records))
            all_breaks = []

            section_result = {
                "breakfast": {"coverage": 0},
                "lunch": {"coverage": 0},
                "dinner": {"coverage": 0},
            }

            shift_starts = []
            shift_ends = []

            for r in records:

                start = to_minutes(r.time_in)
                end = to_minutes(r.time_out)

                if start is not None:
                    shift_starts.append(start)
                if end is not None:
                    shift_ends.append(end)

                if getattr(r, "breaks", None):
                    all_breaks.extend(r.breaks)

                eff = compute_block_efficiency(
                    r.time_in,
                    r.time_out,
                    r.breaks
                )

                for k in section_result:
                    section_result[k]["coverage"] += eff.get(k, {}).get("coverage", 0)

            # -------------------------
            # SHIFT BOUNDS
            # -------------------------
            shift_start = min(shift_starts) if shift_starts else None
            shift_end = max(shift_ends) if shift_ends else None

            total_shift_minutes = 0
            is_overnight = False

            if shift_start is not None and shift_end is not None:

                # detect overnight shift
                if shift_end < shift_start:
                    shift_end += 1440
                    is_overnight = True

                total_shift_minutes = shift_end - shift_start

            # -------------------------
            # DISPLAY TIME (FIXED)
            # -------------------------
            def format_display(minutes, overnight_flag=False):
                if minutes is None:
                    return None

                base = minutes % 1440
                time_str = minutes_to_ampm(base)

                # IMPORTANT: show meaning, not just clock
                if overnight_flag:
                    return time_str + " (next day)"

                return time_str

            shift_start_time = format_display(shift_start, False)
            shift_end_time = format_display(shift_end, is_overnight)

            # -------------------------
            # OUTPUT
            # -------------------------
            daily.append({
                "employee": records[0].employee.strip(),
                "date": date,
                "roles": roles,

                # raw math values
                "shift_start_minutes": shift_start,
                "shift_end_minutes": shift_end,
                "total_shift_minutes": total_shift_minutes,

                # semantic flag (IMPORTANT FIX)
                "is_overnight": is_overnight,

                # display values
                "shift_start_time": shift_start_time,
                "shift_end_time": shift_end_time,

                "breaks": all_breaks,
                "efficiency": section_result
            })

        return daily