const MeasurementCardComponent = {
    props: ["label", "value", "unit", "colorClass"],
    template: /*html*/`
        <div class="card" :class="colorClass">
            <p class="label">{{ label }}</p>
            <p class="value" v-if="value !== null && value !== undefined">
                {{ value }} {{ unit }}
            </p>
            <p class="sub">Seneste måling</p>
        </div>
    `,
    data() {
        return {

        }
    },
    methods: {

    }
}