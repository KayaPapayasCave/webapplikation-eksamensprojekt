const HomePage = {
    components: {
        'line-chart': LineChartComponent,
        'donut-chart': DonutChartComponent,
        'measurements-table': MeasurementsTableComponent
    },
    template: /*html*/`
    <div class="default-page-setup">
        <div class="current-data-container">
            <div 
                v-for="card in measurementCards"
                :key="card.label"
                class="card"
                :class="card.colorClass"
            >
                <i :class="card.iconClass"></i>
                <p class="label">{{ card.label }}</p>
                <p class="value" v-if="this[card.key]?.[card.field] !== undefined">
                    {{ formattedValue(this[card.key][card.field]) }} {{ card.unit }}
                </p>
                <p class="sub">Seneste måling</p>
            </div>
        </div>

        <br> <br>

        <div class="graphics-data-container">
            <div class="card white-background">
                <h2 class="title">Oversigt over målinger</h2>
                <br>
                <!--<img v-bind:src="imgLineGraph">-->

                <line-chart
                    v-if="dataLoaded && filteredLatestMeasurements.length"
                    style="margin: auto;"
                    :labels="chartLabels"
                    :noise="chartNoiseData"
                    :humidity="chartHumidityData"
                    :temperature="chartTemperatureData"
                    :light="chartLightData"
                ></line-chart>

                <br>

                <div class="period-selection align-center">
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
                    :totalScore="calculateTotalScore()"
                ></donut-chart>
                <br>
            </div>
        </div>

        <br> <br>

        <measurements-table :rows="latestMeasurements"></measurements-table>

        <br> <br>

        <div class="card white-background align-center">
            <select v-model="selectedStationId">
                <option v-for="(name, id) in stations" :key="id" :value="id">
                    {{ name }}
                </option>
            </select>
            <button @click="loadWeather">Hent vejr</button>
            <div v-if="loading">Loading weather...</div>
            <div v-else-if="error">Error: {{ error }}</div>
            <div v-else>
                <div class="weather-emoji">{{ weatherEmoji }}</div>
                <p>
                    Temperatur: <strong>{{ temperature }}°C</strong>
                </p>   
                <p>
                    Luftfugtighed: <strong>{{ humidity }}%</strong>
                </p>
                <p>
                    Seneste observation: <strong>{{ formattedObservedTime }}</strong>
                </p>
            </div>
        </div>

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
                { label: "Støjniveau", key: "latestNoise", field: "decibel", unit: "dB", colorClass: "noise-color", iconClass: "fa-solid fa-volume-high" },
                { label: "Luftfugtighed", key: "latestHumidity", field: "humidityPercent", unit: "%", colorClass: "humidity-color", iconClass: "fa-solid fa-droplet" },
                { label: "Temperatur", key: "latestTemperature", field: "celsius", unit: "°C", colorClass: "temperature-color", iconClass: "fa-solid fa-temperature-high" },
                { label: "Lysstyrke", key: "latestLight", field: "lumen", unit: "lumen", colorClass: "light-color", iconClass: "fa-solid fa-lightbulb" }
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
            
            dataLoaded: false,
        }
    },
    mounted() {
        this.loadWeather(); // Loader vejr når komponent starter
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
        //this.latestMeasurements.sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));

        // Opdater latestMeasurements med alle fire målinger på samme række
        this.mergeMeasurements();

        console.log("NoisesList:", this.noisesList);
        console.log("HumiditiesList:", this.humiditiesList);
        console.log("TemperaturesList:", this.temperaturesList);
        console.log("LightsList:", this.lightsList);

        this.dataLoaded = true; // Sæt til true når alt er klar
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
            return filtered.length > 1 ? filtered : list;
        },
        mergeMeasurements() {
            const merged = [];

            // Assume that all lists are sortet by date and time.
            const allLists = [this.noisesList, this.humiditiesList, this.temperaturesList, this.lightsList];

            // Make a set of all unique timestamps
            const timestamps = new Set();
            allLists.forEach(list => { list.forEach(item => { timestamps.add(`${item.date}T${item.time}`); }); });

            // For each unique timestamp, find measurement from each list
            timestamps.forEach(ts => {
                const [date, time] = ts.split('T');
                const noise = this.noisesList.find(x => `${x.date}T${x.time}` === ts);
                const humidity = this.humiditiesList.find(x => `${x.date}T${x.time}` === ts);
                const temperature = this.temperaturesList.find(x => `${x.date}T${x.time}` === ts);
                const light = this.lightsList.find(x => `${x.date}T${x.time}` === ts);

                merged.push({date, time, 
                    noise: noise ? noise.decibel : null, 
                    humidity: humidity ? humidity.humidityPercent : null,
                    temperature: temperature ? temperature.celsius : null,
                    light: light ? light.lumen : null,
                    room: 'R.D3.11',   
                    city: 'Roskilde',
                });
            });

            // Sort by time (newest first)
            merged.sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));

            this.latestMeasurements = merged;
        },
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
        calculateTotalScore() {
            if (!this.latestNoise || !this.latestTemperature || !this.latestHumidity || !this.latestLight) {
                return 0; // eller null
            }

            const noiseScore = this.pointCalculator(this.calculateNoiseScore(this.latestNoise), 35);
            const temperatureScore = this.pointCalculator(this.calculateTemperatureScore(this.latestTemperature), 25);
            const humidityScore = this.pointCalculator(this.calculateHumidityScore(this.latestHumidity), 25);
            const lightScore = this.pointCalculator(this.calculateLightScore(this.latestLight), 15);

            return noiseScore + temperatureScore + humidityScore + lightScore;
        }
    },
    computed: {
        // Data for the line chart
        filteredLatestMeasurements() { return this.filterByPeriod(this.latestMeasurements); },

        chartTemperatureData() { return this.filteredLatestMeasurements.map(x => x.temperature); },
        chartNoiseData() { return this.filteredLatestMeasurements.map(x => x.noise); },
        chartHumidityData() { return this.filteredLatestMeasurements.map(x => x.humidity); },
        chartLightData() { return this.filteredLatestMeasurements.map(x => x.light); },
        chartLabels() { return this.filteredLatestMeasurements.map(x => `${x.date} ${x.time}`); },
    
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
        },

        formattedObservedTime() {
            if (!this.observedTime) return "";
            const date = new Date(this.observedTime);

            return date.toLocaleString("da-DK", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        },
    }
}