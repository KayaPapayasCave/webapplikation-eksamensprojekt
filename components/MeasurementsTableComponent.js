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
                        <th>Score (0-100)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, index) in paginatedRows" :key="index">
                        <td>{{ format(row.date, row.time) }}</td>
                        <td>{{ row.noise !== null ? row.noise.toFixed(1) : '-' }}</td>
                        <td>{{ row.humidity !== null ? row.humidity.toFixed(1) : '-' }}</td>
                        <td>{{ row.temperature !== null ? row.temperature.toFixed(1) : '-' }}</td>
                        <td>{{ row.light !== null ? row.light.toFixed(1) : '-' }}</td>
                          {{
                            calculateRowTotalScore(
                                { decibel: row.noise },
                                { celsius: row.temperature },
                                { humidityPercent: row.humidity },
                                { lumen: row.light }
                            ).toFixed(1)
                        }}
                    </tr>
                </tbody>
            </table>

            <div class="pagination align-center" v-if="totalPages > 1" style="margin-top: 1rem;">
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
        },
        calculateNoiseScore(noise) {
            // lyd
            let score;
            if (noise.decibel <= 60) {
                score = 100.0;
            } else if (noise.decibel >= 75) {
                score = 0.0;
            } else {
                score = 100.0 * (75.0 - noise.decibel) / (75.0 - 60.0);
            }

            return score;
        },
        calculateTemperatureScore(temperature) {
            // temperatur
            let score;
            if (temperature.celsius <= 17) {
                score = 0.0;
            } else if (temperature.celsius <= 21) {                     
                score = 100.0 * (temperature.celsius - 17.0) / (21.0 - 17.0);
            } else if (temperature.celsius < 28) {                          
                score = 100.0 * (28.0 - temperature.celsius) / (28.0 - 21.0);
            } else {
                score = 0.0;
            }

            return score;
        },
        calculateHumidityScore(humidity) {
            // fugtighed
            let score;
            if (humidity.humidityPercent <= 0) {
                score = 50.0;                        
            } else if (humidity.humidityPercent <= 12.5) {
                score = 50.0 + 4.0 * humidity.humidityPercent;             
            } else if (humidity.humidityPercent < 45) {    
                score = (40.0/13.0) * (45.0 - humidity.humidityPercent);    
            } else {
                score = 0.0;
            }

            return score;
        },
        calculateLightScore(light) {
            // lys
            let score;
            if (light.lumen <= 200) {
                score = 0.0;
            } else if (light.lumen <= 5000) {    
                score = 100.0 * (light.lumen - 200.0) / (5000.0 - 200.0);
            } else if (light.lumen < 10000) {    
                score = 100.0 * (10000.0 - light.lumen) / (10000.0 - 5000.0);
            } else {
                score = 0.0;
            }

            return score;
        },
        pointCalculator(score, point) {
            return (score/100)*point;
        },
        calculateRowTotalScore(noise, temperature, humidity, light) {
            if (!noise || !temperature || !humidity || !light) {
                return 0; // eller null
            }

            const noiseScore = this.pointCalculator(this.calculateNoiseScore(noise), 35);
            const temperatureScore = this.pointCalculator(this.calculateTemperatureScore(temperature), 25);
            const humidityScore = this.pointCalculator(this.calculateHumidityScore(humidity), 25);
            const lightScore = this.pointCalculator(this.calculateLightScore(light), 15);

            return noiseScore + temperatureScore + humidityScore + lightScore;
        },
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