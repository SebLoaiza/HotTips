from fastapi import APIRouter, UploadFile, File
import csv
import io

from api.services.orders import parse_orders

router = APIRouter()


@router.post("/orders")
async def upload_orders(file: UploadFile = File(...)):

    # 1. read file contents
    contents = await file.read()
    text = contents.decode("utf-8")

    # 2. convert to CSV dict rows
    reader = csv.DictReader(io.StringIO(text))
    rows = list(reader)

    # 3. parse into Order objects
    orders = parse_orders(rows)

    # 4. return clean JSON
    return [o.__dict__ for o in orders]