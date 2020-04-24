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

      let watercolorLayer = Stamen_Watercolor();
      let labelsLayer = Stamen_TonerLabels();
      let heatmapLayer = this.initHeatmap();
      watercolorLayer.addTo(this.map);
      labelsLayer.addTo(this.map);
      heatmapLayer.addTo(this.map);

      this.geolocate();

      // listerners
      this.map.on("moveend", this.updateHeatmap);
      this.map.on("zoomend", this.updateHeatmap);
    },

    initHeatmap() {
      if (this.map != null && this.heatmap != null) {
        this.map.removeLayer(this.heatmap);
      }

      this.heatmap = L.heatLayer([], {});
      this.updateHeatmap();
      return this.heatmap;
    },

    updateHeatmap() {
      // generate new data and options
      let newData = this.getHeatmapData(this.map.getBounds());
      let newOptions = this.getHeatmapOptions(this.map.getZoom());

      this.heatmap.setLatLngs(newData);
      this.heatmap.setOptions(newOptions);
    },

    getHeatmapOptions(zoomLevel) {
      let radius = 38
      let blur = 30

      var options = {
        minOpacity: 0,
        maxZoom: 1,
        max: 1,
        radius : 15,
        blur: 30,
        // gradient: {
        //   0: "rgba(255,255,255,.3)",
        //   0.4: "rgba(200,255,200,.3)",
        //   0.8: "rgba(200,200,255,.3)",
        //   1: "rgba(0,0,200,.1)"
        // }
      };

      return options;
    },

    getHeatmapData(bounds) {
      let o = [bounds.getNorth(), bounds.getWest()];
      let f = [bounds.getSouth(), bounds.getEast()];

      let latDelta = f[0] - o[0]
      let lonDelta = f[1] - o[1]
      o[0] -= latDelta *.3;
      f[0] += latDelta *.3;

      o[1] -= lonDelta *.3;
      f[1] += lonDelta *.3;

      // config
      let fillrate = 100; // points maximun dimension (vertical or horizontal)
      let freq = 85;
      let scale = 1;

      let maxDelta = Math.max(f[0] - o[0], f[1] - o[1]) // get max dimension
      let coordStep = maxDelta / fillrate; // Coordinate step
      // generate Data
      let data = [];
      let currentCoord = [...o]

      while(currentCoord[0] > f[0]){

          // reset longitude
          currentCoord[1] = o[1]
          while(currentCoord[1] < f[1]){
            let noiseSample = 0
            noiseSample += 0.2 * noise.perlin2(currentCoord[0] * freq, currentCoord[1] * freq);
            noiseSample += 0.2 * noise.perlin2((currentCoord[0] + coordStep/2.) * freq, currentCoord[1] * freq);
            noiseSample += 0.2 * noise.perlin2((currentCoord[0] - coordStep/2.) * freq, currentCoord[1] * freq);
            noiseSample += 0.2 * noise.perlin2(currentCoord[0] * freq, (currentCoord[1] + coordStep/2.) * freq);
            noiseSample += 0.2 * noise.perlin2(currentCoord[0] * freq, (currentCoord[1] - coordStep/2.) * freq);

            // let singleSample = noise.perlin2(currentCoord[0] * freq, currentCoord[1] * freq);

            let intensity = Math.max(noiseSample, 0) * scale;
            let datapoint = [...currentCoord, intensity];
            data.push(datapoint);
            // Next longitude
            currentCoord[1] += coordStep;
          }
          // Next latitude
          currentCoord[0] -= coordStep;
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
