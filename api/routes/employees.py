from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.db import SessionLocal
from api.models import Employee

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/employees")
def get_employees(db: Session = Depends(get_db)):
    employees = db.query(Employee).all()

    return {
        "count": len(employees),
        "employees": [
            {
                "external_guid": e.external_guid,
                "name": e.name,
                "point": e.points,
            }
            for e in employees
        ],
    }


@router.get("/employees/{employee_guid}")
def get_employee(employee_guid: str, db: Session = Depends(get_db)):
    employee = (
        db.query(Employee)
        .filter(Employee.external_guid == employee_guid)
        .first()
    )

    if not employee:
        return {"error": "Employee not found"}

    return {
        "external_guid": employee.external_guid,
        "name": employee.name,
    }




@router.patch("/{employee_guid}/points")
def update_employee_points(
    employee_guid: str,
    points: float,
    db: Session = Depends(get_db)
):
    employee = (
        db.query(Employee)
        .filter(Employee.external_guid == employee_guid)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    employee.points = points

    db.commit()
    db.refresh(employee)

    return {
        "external_guid": employee.external_guid,
        "name": employee.name,
        "points": employee.points
    }