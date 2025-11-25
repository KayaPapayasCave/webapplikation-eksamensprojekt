const OtherPage = {
    template: /*html*/`
        <div class="default-page-setup">
            <p>Vi er på other page</p>

            <br>

            <div class="image-container">
                <img v-bind:src="image" class="image">
            </div>
        </div>
    `,
    data() {
        return {
            image: './assets/images/stress- og fokusmonitor for studerende.png',
        }
    },
    methods: {

    }
}