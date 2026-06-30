from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from api.db import Base, engine

from api.routes.csv import router as csv_router
from api.routes.employees import router as employee_router
from api.routes.meal_blocks import router as meal_router
from api.routes.orders import router as orders_router

import os

# =====================================================
# APP INIT
# =====================================================

app = FastAPI()

# =====================================================
# DB INIT
# =====================================================

Base.metadata.create_all(bind=engine)

# =====================================================
# ROUTES
# =====================================================

app.include_router(csv_router, prefix="/api")
app.include_router(employee_router, prefix="/api")
app.include_router(meal_router, prefix="/api")
app.include_router(orders_router, prefix="/api")

# =====================================================
# STATIC FRONTEND
# =====================================================

app.mount("/static", StaticFiles(directory="frontend"), name="static")

@app.get("/")
def root():
    return FileResponse(os.path.join("frontend", "index.html"))