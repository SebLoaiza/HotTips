import { renderMoneySummary }
from "./renderMoneySummary.js";


import { renderEmployeeTable }
from "./renderEmployeeTable.js";


import { rebuildDistributionPools }
from "./../logic/rebuildDistributionPools.js";


import { calculateRoleRatios }
from "./../logic/calculateRoleRatios.js";


export function renderMealBlock(
    block,
    refreshUI
) {


    const section =
        document.createElement("div");


    section.className =
        "meal-block";



    section.innerHTML = `

        <h2>
            ${block.meal}
            -
            ${block.date}
        </h2>

    `;



    section.appendChild(
        renderMoneySummary(block)
    );



    section.appendChild(
        renderEmployeeTable(
            "Tip Owners",
            block.tipOwners,
            block
            )
    );

    section.appendChild(
        renderEmployeeTable(
            "Servers",
            block.servers,
            block
        )
    );

    section.appendChild(
        renderEmployeeTable(
            "BOH",
            block.boh,
            block
        )
    );

    section.appendChild(
        renderEmployeeTable(
            `Bussers (${(block.busser_ratio * 100).toFixed(0)}%)`,
            block.bussers,
            block
        )
    );

    section.appendChild(
        renderEmployeeTable(
            `Hosts (${(block.host_ratio * 100).toFixed(0)}%)`,
            block.hosts,
            block
        )
    );

    section.appendChild(
        renderEmployeeTable(
            "Other",
            block.others,
            block
        )
    );



    attachRoleListeners(
        section,
        block,
        refreshUI
    );



    return section;

}





function attachRoleListeners(
    section,
    block,
    refreshUI
) {


    const selects =
        section.querySelectorAll(
            ".distribution-role"
        );



    for (const select of selects) {


        select.addEventListener(
            "change",
            () => {


                const employee =
                    block.employees.find(
                        emp =>
                            emp.employee_id ===
                            select.dataset.id
                    );


                if (!employee) {
                    return;
                }



                employee.distribution_role =
                    select.value;



                rebuildDistributionPools(
                    block
                );



                calculateRoleRatios(
                    block
                );





                refreshUI();


            }
        );


    }


}