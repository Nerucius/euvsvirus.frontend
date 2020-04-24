<style scoped>
.heatmap {
  margin-top: -80px;
  /* height: Calc(100vh - 48px - 36px); */
}

.v-toolbar {
  z-index: 999;
}

.v-text-field {
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

    <!-- Favicon buttons -->
    <v-btn
      v-if="isLoggedIn"
      :to="{name:'workout-create'}"
      color="success"
      absolute
      style="bottom:60px;right:40px; z-index:999"
      dark
      fab
      class="elevation-2"
    >
      <v-icon>add</v-icon>
    </v-btn>

    <!-- Map -->
    <div id="heatmap" class="heatmap" />
  </v-card>
</template>

<script>
import { OpenStreetMapProvider } from "leaflet-geosearch";
import { Stamen_Watercolor, Stamen_TonerLabels } from "@/plugins/maplayers.js";

const provider = new OpenStreetMapProvider();

export default {
  data() {
    return {
      map: null,
      searchMarker: null,
      searchTerm: "",
    };
  },

  computed: {
    canGeolocate() {
      return window.navigator.geolocation != null;
    },
    isLoggedIn(){
      return true;
    },

  },

  mounted() {
    this.initMap()
  },

  methods: {

    initMap() {
      let hmDiv = document.getElementById('heatmap');
      let vContainer = document.getElementById('v-container');
      hmDiv.style.height = vContainer.clientHeight+"px";

      this.map = L.map('heatmap', {
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

      Stamen_Watercolor().addTo(this.map);
      Stamen_TonerLabels().addTo(this.map);

      this.map.locate({
          setView: true,
          maxZoom: 13,
          watch: true
        })
        .on("locationfound", location => {
          var marker = L.marker([location.latitude, location.longitude]).bindPopup(
            "Your are here :)"
          );
          var circle = L.circle([location.latitude, location.longitude], location.accuracy / 2, {
            weight: 1,
            color: "blue",
            fillColor: "#cacaca",
            fillOpacity: 0.2
          });
          this.map.addLayer(marker);
          this.map.addLayer(circle);
        })
        .on("locationerror", error => {
          console.error("location denied");
        });
    },

    async search(event) {
      if (!this.searchTerm) return;

      // Call search api
      let results = await provider.search({ query: this.searchTerm });
      if (results.length == 0) {
        this.$store.dispatch("toast/error", {
          message: "No address or city found."
        });
      }
      let target = results[0];

      // Clear previous Marker
      if (this.searchMarker) {
        this.map.removeLayer(this.searchMarker);
      }
      // Create marker at lat lon and center map
      this.searchMarker = L.marker([target.y, target.x])
        .addTo(this.map)
        .bindPopup(target.label)
        .openPopup();
      this.map.flyTo([target.y, target.x], 13);
    },

    geolocate() {
      if (window.navigator) {
        window.navigator.geolocation.getCurrentPosition(
          location => {
            let lat = location.coords.latitude;
            let lon = location.coords.longitude;
            this.map.flyTo([lat, lon], 13);
          },
          error => {
            console.error("Could not geolocate user");
            this.$store.dispatch("toast/error", {
              message:
                "Could not get your position. Does your device have a GPS device?"
            });
          }
        );
      }
    }
  }
};
</script>
