<style scoped>
#heatmap {
  height: Calc(100vh - 48px - 36px);
  margin-top: -80px;
  /* width: 100%;
  position: absolute;
  top: 0px; */
}

.v-toolbar {
  z-index: 999;
}

.v-text-field{
  padding-top: 0px;
}
</style>

<template>
  <v-card class="pt-3" flat>
    <!-- Searchbar -->
        <v-toolbar floating dense>
          <v-form @submit.prevent="search">
            <v-text-field v-model="searchTerm" hide-details prepend-icon="search" single-line />
          </v-form>

          <v-btn :disabled="!canGeolocate" icon @click="geolocate">
            <v-icon>my_location</v-icon>
          </v-btn>
        </v-toolbar>

    <!-- Map -->
    <div id="heatmap">
      Your browser does not support Javascript Maps.
    </div>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      map: null,
      searchTerm: ""
    };
  },

  computed: {
    canGeolocate(){
      return window.navigator.geolocation != null
    }
  },

  async mounted() {
    this.initMap();
  },

  methods: {
    initMap() {
      let mapUrlWatercolor =
        "https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg";
      this.map = L.map("heatmap", {
        maxBounds: [
          [80, -180],
          [-70, 180]
        ],
        zoomControl: false,
        zoom: 13,
        minZoom: 2,
        maxZoom: 15,
        center: { lat: 41.3805702, lon: 2.1537778 } // Barcelona
      });
      L.tileLayer(mapUrlWatercolor, {
        attribution: `
            <small>&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>
            | &copy; <a href="http://maps.stamen.com">Stamen Design</a></small>`
      }).addTo(this.map);
      this.map.locate({setView: true});
    },

    search(event) {
      console.log(event);
    },

    geolocate(){
      if (window.navigator){
        window.navigator.geolocation.getCurrentPosition(location =>{
          let lat = location.coords.latitude
          let lon = location.coords.longitude
          this.map.flyTo([lat, lon], 13)
        }, error => {
          console.error("Could not geolocate user");
          this.$store.dispatch('toast/error',{message:"Could not get your position. Does your device have a GPS device?"})
        })
      }
    }
  }
};
</script>
