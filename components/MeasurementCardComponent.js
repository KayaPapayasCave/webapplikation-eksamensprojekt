const MeasurementCardComponent = {
    props: ['label', 'value', 'unit'],
    template: /*html*/`
        <div class="card">
            <p class="label">{{ label }}</p>
            <p class="value" v-if="value !== null && value !== undefined">
                {{ value }} {{ unit }}
            </p>
            <p class="sub">Gennemsnit</p>
        </div>
    `,
    data() {
        return {

        }
    },
    methods: {

    }
}