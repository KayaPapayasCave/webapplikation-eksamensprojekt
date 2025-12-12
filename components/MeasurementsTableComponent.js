const MeasurementsTableComponent = {
    props: ["rows"],
    template: /*html*/`
        <div class="card white-background">
            <h2 class="title">Seneste målinger - R.D3.11</h2>
            <table>
                <thead>
                    <tr>
                        <th>Tidspunkt for logging</th>
                        <th>Støjniveau (dB)</th>
                        <th>Luftfugtighed (%)</th>
                        <th>Temperatur (°C)</th>
                        <th>Lysstyrke (lumen)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, index) in paginatedRows" :key="index">
                        <td>{{ format(row.date, row.time) }}</td>
                        <td>{{ row.noise !== null ? row.noise.toFixed(1) : '-' }}</td>
                        <td>{{ row.humidity !== null ? row.humidity.toFixed(1) : '-' }}</td>
                        <td>{{ row.temperature !== null ? row.temperature.toFixed(1) : '-' }}</td>
                        <td>{{ row.light !== null ? row.light.toFixed(1) : '-' }}</td>
                    </tr>
                </tbody>
            </table>

            <div class="pagination" v-if="totalPages > 1" style="margin-top: 1rem;">
                <button :disabled="currentPage === 1" style="margin-right: 10px;" @click="currentPage--">Forrige</button>
                <span>Side {{ currentPage }} af {{ totalPages }}</span>
                <button :disabled="currentPage === totalPages" style="margin-left: 10px;" @click="currentPage++">Næste</button>
            </div>
        </div>
    `,
    data() {
        return {
            currentPage: 1,
            rowsPerPage: 5 // hvor mange rækker per side
        }
    },
    methods: {
        // Makes a date look nice in Danish format.
        format(date, time) {
            const dt = new Date(`${date}T${time}`);
            return dt.toLocaleDateString('da-DK', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }) + ', ' + dt.toLocaleTimeString('da-DK', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
    },
    computed: {
        paginatedRows() {
            const start = (this.currentPage - 1) * this.rowsPerPage;
            return this.rows.slice(start, start + this.rowsPerPage);
        },
        totalPages() {
            return Math.ceil(this.rows.length / this.rowsPerPage);
        }
    }
}