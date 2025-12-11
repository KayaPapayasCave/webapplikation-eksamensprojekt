const MeasurementPage = {
    components: {

        'measurements-table': MeasurementsTableComponent
    },
    template: /*html*/`
    <div class="default-page-setup">
        <measurements-table :rows="latestMeasurements"></measurements-table>
    </div>
    `,
    name: "DashboardPage",
    data() {
        return {
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
    }
}