const HomePage = {
    template: /*html*/`
        <div class="default-page-setup">
            <h1 class="site-title">Stress- og Fokusmonitor for studerende</h1>

            <br>
            <hr>
            <br>

            <h3>Data for støjniveau:</h3>

            <div v-if="error" style="color: red">Error: {{error}}</div>
            <div v-if="statuscode" style="color: green">Statuscode: {{statuscode}}</div>

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
            <p>Kommer snart :-)</p>

            <br>
            <br>

            <h3>Data for lysstyrke:</h3>
            <p>Kommer snart :-)</p>

            <br>
            <br>

            <h3>Data for luftfugtighed:</h3>
            <p>Kommer snart :-)</p>
        </div>
    `,
    data() {
        return {
            noisesList: [],
            error: null, 
            statuscode: null,
        }
    },
    // created() is called automatically when the page is loaded.
    async created() {
        console.log("created method called");
        await this.getAllNoises();
    },
    methods: {
        async getAllNoises() {
            this.error = null;

            await axios.get(baseUri)
            .then(response => {
                this.noisesList = response.data;
                this.statuscode = response.status;
            })
            .catch(error => {
                this.noisesList = [];
                this.error = error.message;
            })  
        }
    }
}