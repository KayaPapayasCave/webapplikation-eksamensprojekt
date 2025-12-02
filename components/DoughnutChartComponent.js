const DoughnutChartComponent = {
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
            elementId: "doughnutChart_" + Math.random().toString(36).substr(2, 9),
            chart: null
        }
    },
    mounted() {
        this.initChart();
    },
    computed: {
        hasData() {
            return (
                this.labels.length > 0 &&
                (this.noise.length > 0 ||
                 this.humidity.length > 0 ||
                 this.temperature.length > 0 ||
                 this.light.length > 0)
            );
        },
        totalValues() {
            // Vi summerer alle værdier for at få én værdi per kategori
            return [
                this.sumArray(this.noise),
                this.sumArray(this.humidity),
                this.sumArray(this.temperature),
                this.sumArray(this.light)
            ];
        }
    },
    watch: {
        noise: "updateChart",
        humidity: "updateChart",
        temperature: "updateChart",
        light: "updateChart",
        hasData(newVal) {
            // Hvis data bliver tilgængelig, init chart
            if (newVal) this.initChart();
            // Hvis data fjernes, destroy chart
            else if (this.chart) {
                this.chart.destroy();
                this.chart = null;
            }
        }
    },
    methods: {
        sumArray(arr) {
            return arr.reduce((acc, val) => acc + val, 0);
        },
        initChart() {
            // Vent til DOM er opdateret
            this.$nextTick(() => {
                const ctx = document.getElementById(this.elementId);
                if (!ctx) return;

                if (this.chart) this.chart.destroy();

                this.chart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Støj', 'Luftfugtighed', 'Temperatur', 'Lysstyrke'],
                        datasets: [{
                            data: this.totalValues,
                            backgroundColor: ['#000', '#555', '#aaa', '#ddd'],
                            borderColor: '#fff',
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    color: '#444',
                                    font: { size: 13 },
                                    usePointStyle: true,
                                    pointStyle: 'circle'
                                }
                            }
                        }
                    }
                });
            });
        },
        updateChart() {
            this.$nextTick(() => {
                if (!this.hasData) return;
                if (!this.chart) {
                    this.initChart();
                    return;
                }

                this.chart.data.datasets[0].data = this.totalValues;
                this.chart.update();
            });
        },
        mounted() {
            if (this.hasData) this.initChart();
        }
    }
}