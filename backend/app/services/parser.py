import pandas as pd
from io import StringIO


def load_csv(file_bytes: bytes):
    text = file_bytes.decode("utf-8", errors="ignore")
    
    df = pd.read_csv(StringIO(text))

    # Clean column names
    df.columns = [c.strip() for c in df.columns]

    return df