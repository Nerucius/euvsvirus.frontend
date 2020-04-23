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
    <div id="heatmap" />
  </v-card>
</template>

<script>
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import {Stamen_Watercolor, Stamen_TonerLabels} from '@/plugins/maplayers.js'

const provider = new OpenStreetMapProvider();

export default {
  data() {
    return {
      map: null,
      searchMarker: null,
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
      // let mapUrlWatercolor =
      //   "https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg";
      // let mapUrlTerrain =
      //   "http://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.jpg";

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

      Stamen_Watercolor.addTo(this.map);
      Stamen_TonerLabels.addTo(this.map);

      // TODO: test this
      this.map.locate({setView: true});
    },

    async search(event) {
      if(!this.searchTerm){ return }

      // Call search api
      let results = await provider.search({ query: this.searchTerm });
      if(results.length == 0){
        this.$store.dispatch('toast/error', {message: "No address or city found."})
      }
      let target = results[0]

      // Clear previous Marker
      if(this.searchMarker){ this.map.removeLayer(this.searchMarker) }
      // Create marker at lat lon and center map
      this.searchMarker = L.marker([target.y, target.x])
        .addTo(this.map)
        .bindPopup(target.label)
        .openPopup()
      this.map.flyTo([target.y, target.x], 13)
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
