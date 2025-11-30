const OtherPage = {
    template: /*html*/`
    <div class="default-page-setup">
        <div class="current-data-container">
            <div class="card">
                <p class="label">Støjniveau</p>
                <!-- <p class="value">100 dB</p> -->
                <p class="value" v-if="latestNoise">{{latestNoise.decibel}} dB</p>
                <p class="sub">Gennemsnit</p>
            </div>
            <div class="card">
                <p class="label">Luftfugtighed</p>
                <!-- <p class="value">89,9 %</p> -->
                <p class="value" v-if="latestHumidity">{{latestHumidity.humidityPercent}} %</p>
                <p class="sub">Gennemsnit</p>
            </div>
            <div class="card">
                <p class="label">Temperatur</p>
                <!-- <p class="value">25 °C</p> -->
                <p class="value" v-if="latestTemperature">{{latestTemperature.celsius}} °C</p>
                <p class="sub">Gennemsnit</p>
            </div>
            <div class="card">
                <p class="label">Lysstyrke</p>
                <!-- <p class="value">500 lux</p> -->
                <p class="value" v-if="latestLight">{{latestLight.lumen}} lux</p>
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
                    <tr v-for="(row, index) in latestMeasurements" :key="index">
                        <td>{{ row.name }}</td>
                        <td>{{ formatDate(row.time) }}</td>
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
            latestMeasurements: [
                // { name: 'Støjniveau', time: '24. december, 2025, 17:10', room: 'R.D3.11', city: 'Roskilde', missed: 'Nej' },
                // { name: 'Fugtighed', time: '24. december, 2025, 17:10', room: 'R.D3.11', city: 'Roskilde', missed: 'Nej' },
                // { name: 'Temperatur', time: '24. december, 2025, 17:10', room: 'R.D3.11', city: 'Roskilde', missed: 'Ja' },
                // { name: 'Lysstyrke', time: '24. december, 2025, 17:10', room: 'R.D3.11', city: 'Roskilde', missed: 'Nej' },
            ],
            
            noisesList: [],
            humiditiesList: [],
            temperaturesList: [],
            lightsList: [],

            latestNoise: null,
            latestHumidity: null,
            latestTemperature: null,
            latestLight: null,

            errorNoise: null, 
            errorHumidities: null, 
            errorTemperature: null, 
            errorLight: null, 

            statuscodeNoise: null,
            statuscodeHumidities: null,
            statuscodeTemperature: null,
            statuscodeLight: null,
        }
    },
    // created() is called automatically when the page is loaded.
    async created() {
        console.log("created method called");

        // Run all API calls in parallel
        await Promise.all([
            this.getAllNoises(),
            this.getAllHumidities(),
            this.getAllTemperatures(),
            this.getAllLights()
        ]);

        this.getLatestNoise();
        this.getLatestHumidity();
        this.getLatestTemperature();
        this.getLatestLight();

        // Sort latest measurements by time (newest first)
        this.latestMeasurements.sort((a, b) => new Date(b.time) - new Date(a.time));
    },
    methods: {
        formatDate(date) {
            return new Date(date).toLocaleDateString('da-DK', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            }) + ', ' + new Date(date).toLocaleTimeString('da-DK', {
                hour: '2-digit',
                minute: '2-digit'
            });
        },
        addRow(name, time, room, city, missed) {
            this.latestMeasurements.push({ name: name, time: time, room: room, city: city, missed: missed });
        },
        async getAllNoises() {
            this.errorNoise = null;

            await axios.get(baseUriNoise)
            .then(response => {
                this.noisesList = response.data;
                this.statuscodeNoise = response.status;

                this.noisesList.forEach(noise => {
                    this.addRow('Støjniveau', new Date(noise.time), 'R.D3.11', 'Roskilde', 'Nej');
                });
            })
            .catch(error => {
                this.noisesList = [];
                this.errorNoise = error.message;
            })  
        },
        async getAllHumidities() {
            this.errorHumidities = null;

            await axios.get(baseUriHumidity)
            .then(response => {
                this.humiditiesList = response.data;
                this.statuscodeHumidities = response.status;

                this.humiditiesList.forEach(humidity => {
                    this.addRow('Fugtighed', new Date(humidity.time), 'R.D3.11', 'Roskilde', 'Nej');
                });
            })
            .catch(error => {
                this.humiditiesList = [];
                this.errorHumidities = error.message;
            })  
        },
        async getAllTemperatures() {
            this.errorTemperature = null;

            await axios.get(baseUriTemperature)
            .then(response => {
                this.temperaturesList = response.data;
                this.statuscodeTemperature = response.status;

                this.temperaturesList.forEach(temp => {
                    this.addRow('Temperatur', new Date(temp.time), 'R.D3.11', 'Roskilde', 'Nej');
                });
            })
            .catch(error => {
                this.temperaturesList = [];
                this.errorTemperature = error.message;
            })  
        },
        async getAllLights() {
            this.errorLight = null;

            await axios.get(baseUriLight)
            .then(response => {
                this.lightsList = response.data;
                this.statuscodeLight = response.status;

                this.lightsList.forEach(light => {
                    this.addRow('Lysstyrke', new Date(light.time), 'R.D3.11', 'Roskilde', 'Nej');
                });
            })
            .catch(error => {
                this.lightsList = [];
                this.errorLight = error.message;
            })  
        },
        getLatestNoise() {
            if (!this.noisesList.length) return;

            const copy = this.noisesList.slice();   // Make a copy of the array
            copy.sort((a, b) => new Date(b.time) - new Date(a.time));

            this.latestNoise = copy[0];
        },
        getLatestHumidity() {
            if (!this.humiditiesList.length) return;

            const copy = this.humiditiesList.slice();   // Make a copy of the array
            copy.sort((a, b) => new Date(b.time) - new Date(a.time));

            this.latestHumidity = copy[0];
        },
        getLatestTemperature() {
            if (!this.temperaturesList.length) return;

            const copy = this.temperaturesList.slice();   // Make a copy of the array
            copy.sort((a, b) => new Date(b.time) - new Date(a.time));

            this.latestTemperature = copy[0];
        },
        getLatestLight() {
            if (!this.lightsList.length) return;

            const copy = this.lightsList.slice();   // Make a copy of the array
            copy.sort((a, b) => new Date(b.time) - new Date(a.time));

            this.latestLight = copy[0];
        }
    }
}