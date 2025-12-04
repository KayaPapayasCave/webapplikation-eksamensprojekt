const HomePage = {
    components: {
        'measurement-card-component': MeasurementCardComponent,
        'line-chart': LineChartComponent,
        'donut-chart': DonutChartComponent,
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
                :class="card.colorClass"
                :colorClass="card.colorClass"
            />
        </div>

        <br> <br>

        <div class="graphics-data-container">
            <div class="card white-background">
                <h2 class="title">Oversigt over målinger</h2>
                <br>
                <!--<img v-bind:src="imgLineGraph">-->

                <line-chart
                    v-if="chartLabels.length"
                    style="width: 800px; height: 300px; margin: auto;"
                    :labels="chartLabels"
                    :noise="chartNoiseData"
                    :humidity="chartHumidityData"
                    :temperature="chartTemperatureData"
                    :light="chartLightData"
                ></line-chart>

                <br>

                <div class="period-selector">
                    <button v-for="opt in periodOptions"
                            :key="opt.value"
                            :class="{ active: selectedPeriod === opt.value }"
                            @click="selectedPeriod = opt.value">
                        {{ opt.label }}
                    </button>
                </div>

                <br>
            </div>
            <div class="card white-background">
                <h2 class="title">Dominerende målinger</h2>
                <br>
                <!--<img v-bind:src="imgPieChart">-->
                <donut-chart
                    style="margin: auto;"
                    :noise="latestNoise ? latestNoise.decibel : null"
                    :humidity="latestHumidity ? latestHumidity.humidityPercent : null"
                    :temperature="latestTemperature ? latestTemperature.celsius : null"
                    :light="latestLight ? latestLight.lumen : null"
                ></donut-chart>
                <br>
            </div>
        </div>

        <br> <br>

        <measurements-table :rows="latestMeasurements"></measurements-table>
    </div>
    `,
    name: "DashboardPage",
    data() {
        return {
            selectedPeriod: '24h',
            periodOptions: [
                { label: '1 døgn', value: '24h' },
                { label: '1 uge', value: '7d' },
                { label: '1 måned', value: '30d' }
            ],

            measurementCards: [
                { label: "Støjniveau", key: "latestNoise", field: "decibel", unit: "dB", colorClass: "noise-color" },
                { label: "Luftfugtighed", key: "latestHumidity", field: "humidityPercent", unit: "%", colorClass: "humidity-color" },
                { label: "Temperatur", key: "latestTemperature", field: "celsius", unit: "°C", colorClass: "temperature-color" },
                { label: "Lysstyrke", key: "latestLight", field: "lumen", unit: "lumen", colorClass: "light-color" }
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
            this.getAll(baseUriNoise, 'noisesList', 'Støjniveau', 'errorNoise', 'statuscodeNoise', 'decibel'),
            this.getAll(baseUriHumidity, 'humiditiesList', 'Fugtighed', 'errorHumidities', 'statuscodeHumidities', 'humidityPercent'),
            this.getAll(baseUriTemperature, 'temperaturesList', 'Temperatur', 'errorTemperature', 'statuscodeTemperature', 'celsius'),
            this.getAll(baseUriLight, 'lightsList', 'Lysstyrke', 'errorLight', 'statuscodeLight', 'lumen'),
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
        addRow(name, time, room, city, measurement, missed) { // Adds a row to the latest measurements table.
            this.latestMeasurements.push({ name: name, time: time, room: room, city: city, measurement: measurement, missed: missed });
        },
        async getAll(url, listKey, rowName, errorKey, statuscodeKey, measurementType) { // Generic method to get all data from a given URL and store it in the specified list.
            this[errorKey] = null;

            await axios.get(url)
            .then(response => {
                this[listKey] = response.data;
                this[statuscodeKey] = response.status;

                this[listKey].forEach(element => {
                    this.addRow(rowName, new Date(element.time), 'R.D3.11', 'Roskilde', element[measurementType], 'Nej');
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
        filterByPeriod(list) {
            const now = new Date();
            let cutoff;
            switch(this.selectedPeriod) {
                case '24h': cutoff = new Date(now.getTime() - 24*60*60*1000); break;
                case '7d': cutoff = new Date(now.getTime() - 7*24*60*60*1000); break;
                case '30d': cutoff = new Date(now.getTime() - 30*24*60*60*1000); break;
                default: return list;
            }
            return list.filter(item => new Date(item.time) >= cutoff);
        }
    },
    computed: {
        // Data for the line chart
        filteredNoisesList() { return this.filterByPeriod(this.noisesList); },
        filteredHumiditiesList() { return this.filterByPeriod(this.humiditiesList); },
        filteredTemperaturesList() { return this.filterByPeriod(this.temperaturesList); },
        filteredLightsList() { return this.filterByPeriod(this.lightsList); },

        chartLabels() { return this.filteredNoisesList.map(x => new Date(x.time).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })); },
        chartNoiseData() { return this.filteredNoisesList.map(x => x.decibel); },
        chartHumidityData() { return this.filteredHumiditiesList.map(x => x.humidityPercent); },
        chartTemperatureData() { return this.filteredTemperaturesList.map(x => x.celsius); },
        chartLightData() { return this.filteredLightsList.map(x => x.lumen); }
    }
}