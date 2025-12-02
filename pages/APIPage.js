const APIPage = {
    template: /*html*/`
    <div class="default-page-setup">
        <div>
            <label>Vælg station: </label>
            <select v-model="selectedStationId">
                <option v-for="(name, id) in stations" :key="id" :value="id">
                    {{ name }} ({{ id }})
                </option>
            </select>
            <button @click="loadWeather">Hent vejr</button>
        </div>

        <div v-if="loading">Loading weather...</div>
        <div v-else-if="error">Error: {{ error }}</div>
        <div v-else>
            <p>
                Current temperature: <strong>{{ temperature }}°C</strong>
            </p>
            <p>
                Current humidity: <strong>{{ humidity }}%</strong>
            </p>
            <p>
                Station: <strong>{{ stationId }} {{ stationName }}</strong>
            </p>
            <p>
                Observed at: <strong>{{ observedTime }}</strong>
            </p>
        </div>
    </div>
    `,
    data() {
        return {
            temperature: null,
            humidity: null,
            stationId: null,
            stationName: null,
            observedTime: null,

            loading: true,
            error: null,

            stations: {
                "06041": "København / Amager",
                "06006": "Aalborg",
                "06120": "Odense",
                "06170": "Roskilde Lufthavn",
                "30414": "Roskilde dnk",
                "06020": "Aarhus"
            },

            selectedStationId: "06170",
        };
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
    }
}