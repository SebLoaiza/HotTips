from fastapi import APIRouter, UploadFile
from pathlib import Path

router = APIRouter()


@router.post("/upload/shifts")
async def upload_shifts(file: UploadFile):

    save_path = Path("data/raw") / file.filename

    save_path.parent.mkdir(parents=True, exist_ok=True)

    with open(save_path, "wb") as f:
        f.write(await file.read())

    return {
        "filename": file.filename,
        "saved_to": str(save_path)
    }