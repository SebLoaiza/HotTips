#tester_main.py

from tester_csv_loader import load_csv
from tester_shift_builder import build_shifts
from tester_printer import print_shift


def main():
    rows = load_csv("shifts.csv")
    shifts = build_shifts(rows)
    print_shift(shifts)
    

if __name__ == "__main__":
    main()