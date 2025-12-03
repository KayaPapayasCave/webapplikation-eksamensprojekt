const DonutChartComponent = {
    props: ["noise", "humidity", "temperature", "light"],
    template: /*html*/`
        <canvas ref="canvas"></canvas>
    `,
    data() {
        return {
            chart: null,
            actions: []
        }
    },
    mounted() {

        // ---- Utils ----
        const Utils = {
            CHART_COLORS: {
                red: 'rgb(255, 99, 132)',
                orange: 'rgb(255, 159, 64)',
                yellow: 'rgb(255, 205, 86)',
                green: 'rgb(75, 192, 192)',
            }
        };

        // ---- Data fra props ----
        const values = [
            this.noise,
            this.humidity,
            this.temperature,
            this.light
        ];

        // ---- Setup ----
        const DATA_COUNT = 4;
        //const NUMBER_CFG = { count: DATA_COUNT, min: 0, max: 100 };

        const data = {
            labels: ['Stø...', 'Luftf...', 'Te...', 'Ly...'],
            datasets: [
                {
                    // Sæt alle slices til lige store procenter
                    data: [25, 25, 25, 25],
                    backgroundColor: Object.values(Utils.CHART_COLORS),
                }
            ]
        };

        // ---- Config ----
        const config = {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: 
                    {
                        position: 'top' ,
                        labels: {
                            boxWidth: 20,  // <-- kortere farveboks (standard er 40)
                            padding: 10    // afstand mellem boksen og teksten
                        }
                    },
                    tooltip: {
                        callbacks: {
                            // Tooltip viser den faktiske værdi fra props
                            label: (context) => {
                                // Her kan du hente index
                                const i = context.dataIndex;
                                return [
                                    'Støjniveau: ' + this.noise,
                                    'Luftfugtighed: ' + this.humidity,
                                    'Temperatur: ' + this.temperature,
                                    'Lysstyrke: ' + this.light
                                ][i];
                            }
                        }
                    }
                }
            }
        };

        // ---- Create chart ----
        const ctx = this.$refs.canvas.getContext('2d');
        this.chart = new Chart(ctx, config);
    }
}