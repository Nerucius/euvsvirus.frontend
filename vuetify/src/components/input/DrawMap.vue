<style scoped>
.map {
  margin-top: -80px;
  height: Calc(var(--vh, 1vh) * 100 - 48px);
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
        <v-text-field
          :disabled="drawMode"
          v-model="searchTerm"
          hide-details
          prepend-icon="search"
          single-line
        />
      </v-form>
      <v-btn :disabled="drawMode || !canGeolocate" icon @click="geolocate(true)">
        <v-icon>my_location</v-icon>
      </v-btn>
    </v-toolbar>

    <v-btn
      v-if="!drawMode"
      key="upload"
      color="success"
      absolute
      style="bottom:150px;right:30px; z-index:999"
      fab
      class="elevation-2"
      @click="save"
    >
      <v-icon>mdi-cloud-upload</v-icon>
    </v-btn>

    <v-btn
      :color="drawMode ? 'warning' : 'warning'"
      key="toggle-draw"
      absolute
      style="bottom:60px;right:30px; z-index:999"
      fab
      class="elevation-2"
      @click="toggleDrawMode"
    >
      <v-icon v-if="drawMode">close</v-icon>
      <v-icon v-else>edit</v-icon>
    </v-btn>

    <v-btn
      v-if="!drawMode"
      color="white"
      absolute
      style="bottom:60px;left:30px; z-index:999"
      fab
      class="elevation-2 error--text"
      @click="$emit('back')"
    >
      <v-icon>backspace</v-icon>
    </v-btn>

    <div id="map" class="map" />
  </v-card>
</template>

<script>
import { OpenStreetMapProvider } from "leaflet-geosearch";
import { Stamen_Watercolor, Stamen_TonerLabels } from "@/plugins/maplayers.js";

let pow2 = x => Math.pow(x, 2);

let distance = function(p1, p2) {
  return Math.sqrt(pow2(p1.lat - p2.lat) + pow2(p1.lng - p2.lng));
};

const provider = new OpenStreetMapProvider();

export default {
  props: ["value"],

  data() {
    return {
      map: null,
      mouseDown: false,
      drawMode: false,
      lastDrawPoint: null,
      searchTerm: "",

      // Drawing
      heatmap: null,
      raster: []
    };
  },

  computed: {
    canGeolocate() {
      return window.navigator.geolocation != null;
    }
  },

  mounted() {
    this.initMap();
    this.raster = this.value || []
  },

  methods: {
    initMap() {
      this.map = L.map("map", {
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

      // Init layers
      let watercolorLayer = Stamen_Watercolor();
      let labelsLayer = Stamen_TonerLabels();
      let heatmapLayer = this.initHeatmap();

      watercolorLayer.addTo(this.map);
      labelsLayer.addTo(this.map);
      heatmapLayer.addTo(this.map);

      this.map.locate({ setView: true, maxZoom: 14 });
      this.map.on("locationfound", e => {
        var radius = Math.min(e.accuracy, 1000);
        L.marker(e.latlng)
          .addTo(this.map)
          .bindPopup(
            "You are within " + e.accuracy + " meters from this point"
          );
        L.circle(e.latlng, { radius }).addTo(this.map);
      });

      // this.map.on("mousedown", () => (this.mouseDown = true));
      // this.map.on("mouseup", () => (this.mouseDown = false));
      this.map.on("click", this.addCoord);
    },

    initHeatmap() {
      if (this.map != null && this.heatmap != null) {
        this.map.removeLayer(this.heatmap);
      }

      this.heatmap = L.heatLayer([], {});
      return this.heatmap;
    },

    addCoord({ latlng }) {
      if(!this.drawMode) return;

      this.raster.push([latlng.lat, latlng.lng, 1]);
      this.updateHeatmap();
    },

    updateHeatmap() {
      // generate new data and options
      let newData = this.raster;
      let newOptions = {
        minOpacity: 0,
        maxZoom: 1,
        max: 1,
        radius: 15,
        blur: 30
      };

      this.heatmap.setLatLngs(newData);
      this.heatmap.setOptions(newOptions);
    },

    handleDraw(e) {
      if (!this.drawMode || !this.mouseDown) return;
      let { lat, lng } = e.latlng;

      if (
        !this.lastDrawPoint ||
        distance(this.lastDrawPoint, e.latlng) > 0.0025
      ) {
        // L.marker([lat, lng]).addTo(this.map);
        L.circle([lat, lng], {
          radius: 250,
          stroke: false,
          color: "rgba(0,128,255,.5)",
          fillOpacity: 1
        }).addTo(this.map);
        this.lastDrawPoint = e.latlng;
      }
    },

    toggleDrawMode() {
      this.drawMode = !this.drawMode;
      if (this.drawMode) {
        this.map.dragging.disable();
        let currentZoom = this.map.getZoom();
        // this.map.setOptions({
        //   minZoom: currentZoom,
        //   maxZoom: currentZoom,
        // })
      } else {
        this.map.dragging.enable();
        // this.map.setOptions({
        //   minZoom: 2,
        //   maxZoom: 15,
        // })
      }
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
    },

    save() {
      this.$emit("input", this.raster);
      this.$emit("change", this.raster);
    }
  }
};
</script>
