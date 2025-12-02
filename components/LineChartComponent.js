const LineChartComponent = {
    props: ["labels", "noise", "humidity", "temperature", "light"],
    template: /*html*/`
        <div style="height:300px;" v-if="hasData">
            <canvas :id="elementId"></canvas>
        </div>
        <div v-else>
            <p>Indlæser data...</p>
        </div>
    `,
    data() {
        return {
            elementId: "lineChart_" + Math.random().toString(36).substr(2, 9),
            chart: null
        }
    },
    mounted() {
        this.initChart();
    },
    computed: {
        hasData() {
            // Tjekker om mindst én af datasættene har data
            return (
                this.labels.length > 0 &&
                (this.noise.length > 0 ||
                 this.humidity.length > 0 ||
                 this.temperature.length > 0 ||
                 this.light.length > 0)
            );
        }
    },
    // Watch listens for changes in props and updates the chart accordingly.
    watch: {
        labels: "updateChart",
        noise: "updateChart",
        humidity: "updateChart",
        temperature: "updateChart",
        light: "updateChart"
    },
    methods: {
        initChart() {
            const ctx = document.getElementById(this.elementId);
            if (!ctx) {
                console.error("Canvas not found:", this.elementId);
                return;
            }

            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: this.labels,
                    datasets: [
                        {
                            label: 'Støjniveau',
                            data: this.noise,
                            borderColor: '#000',         // sort
                            backgroundColor: 'transparent',
                            borderWidth: 2,
                            tension: 0.5,
                            pointRadius: 4,
                            pointBackgroundColor: '#000'
                        },
                        {
                            label: 'Luftfugtighed',
                            data: this.humidity,
                            borderColor: '#555',         // mørk grå
                            backgroundColor: 'transparent',
                            borderWidth: 2,
                            tension: 0.5,
                            pointRadius: 4,
                            pointBackgroundColor: '#555'
                        },
                        {
                            label: 'Temperatur',
                            data: this.temperature,
                            borderColor: '#aaa',         // mellem grå
                            backgroundColor: 'transparent',
                            borderWidth: 2,
                            tension: 0.5,
                            pointRadius: 4,
                            pointBackgroundColor: '#aaa'
                        },
                        {
                            label: 'Lysstyrke',
                            data: this.light,
                            borderColor: '#ddd',         // lys grå
                            backgroundColor: 'transparent',
                            borderWidth: 2,
                            tension: 0.5,
                            pointRadius: 4,
                            pointBackgroundColor: '#ddd'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,

                    plugins: {
                        legend: {
                            labels: {
                                color: '#444',
                                font: { size: 13 },
                                usePointStyle: true,      // prik i stedet for firkant
                                pointStyle: 'circle'
                            }
                        }
                    },

                    scales: {
                        x: {
                            grid: {
                                display: false           // ingen grid på x-aksen
                            },
                            ticks: {
                                color: '#666',
                                font: { size: 12 }
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(0,0,0,0.025)' // meget svage linjer
                            },
                            ticks: {
                                color: '#666',
                                font: { size: 12 }
                            }
                        }
                    }
                }
            });
        },
        updateChart() {
            if (!this.chart && this.hasData) {
                // Hvis chart ikke eksisterer endnu, opret den
                this.initChart();
                return;
            }

            if (!this.chart) return;

            this.chart.data.labels = this.labels;
            this.chart.data.datasets[0].data = this.noise;
            this.chart.data.datasets[1].data = this.humidity;
            this.chart.data.datasets[2].data = this.temperature;
            this.chart.data.datasets[3].data = this.light;

            this.chart.update();
        }
    }
}