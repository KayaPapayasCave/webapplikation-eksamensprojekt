const HomePage = {
    components: {
        'measurement-card-component': MeasurementCardComponent,
        'line-chart': LineChartComponent,
        'doughnut-chart': DoughnutChartComponent,
        'measurements-table': MeasurementsTableComponent
    },
    template: /*html*/`
    <div class="default-page-setup">
        <div class="current-data-container">
            <measurement-card-component
                v-for="card in measurementCards"
                :key="card.label"
                :label="card.label"
                :value="this[card.key] ? this[card.key][card.field] : null"
                :unit="card.unit"
            />
        </div>

        <br> <br>

        <div class="graphics-data-container">
            <div class="card">
                <h2 class="title">Oversigt over målinger</h2>
                <br> <br> 
                <img v-bind:src="imgLineGraph">
                <!-- <line-chart 
                    v-if="chartLabels.length"
                    :labels="chartLabels"
                    :noise="chartNoiseData"
                    :humidity="chartHumidityData"
                    :temperature="chartTemperatureData"
                    :light="chartLightData"
                /> -->
                <br> <br>
            </div>
            <div class="card">
                <h2 class="title">Dominerende målinger</h2>
                <br> <br>
                <img v-bind:src="imgPieChart">
                <!-- <doughnut-chart 
                    v-if="chartLabels.length"
                    :labels="chartLabels"
                    :noise="chartNoiseData"
                    :humidity="chartHumidityData"
                    :temperature="chartTemperatureData"
                    :light="chartLightData"
                /> -->
                <br> <br>
            </div>
        </div>

        <br> <br>

        <measurements-table :rows="latestMeasurements"></measurements-table>
    </div>
    `,
    name: "DashboardPage",
    data() {
        return {
            measurementCards: [
                { label: "Støjniveau", key: "latestNoise", field: "decibel", unit: "dB" },
                { label: "Luftfugtighed", key: "latestHumidity", field: "humidityPercent", unit: "%" },
                { label: "Temperatur", key: "latestTemperature", field: "celsius", unit: "°C" },
                { label: "Lysstyrke", key: "latestLight", field: "lumen", unit: "lux" }
            ],

            imgLineGraph: './assets/images/LineGraph.png',
            imgPieChart: './assets/images/PieChart.png',

            latestMeasurements: [],
            
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
    async created() { // created() is called automatically when the page is loaded.
        console.log("created method called");

        // Run all API calls in parallel.
        await Promise.all([
            this.getAll(baseUriNoise, 'noisesList', 'Støjniveau', 'errorNoise', 'statuscodeNoise'),
            this.getAll(baseUriHumidity, 'humiditiesList', 'Fugtighed', 'errorHumidities', 'statuscodeHumidities'),
            this.getAll(baseUriTemperature, 'temperaturesList', 'Temperatur', 'errorTemperature', 'statuscodeTemperature'),
            this.getAll(baseUriLight, 'lightsList', 'Lysstyrke', 'errorLight', 'statuscodeLight'),
        ]);

        // Sort all the lists and get the latest measurement for each type.
        this.getLatest('noisesList', 'latestNoise');
        this.getLatest('humiditiesList', 'latestHumidity');
        this.getLatest('temperaturesList', 'latestTemperature');
        this.getLatest('lightsList', 'latestLight');

        // Sort latest measurements list by time (newest first)
        this.latestMeasurements.sort((a, b) => new Date(b.time) - new Date(a.time));
    },
    methods: {
        addRow(name, time, room, city, missed) { // Adds a row to the latest measurements table.
            this.latestMeasurements.push({ name: name, time: time, room: room, city: city, missed: missed });
        },
        async getAll(url, listKey, rowName, errorKey, statuscodeKey) { // Generic method to get all data from a given URL and store it in the specified list.
            this[errorKey] = null;

            await axios.get(url)
            .then(response => {
                this[listKey] = response.data;
                this[statuscodeKey] = response.status;

                this[listKey].forEach(light => {
                    this.addRow(rowName, new Date(light.time), 'R.D3.11', 'Roskilde', 'Nej');
                });
            })
            .catch(error => {
                this[listKey] = [];
                this[errorKey] = error.message;
            }) 
        },
        getLatest(listKey, outputKey) { // Generic method to get the latest measurement from a given list and store it in the specified output key.
            const list = this[listKey];
            if (!list.length) return;

            const copy = this[listKey].slice();   // Make a copy of the array to sort.
            const sorted = copy.sort((a, b) => new Date(b.time) - new Date(a.time));
            this[outputKey] = sorted[0];
        },
    },
    computed: {
        // Data for the line chart
        chartLabels() {
            return this.noisesList.map(x =>
                new Date(x.time).toLocaleDateString('da-DK')
            );
        },
        chartNoiseData() {
            return this.noisesList.map(x => x.decibel);
        },
        chartHumidityData() {
            return this.humiditiesList.map(x => x.humidityPercent);
        },
        chartTemperatureData() {
            return this.temperaturesList.map(x => x.celsius);
        },
        chartLightData() {
            return this.lightsList.map(x => x.lumen);
        }
    }
}