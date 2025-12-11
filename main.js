const baseUriNoise = "https://localhost:7080/api/NoiseDB"
const baseUriHumidity = "https://localhost:7080/api/HumidityDB"
const baseUriTemperature = "https://localhost:7080/api/TemperatureDB"
const baseUriLight = "https://localhost:7080/api/LightDB"
const apiUri = "https://localhost:7080/api/LightDB"

const routes = [
    { name: 'home', path: '/', component: HomePage },
    { name: 'measurement', path: '/', component: MeasurementPage },
]

// Make the router work:
const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(), // HASH IS ONLY FOR LOCAL USE !!!!! Otherwise use --> VueRouter.createWebHistory(),
    routes
});

const app = Vue.createApp({
    data() {
        return {
            currentYear: new Date().getFullYear()
        }
    },
    methods: {
        toggleResponsiveNav() {
            const x = document.getElementById("myTopnav");
            if (x.className === "topnav") {
                x.className += " responsive";
            } 
            else {
                x.className = "topnav";
            }
        }
    },
})

// Register components
// We don't have any componenet yet :-)

// Use router
app.use(router)

// Mount App
app.mount('#app')
