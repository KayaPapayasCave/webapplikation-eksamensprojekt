const baseUriNoise = "https://localhost:7080/api/Noise"
const baseUriHumidity = "https://localhost:7080/api/Humidity"
const baseUriTemperature = "https://localhost:7080/api/Temperature"
const baseUriLight = "https://localhost:7080/api/Lights"

const routes = [
    { name: 'home', path: '/', component: HomePage },
    { name: 'other', path: '/', component: OtherPage },
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
