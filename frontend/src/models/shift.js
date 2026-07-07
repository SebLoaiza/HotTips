export class EmployeeShift {

    constructor(data) {

        this.employee_id = data["Employee Guid"];

        this.name = data["Employee"];

        this.role = data["Job"];

        this.date = data["Date"];

        this.start = timeToMinutes(data["Time In"]);

        this.end = timeToMinutes(data["Time Out"]);

        this.breaks = [];

    }

}