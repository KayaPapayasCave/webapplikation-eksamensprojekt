const APIPage = {
    template: /*html*/`
    <div>
        <div>
            <label>Vælg station:</label>
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
        this.loadWeather(); // <-- Loader vejr når komponent starter
    },
    methods: {
        async loadWeather() {
            this.loading = true;
            this.error = null;

            // Temperatur - Dynamisk URL afhængig af valgt station
            const tempUrl = "https://dmigw.govcloud.dk/v2/metObs/collections/observation/items?api-key=b3db5738-de35-4386-a5ad-7403d08e1a98&parameterId=temp_dry&stationId=" + this.selectedStationId;
            //const humUrl = "https://dmigw.govcloud.dk/v2/metObs/collections/observation/items?api-key=b3db5738-de35-4386-a5ad-7403d08e1a98&parameterId=rel_humidity&stationId=" + this.selectedStationId;


            try {
                //const [resTemp, resHumidity] = await Promise.all([fetch(tempUrl), fetch(humUrl)]);
                const resTemp = await fetch(tempUrl);

                if (!resTemp.ok /*|| !resHumidity.ok*/) {
                    throw new Error("Failed to fetch weather");
                }

                const jsonTemp = await resTemp.json();
                //const jsonHumidity = await resHumidity.json();

                const tempItem = jsonTemp.features?.[0]?.properties;
                //const humItem = jsonHumidity.features?.[0]?.properties;

                // Her tjekker vi først om der faktisk er data
                if (!tempItem /*|| !humItem*/) {
                    throw new Error("Ingen data tilgængelig for denne station");
                }

                // Sæt værdier, hvis data findes
                this.temperature = tempItem.value;
                //this.humidity = humItem.value;
                this.stationId = tempItem.stationId;
                this.stationName = this.stations[this.stationId] ?? "Ukendt station";
                this.observedTime = tempItem.observed;  // vi bruger tidspunktet fra temperatur
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