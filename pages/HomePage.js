const HomePage = {
    components: {
        'measurement-card-component': MeasurementCardComponent,
        'line-chart': LineChartComponent,
        'donut-chart': DonutChartComponent,
        'measurements-table': MeasurementsTableComponent
    },
    template: /*html*/`
    <div class="default-page-setup">

        <div class="card white-background">
            <label>Vælg station: </label>
            <select v-model="selectedStationId">
                <option v-for="(name, id) in stations" :key="id" :value="id">
                    {{ name }} ({{ id }})
                </option>
            </select>
            <button @click="loadWeather">Hent vejr</button>
            <div v-if="loading">Loading weather...</div>
            <div v-else-if="error">Error: {{ error }}</div>
            <div v-else>
                <p>
                    Nuværende temperatur: <strong>{{ temperature }}°C {{ weatherEmoji }}</strong>
                </p>   
                <p>
                    Nuværende luftfugtighed: <strong>{{ humidity }}%</strong>
                </p>
                <p>
                    Station: <strong>{{ stationId }} {{ stationName }}</strong>
                </p>
                <p>
                    Observeret: <strong>{{ observedTime }}</strong>
                </p>
            </div>
        </div>

        <br> <br>

        <div class="current-data-container">
            <measurement-card-component
                v-for="card in measurementCards"
                :key="card.label"
                :label="card.label"
                :value="this[card.key] ? formattedValue(this[card.key][card.field]) : null"
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

                <div class="period-selection">
                    <button class="period-button" v-for="opt in periodOptions"
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

            temperature: null,
            humidity: null,
            stationId: null,
            stationName: null,
            observedTime: null,

            loading: true,
            error: null,

            stations: {
                "06170": "Roskilde Lufthavn",
                "06041": "København / Amager",
                "06120": "Odense",
            },

            selectedStationId: "06170",
            
        }
    },
    mounted() {
        this.loadWeather(); // Loader vejr når komponent starter
    },
    methods: {
        async loadWeather() {
            this.loading = true;
            this.error = null;

            try {
                // Promise.all kører begge requests parallelt.
                const [resTemp, resHum] = await Promise.all([
                    axios.get("https://dmigw.govcloud.dk/v2/metObs/collections/observation/items", {
                        params: {
                            "api-key": "b3db5738-de35-4386-a5ad-7403d08e1a98",
                            parameterId: "temp_dry", // Henter temperatur
                            stationId: this.selectedStationId
                        }
                    }),
                    axios.get("https://dmigw.govcloud.dk/v2/metObs/collections/observation/items", {
                        params: {
                            "api-key": "b3db5738-de35-4386-a5ad-7403d08e1a98",
                            parameterId: "humidity", // Henter luftfugtighed
                            stationId: this.selectedStationId
                        }
                    })
                ]);

                const tempItem = resTemp.data.features?.[0]?.properties;
                const humItem  = resHum.data.features?.[0]?.properties;

                if (!tempItem || !humItem) {
                    throw new Error("Ingen data tilgængelig for denne station");
                }

                this.temperature = tempItem.value;
                this.humidity = humItem.value;
                this.stationId = tempItem.stationId;
                this.stationName = this.stations[this.stationId] ?? "Ukendt station";
                this.observedTime = tempItem.observed;
            }
            catch (err) {
                this.error = err.message;
            }
            finally {
                this.loading = false;
            }
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
        this.latestMeasurements.sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));
    },
    methods: {
        addRow(name, date, time, room, city, measurement, missed) { // Adds a row to the latest measurements table.
            this.latestMeasurements.push({ name: name, date: date, time: time, room: room, city: city, measurement: measurement, missed: missed });
        },
        async getAll(url, listKey, rowName, errorKey, statuscodeKey, measurementType) { // Generic method to get all data from a given URL and store it in the specified list.
            this[errorKey] = null;

            await axios.get(url)
            .then(response => {
                this[listKey] = response.data;
                this[statuscodeKey] = response.status;

                this[listKey].forEach(element => {
                    this.addRow(rowName, element.date, element.time, 'R.D3.11', 'Roskilde', element[measurementType], 'Nej');
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
            const sorted = copy.sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));
            this[outputKey] = sorted[0];
        },
        filterByPeriod(list) {
            const now = new Date();
            let cutoff;

            switch (this.selectedPeriod) {
                case '24h': cutoff = new Date(now.getTime() - 24*60*60*1000); break;
                case '7d':  cutoff = new Date(now.getTime() - 7*24*60*60*1000); break;
                case '30d': cutoff = new Date(now.getTime() - 30*24*60*60*1000); break;
                default: return list;
            }

            const filtered = list.filter(item =>
                new Date(`${item.date}T${item.time}`) >= cutoff
            );

            // Hvis ingen data i perioden → fallback til "vis alt"
            return filtered.length > 0 ? filtered : list;
        },
    },
    computed: {
        // Data for the line chart
        filteredNoisesList() { return this.filterByPeriod(this.noisesList); },
        filteredHumiditiesList() { return this.filterByPeriod(this.humiditiesList); },
        filteredTemperaturesList() { return this.filterByPeriod(this.temperaturesList); },
        filteredLightsList() { return this.filterByPeriod(this.lightsList); },

        chartLabels() { return this.filteredNoisesList.map(x => new Date(`${x.date}T${x.time}`).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })); },
        
        chartNoiseData() { return this.filteredNoisesList.map(x => x.decibel); },
        chartHumidityData() { return this.filteredHumiditiesList.map(x => x.humidityPercent); },
        chartTemperatureData() { return this.filteredTemperaturesList.map(x => x.celsius); },
        chartLightData() { return this.filteredLightsList.map(x => x.lumen); },
    
        // Max 1 decimal for each measurement card.
        formattedValue() {
            return (value) => {
                if (value === null || value === undefined) return null;
                return Number(value).toFixed(1);
            };
        },

        weatherEmoji() {
        if (this.temperature < 10) {
            return "☁️";
        } else if (this.temperature >= 10 && this.temperature <= 15) {
            return "⛅";
        } else {
            return "☀️";
        }
    }
}}