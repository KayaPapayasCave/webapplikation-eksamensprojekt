const HomePage = {
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

            <h3>Data for rumtemperatur:</h3>

            <div v-if="errorHumidities" style="color: red">Error: {{errorHumidities}}</div>
            <div v-if="statuscodeHumidities" style="color: green">Statuscode: {{statuscodeHumidities}}</div>

            <ul v-if="humiditiesList.length">
                <li v-for="humidity in humiditiesList" :key="humidity.id">
                    Indhentet Humidity [Id: {{humidity.id}}], 
                    [Decibel: {{humidity.decibel}}], 
                    [Dato: {{ new Date(humidity.time).toLocaleDateString() }}], 
                    [Tidspunkt: {{ new Date(humidity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}]
                </li>
            </ul>

            <br>
            <br>

            <h3>Data for lysstyrke:</h3>
            <p>Kommer snart :-)</p>

            <br>
            <br>

            <h3>Data for luftfugtighed:</h3>
            <p>Kommer snart :-)</p>

            <br>
            <br>

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
        await this.getAllNoises();
        await this.getAllHumidities();
        await this.getAllTemperatures();
        await this.getAllLights();
    },
    methods: {
        async getAllNoises() {
            this.error = null;

            await axios.get(baseUriNoise)
            .then(response => {
                this.noisesList = response.data;
                this.statuscode = response.status;
            })
            .catch(error => {
                this.noisesList = [];
                this.error = error.message;
            })  
        },
        async getAllHumidities() {
            this.error = null;

            await axios.get(baseUriHumidity)
            .then(response => {
                this.humiditiesList = response.data;
                this.statuscode = response.status;
            })
            .catch(error => {
                this.humiditiesList = [];
                this.error = error.message;
            })  
        },
        async getAllTemperatures() {
            this.error = null;

            await axios.get(baseUriTemperature)
            .then(response => {
                this.temperaturesList = response.data;
                this.statuscode = response.status;
            })
            .catch(error => {
                this.temperaturesList = [];
                this.error = error.message;
            })  
        },
        async getAllLights() {
            this.error = null;

            await axios.get(baseUriLight)
            .then(response => {
                this.lightsList = response.data;
                this.statuscode = response.status;
            })
            .catch(error => {
                this.lightsList = [];
                this.error = error.message;
            })  
        }
    }
}