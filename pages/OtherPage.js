const OtherPage = {
    template: /*html*/`
    <div class="default-page-setup">
        <div class="current-data-container">
            <div class="card">
                <p class="label">Støjniveau</p>
                <p class="value">100 dB</p>
                <p class="sub">Gennemsnit</p>
            </div>
            <div class="card">
                <p class="label">Luftfugtighed</p>
                <p class="value">89,9 %</p>
                <p class="sub">Gennemsnit</p>
            </div>
            <div class="card">
                <p class="label">Temperatur</p>
                <p class="value">25 °C</p>
                <p class="sub">Gennemsnit</p>
            </div>
            <div class="card">
                <p class="label">Lysstyrke</p>
                <p class="value">500 lux</p>
                <p class="sub">Gennemsnit</p>
            </div>
        </div>

        <br> <br>

        <div class="graphics-data-container">
            <div class="card">
                <h2 class="title">Oversigt over målinger</h2>
                <br> <br> 
                <img v-bind:src="imgLineGraph">
                <br> <br>
            </div>
            <div class="card">
                <h2 class="title">Dominerende målinger</h2>
                <br> <br>
                <img v-bind:src="imgPieChart">
                <br> <br>
            </div>
        </div>

        <br> <br>

        <div class="card">
            <h2 class="title">Seneste målinger</h2>
            <table>
                <thead>
                    <tr>
                        <th>Måling</th>
                        <th>Tidspunkt for logging</th>
                        <th>Lokale</th>
                        <th>By</th>
                        <th>Udeblevet</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, index) in rows" :key="index">
                        <td>{{ row.name }}</td>
                        <td>{{ row.time }}</td>
                        <td>{{ row.room }}</td>
                        <td>{{ row.city }}</td>
                        <td>{{ row.missed }}</td>
                        <td>Detaljer</td>
                        <td>Se oversigt</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    `,
    name: "DashboardPage",
    data() {
        return {
            imgLineGraph: './assets/images/LineGraph.png',
            imgPieChart: './assets/images/PieChart.png',
            rows: [
                { name: 'Støjniveau', time: '24. december, 2025, 17:10', room: 'R.D3.11', city: 'Roskilde', missed: 'Nej' },
                { name: 'Fugtighed', time: '24. december, 2025, 17:10', room: 'R.D3.11', city: 'Roskilde', missed: 'Nej' },
                { name: 'Temperatur', time: '24. december, 2025, 17:10', room: 'R.D3.11', city: 'Roskilde', missed: 'Ja' },
                { name: 'Lysstyrke', time: '24. december, 2025, 17:10', room: 'R.D3.11', city: 'Roskilde', missed: 'Nej' },
            ]
        }
    },
    methods: {

    }
}