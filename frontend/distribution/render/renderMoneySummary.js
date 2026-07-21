import { formatMoney } from "./formatters.js";

export function renderMoneySummary(block) {

    const wrapper =
        document.createElement("div");

    wrapper.className = "money-summary";

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

                <tr>
                    <td>Servers</td>
                    <td>${formatMoney(block.servers_cash)}</td>
                    <td>${formatMoney(block.servers_card)}</td>
                </tr>

                <tr>
                    <td>BOH</td>
                    <td>${formatMoney(block.boh_cash)}</td>
                    <td>${formatMoney(block.boh_card)}</td>
                </tr>

                <tr>
                    <td>Bussers</td>
                    <td>${formatMoney(block.busser_cash)}</td>
                    <td>${formatMoney(block.busser_card)}</td>
                </tr>

                <tr>
                    <td>Hosts</td>
                    <td>${formatMoney(block.host_cash)}</td>
                    <td>${formatMoney(block.host_card)}</td>
                </tr>

            </tbody>

        </table>

    `;

    return wrapper;

}