import { formatMoney } from "./formatters.js";


export function renderMoneySummary(block) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "money-summary";


    wrapper.innerHTML = `

        <table>

            <thead>

                <tr>

                    <th>Pool</th>
                    <th>Cash</th>
                    <th>Card</th>

                </tr>

            </thead>


            <tbody>

                <!-- SERVERS -->

                <tr>

                    <td>
                        Servers
                    </td>

                    <td>
                        ${formatMoney(
                            block.servers_cash ?? 0
                        )}
                    </td>

                    <td>
                        ${formatMoney(
                            block.servers_card ?? 0
                        )}
                    </td>

                </tr>


                <!-- BUSSERS -->

                <tr>

                    <td>
                        Bussers
                    </td>

                    <td>
                        ${formatMoney(
                            block.busser_cash ?? 0
                        )}
                    </td>

                    <td>
                        ${formatMoney(
                            block.busser_card ?? 0
                        )}
                    </td>

                </tr>


                <!-- HOSTS -->

                <tr>

                    <td>
                        Hosts
                    </td>

                    <td>
                        ${formatMoney(
                            block.host_cash ?? 0
                        )}
                    </td>

                    <td>
                        ${formatMoney(
                            block.host_card ?? 0
                        )}
                    </td>

                </tr>


                <!-- BOH -->

                <tr>

                    <td>
                        BOH
                    </td>

                    <td>
                        ${formatMoney(
                            block.boh_cash ?? 0
                        )}
                    </td>

                    <td>
                        ${formatMoney(
                            block.boh_card ?? 0
                        )}
                    </td>

                </tr>

            </tbody>

        </table>

    `;


    return wrapper;

}