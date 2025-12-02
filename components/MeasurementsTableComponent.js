const MeasurementsTableComponent = {
    props: ["rows"],
    template: /*html*/`
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
                        <td>{{ format(row.time) }}</td>
                        <td>{{ row.room }}</td>
                        <td>{{ row.city }}</td>
                        <td>{{ row.missed }}</td>
                        <td>Detaljer</td>
                        <td>Se oversigt</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,
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
    }
}