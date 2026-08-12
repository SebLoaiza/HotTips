export function renderRoleSelect(
    employee
) {


    return `

        <select
            class="distribution-role"
            data-id="${employee.employee_id}"
        >

            <option value="server"
                ${employee.distribution_role === "server" ? "selected" : ""}
            >
                Server
            </option>


            <option value="boh"
                ${employee.distribution_role === "boh" ? "selected" : ""}
            >
                BOH
            </option>


            <option value="busser/runner"
                ${employee.distribution_role === "busser/runner" ? "selected" : ""}
            >
                Busser
            </option>


            <option value="host"
                ${employee.distribution_role === "host" ? "selected" : ""}
            >
                Host
            </option>


            <option value="other"
                ${employee.distribution_role === "other" ? "selected" : ""}
            >
                Other
            </option>


        </select>

    `;


}