const TestPage = {
    template: /*html*/`
        <div class="default-page-setup">
            <h1 class="site-title">Stress- og Fokusmonitor for studerende</h1>

            <br>
            <hr>
            <br>

            <h3>Data for støjniveau:</h3>
            <div v-if="errorNoise" style="color: red">Error: {{errorNoise}}</div>
            <div v-if="statuscodeNoise" style="color: green">Statuscode: {{statuscodeNoise}}</div>

            <ul v-if="noisesList.length">
                <li v-for="noise in noisesList" :key="noise.id">
                    Indhentet Noise [Id: {{noise.id}}], 
                    [Decibel: {{noise.decibel}}], 
                    [Dato: {{ new Date(noise.time).toLocaleDateString() }}], 
                    [Tidspunkt: {{ new Date(noise.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}]
                </li>
            </ul>

            <br>
            <br>

            <h3>Data for luftfugtighed:</h3>
            <div v-if="errorHumidities" style="color: red">Error: {{errorHumidities}}</div>
            <div v-if="statuscodeHumidities" style="color: green">Statuscode: {{statuscodeHumidities}}</div>

            <ul v-if="humiditiesList.length">
                <li v-for="humidity in humiditiesList" :key="humidity.id">
                    Indhentet Humidity [Id: {{humidity.id}}], 
                    [Humidity Percent: {{humidity.humidityPercent}}], 
                    [Dato: {{ new Date(humidity.time).toLocaleDateString() }}], 
                    [Tidspunkt: {{ new Date(humidity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}]
                </li>
            </ul>

            <br>
            <br>

            <h3>Data for rumtemperatur:</h3>
            <div v-if="errorTemperature" style="color: red">Error: {{errorTemperature}}</div>
            <div v-if="statuscodeTemperature" style="color: green">Statuscode: {{statuscodeTemperature}}</div>

            <ul v-if="temperaturesList.length">
                <li v-for="temperature in temperaturesList" :key="temperature.id">
                    Indhentet Temperature [Id: {{temperature.id}}], 
                    [Celsius: {{temperature.celsius}}], 
                    [Dato: {{ new Date(temperature.time).toLocaleDateString() }}], 
                    [Tidspunkt: {{ new Date(temperature.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}]
                </li>
            </ul>

            <br>
            <br>

            <h3>Data for lysstyrke:</h3>
            <div v-if="errorLight" style="color: red">Error: {{errorLight}}</div>
            <div v-if="statuscodeLight" style="color: green">Statuscode: {{statuscodeLight}}</div>

            <ul v-if="lightsList.length">
                <li v-for="light in lightsList" :key="light.id">
                    Indhentet Light [Id: {{light.id}}], 
                    [Lumen: {{light.lumen}}], 
                    [Dato: {{ new Date(light.time).toLocaleDateString() }}], 
                    [Tidspunkt: {{ new Date(light.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}]
                </li>
            </ul>

            <br>
            <br>

            <h3 v-if="latestNoise">Latest noise: {{latestNoise.decibel}} dB</h3>
            <h3 v-if="latestHumidity">Latest humidity: {{latestHumidity.humidityPercent}} %</h3>
            <h3 v-if="latestTemperature">Latest temperature: {{latestTemperature.celsius}} °C</h3>
            <h3 v-if="latestLight">Latest light: {{latestLight.lumen}} lux</h3>

            <div class="image-container">
                <img v-bind:src="image" class="image">
            </div>
        </div>
    `,
    data() {
        return {
            image: './assets/images/stress- og fokusmonitor for studerende.png',

            noisesList: [],
            humiditiesList: [],
            temperaturesList: [],
            lightsList: [],

            latestNoise: null,
            latestHumidity: null,
            latestTemperature: null,
            latestLight: null,

            errorNoise: null, 
            statuscodeNoise: null,

            errorHumidities: null, 
            statuscodeHumidities: null,

            errorTemperature: null, 
            statuscodeTemperature: null,

            errorLight: null, 
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
    },
    methods: {
        async getAllNoises() {
            this.errorNoise = null;

            await axios.get(baseUriNoise)
            .then(response => {
                this.noisesList = response.data;
                this.statuscodeNoise = response.status;
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


