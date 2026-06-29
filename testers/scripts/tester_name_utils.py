# tester_name_utils.py

def normalize_name(name: str) -> str:

    if not name:
        return ""

    name = name.strip()

    # Last, First -> First Last
    if "," in name:

        last, first = name.split(",", 1)

        name = f"{first.strip()} {last.strip()}"

    # remove extra spaces
    name = " ".join(name.split())

    return name.lower()