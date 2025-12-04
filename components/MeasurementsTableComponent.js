const MeasurementsTableComponent = {
    props: ["rows"],
    template: /*html*/`
        <div class="card white-background">
            <h2 class="title">Seneste målinger</h2>
            <table>
                <thead>
                    <tr>
                        <th>Måling</th>
                        <th>Tidspunkt for logging</th>
                        <th>Lokale</th>
                        <th>By</th>
                        <th>Måling</th>
                        <th>Udeblevet</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, index) in paginatedRows" :key="index">
                        <td>{{ row.name }}</td>
                        <td>{{ format(row.time) }}</td>
                        <td>{{ row.room }}</td>
                        <td>{{ row.city }}</td>
                        <td>{{ row.measurement }}</td>
                        <td>{{ row.missed }}</td>
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
        format(date) {
            return new Date(date).toLocaleDateString('da-DK', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            }) + ', ' + new Date(date).toLocaleTimeString('da-DK', {
                hour: '2-digit',
                minute: '2-digit'
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