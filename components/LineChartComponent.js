const LineChartComponent = {
    props: ["labels", "noise", "humidity", "temperature", "light"],
    template: /*html*/`
        <canvas ref="canvas"></canvas>
    `,
    data() {
        return {
            chart: null
        }
    },
    mounted() {

        const Utils = {
            CHART_COLORS: {
                noise: 'rgb(255, 99, 132)',
                humidity: 'rgb(255, 159, 64)',
                temperature: 'rgb(255, 205, 86)',
                light: 'rgb(75, 192, 192)',
            }
        };

        // ---- X-aksen: 24 timer ----
        const hours = Array.from({ length: 24 }, (_, i) => i + ":00");

        // ---- Test Data over 24 timer -----
        const noiseValues = Array.from({length:24}, (_,i) => i * 2);       // 0,2,4,...  
        const humidityValues = Array.from({length:24}, (_,i) => 50);       // konstant 50  
        const temperatureValues = Array.from({length:24}, (_,i) => 20+i);  // 20,21,...  
        const lightValues = Array.from({length:24}, (_,i) => 80-i);        // 80,79,...  

        const data = {
            labels: this.labels, // array med tidspunkter
            datasets: [
                {
                    label: 'Støjniveau',
                    data: this.noise,
                    borderColor: Utils.CHART_COLORS.noise,
                    backgroundColor: Utils.CHART_COLORS.noise,
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Luftfugtighed',
                    data: this.humidity,
                    borderColor: Utils.CHART_COLORS.humidity,
                    backgroundColor: Utils.CHART_COLORS.humidity,
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Temperatur',
                    data: this.temperature,
                    borderColor: Utils.CHART_COLORS.temperature,
                    backgroundColor: Utils.CHART_COLORS.temperature,
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Lysstyrke',
                    data: this.light,
                    borderColor: Utils.CHART_COLORS.light,
                    backgroundColor: Utils.CHART_COLORS.light,
                    fill: false,
                    tension: 0.4
                }
            ]
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',       // Labels over grafen
                        labels: {
                            boxWidth: 20,      // Kortere farvebokse
                            padding: 10
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return context.dataset.label + ': ' + context.raw;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            // Viser kun hvert andet tick
                            callback: function(value, index, ticks) {
                                // ticks er array med alle tick værdier
                                return value % 20 === 0 ? value : '';
                            }
                        },
                        suggestedMax: 100,
                        grid: {
                            color: 'rgba(0,0,0,0.025)', // meget lys grå
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Tid (timer)'
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.025)', // meget lys grå
                        }
                    }
                }
            }
        };

        const ctx = this.$refs.canvas.getContext('2d');
        this.chart = new Chart(ctx, config);
    },
};