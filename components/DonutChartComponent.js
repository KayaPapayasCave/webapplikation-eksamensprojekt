const DonutChartComponent = {
    props: ["noise", "humidity", "temperature", "light", "totalScore"],
    template: /*html*/`
        <div>
            <canvas ref="canvas"></canvas>
            <span style="display:none">{{ noise?.decibel ?? '' }}{{ humidity?.humidityPercent ?? '' }}{{ temperature?.celsius ?? '' }}{{ light?.lux ?? '' }}</span>
        </div>
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
                red: '#F8E080' /*'rgb(255, 99, 132)'*/,
                orange: '#52B1D2'/*'rgb(255, 159, 64)'*/,
                yellow: '#FFB46B' /*'rgb(255, 205, 86)'*/,
                green: '#BBEEDD' /*'rgb(75, 192, 192)'*/,
            }
        };

        // ---- Text in center ----
        const centerTextPlugin = {
            id: 'centerText',
            afterDraw: (chart) => {
                // Stop hvis det ikke er en doughnut chart
                if (chart.config.type !== 'doughnut') return;

                const { ctx, chartArea: { width, height } } = chart;

                ctx.save();
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                // Lav tekst som array af linjer
                const lines = [
                    { text: `${Number(this.totalScore).toFixed(1) ?? "?"} / 100`, color: "#333", font: "bold 28px Arial" },
                    { text: "Samlet Score", color: "#888", font: "18px Arial" }
                ];

                const lineHeight = 30; // afstand mellem linjer

                // Start højere oppe så det hele centreres
                let y = height / 2 + (lines.length - 1) * lineHeight / 2;

                // Tegn hver linje
                for (const line of lines) {
                    ctx.font = line.font;
                    ctx.fillStyle = line.color;
                    ctx.fillText(line.text, width / 2, y);
                    y += lineHeight;
                }

                ctx.restore();
            }
        };
        Chart.register(centerTextPlugin);

        // ---- Data ----
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
                                    'Støjniveau: ' + Number(this.noise).toFixed(1),
                                    'Luftfugtighed: ' + Number(this.humidity).toFixed(1),
                                    'Temperatur: ' + Number(this.temperature).toFixed(1),
                                    'Lysstyrke: ' + Number(this.light).toFixed(1)
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
    },
}