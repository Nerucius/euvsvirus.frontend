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

      <v-btn :disabled="!canGeolocate" icon @click="geolocate(true)">
        <v-icon>my_location</v-icon>
      </v-btn>
    </v-toolbar>

    <!-- Favicon buttons -->

    <v-speed-dial
      v-model="speeddial"
      absolute
      style="bottom:140px;right:30px; z-index:999"
      direction="top"
      transition="slide-y-reverse-transition"
    >
      <template v-slot:activator>
        <v-btn v-model="speeddial" color="white" fab>
          <v-icon>layers</v-icon>
          <v-icon>close</v-icon>
        </v-btn>
      </template>

      <v-btn fab dark small color="white">
        <v-icon>mdi-map-legend</v-icon>
      </v-btn>
    </v-speed-dial>

    <v-btn
      v-if="isLoggedIn"
      :to="{name:'workout-create'}"
      color="white"
      absolute
      style="bottom:60px;right:30px; z-index:999"
      fab
      class="elevation-2 success--text"
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
noise.seed(Math.random());

export default {
  data() {
    return {
      speeddial: false,
      map: null,
      heatmap: null,
      positionMarker: null,
      searchMarker: null,
      searchTerm: ""
    };
  },

  computed: {
    canGeolocate() {
      return window.navigator.geolocation != null;
    },
    isLoggedIn() {
      return true;
    }
  },

  mounted() {
    this.initMap();
    this.initHeatmap();
  },

  methods: {
    initMap() {
      let hmDiv = document.getElementById("heatmap");
      let vContainer = document.getElementById("v-container");
      hmDiv.style.height = vContainer.clientHeight + "px";

      this.map = L.map("heatmap", {
        maxBounds: [
          [80, -180],
          [-70, 180]
        ],
        zoomControl: false,
        zoom: 15,
        minZoom: 2,
        maxZoom: 15,
        center: { lat: 41.37, lon: 2.187 } // Barcelona
      });

      Stamen_Watercolor().addTo(this.map);
      Stamen_TonerLabels().addTo(this.map);

      this.geolocate();

      // listerners
      this.map.on('moveend', this.initHeatmap)
      this.map.on('zoomend', this.initHeatmap)
    },

    initHeatmap() {
      if (this.map == null) return;
      if (this.heatmap != null) {
        this.map.removeLayer(this.heatmap);
      }

      var heatData = this.getHeatmapData();

      var options = {
        minOpacity: 0,
        maxZoom: 15,
        max: 1,
        radius: 38,
        blur: 30,
        gradient: { 0.65: "rgba(255,255,255,.3)", 0.85: "lime", 1: "rgba(0,0,200,.1)" }
      };

      this.heatmap = L.heatLayer(heatData, options);
      // this.heatmap.setOpacity(.5);
      this.heatmap.addTo(this.map);
    },

    getHeatmapData(){


      let bounds = this.map.getBounds();
      let o = [bounds.getNorth(), bounds.getWest()];
      let f = [bounds.getSouth(), bounds.getEast()];
      let fillrate = 15

      let stepLat = (f[0] - o[0]) / fillrate
      let stepLon = (f[1] - o[1]) / fillrate

      let data = []

      // generate Data
      let freq = 100
      let scale = 2

      for(let lat of Array(fillrate).keys()){
        lat = Number(lat)
        for (let lon of Array(fillrate).keys()){
          lon = Number(lon)
          // let intensity = 0.25 + (Math.random() * .9)
          let finalLat = o[0] + (lat * stepLat)
          let finalLon = o[1] + (lon * stepLon)
          let intensity = noise.perlin2(finalLat * freq, finalLon * freq);
          intensity = Math.abs(intensity) * scale
          let datapoint = [finalLat, finalLon, intensity]
          data.push(datapoint);
        }
      }


      return data;

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

    geolocate(flyTo) {
      if (window.navigator) {
        window.navigator.geolocation.getCurrentPosition(
          location => {
            let lat = location.coords.latitude;
            let lon = location.coords.longitude;
            if (flyTo) {
              this.map.flyTo([lat, lon], 13);
            }

            if (this.positionMarker != null) {
              L.removeLayer(this.positionMarker);
            }

            this.positionMarker = L.marker([lat, lon]).bindPopup(
              "Your location"
            );
            this.map.addLayer(this.positionMarker);
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
