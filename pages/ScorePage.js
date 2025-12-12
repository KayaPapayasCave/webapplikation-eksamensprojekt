const ScorePage = {
    components: {
        'measurements-table': MeasurementsTableComponent
    },
    template: /*html*/`
    <div class="default-page-setup">
        <!-- <measurements-table :rows="latestMeasurements"></measurements-table> -->

        <!-- <br> <br> -->

        <div class="card white-background">
            <h2 class="title">Sundhedsscore</h2>
            <p>
                Sundhedsscoren giver et hurtigt overblik over, hvor godt indeklimaet i rummet er lige nu. <br>
                Vi måler fire ting: støjniveau, temperatur, luftfugtighed og lysstyrke. Ud fra dem beregner vi en samlet score, 
                der viser, om omgivelserne gør det lettere eller sværere at koncentrere sig.

                <br><br>

                Scoren hjælper både studerende og undervisere med at få en bedre fornemmelse af, 
                hvordan rummet påvirker fokus og trivsel - noget der kan være svært at mærke i hverdagen.
            </p>
        </div>

        <br> <br>

        <div class="current-data-container">
            <div 
                v-for="card in healthyScoreCards"
                :key="card.label"
                class="card"
                :class="card.colorClass"
            >
                <i :class="card.iconClass"></i>
                <p class="label">{{ card.label }}</p>
                <p class="value">
                    {{ card.healthyScore }} {{ card.unit }}
                </p>
                <p class="sub">Sundhedsscore</p>
            </div>
        </div>

        <br> <br>

        <div class="card white-background">
            <h2 class="title">Hvordan beregner vi scoren?</h2>
            <p>
                For hver måling giver vi et tal mellem 0 og 100, hvor 100 er optimalt. Derefter vægter vi dem forskelligt, alt efter hvor meget de typisk påvirker koncentrationen.
            </p>

            <br>

            <ul>
                <li>
                    <strong>Støjniveau (vægter 35 % af totalen):</strong><br>
                    Når rummet er stille (under ca. 60 dB), får man den højeste score. Jo tættere støjen kommer på 75 dB, jo lavere bliver scoren.
                </li>
                <br>
                <li>
                    <strong>Temperatur (vægter 25 % af totalen):</strong><br>
                    Temperaturen scorer højest i området omkring 20-21 grader. Er det for koldt eller for varmt, falder scoren gradvist.
                </li>
                <br>
                <li>
                    <strong>Luftfugtighed (vægter 25 % af totalen):</strong><br>
                    Luftfugtigheden scorer højest, når luften hverken er for tør eller for fugtig. Ligger den uden for det behagelige område, falder scoren, fordi dårlig luft påvirker både komfort og koncentration.
                </li>
                <br>
                <li>
                    <strong>Lysstyrke (vægter 15 % af totalen):</strong><br>
                    Lysstyrken ligger bedst i et område, hvor man hverken skal anstrenge øjnene eller bliver blændet. For lidt eller for meget lys giver en lavere score, da det gør det sværere at holde fokus.
                </li>
            </ul>

            <br>

            <p>
                Alle fire scores bliver lagt sammen og giver én samlet <strong>Sundhedsscore</strong>.  
                Høje tal betyder gode forhold for læring og fokus, mens lave tal kan være et tegn på, at noget i rummet bør justeres - f.eks. åbne et vindue, dæmpe lyset eller tage en pause.
            </p>
        </div>
    </div>
    `,
    name: "DashboardPage",
    data() {
        return {
            healthyScoreCards: [
                { label: "Støjniveau", key: "latestNoise", field: "decibel", unit: "dB", colorClass: "noise-color", iconClass: "fa-solid fa-volume-high", healthyScore: "0-60" },
                { label: "Luftfugtighed", key: "latestHumidity", field: "humidityPercent", unit: "%", colorClass: "humidity-color", iconClass: "fa-solid fa-droplet", healthyScore: "40-60" },
                { label: "Temperatur", key: "latestTemperature", field: "celsius", unit: "°C", colorClass: "temperature-color", iconClass: "fa-solid fa-temperature-high", healthyScore: "20-22" },
                { label: "Lysstyrke", key: "latestLight", field: "lumen", unit: "lumen", colorClass: "light-color", iconClass: "fa-solid fa-lightbulb", healthyScore: "1000-5000" }
            ],

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
        //this.latestMeasurements.sort((a, b) => new Date(b.time) - new Date(a.time));

        // Opdater latestMeasurements med alle fire målinger på samme række
        this.mergeMeasurements();
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
        chartLightData() { return this.filteredLightsList.map(x => x.lumen); },
    },
}