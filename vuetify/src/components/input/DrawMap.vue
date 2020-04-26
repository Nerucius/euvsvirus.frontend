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
      <v-btn
        :disabled="drawMode || !canGeolocate"
        icon
        @click="map.locate({setView:true, maxZoom:14})"
      >
        <v-icon>my_location</v-icon>
      </v-btn>
    </v-toolbar>

    <v-btn
      v-if="!drawMode"
      key="upload"
      absolute
      style="bottom:150px;right:30px; z-index:999"
      fab
      class="elevation-2 green--text"
      @click="confirmSave"
    >
      <v-icon>mdi-cloud-upload</v-icon>
    </v-btn>

    <!-- Draw interface -->

    <v-btn
      :color="drawMode ? 'error' : 'success'"
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

    <template v-if="drawMode">
      <v-btn
        fab
        absolute
        color="white"
        style="bottom:60px;right:100px; z-index:999"
        class="elevation-2 text--red"
        @click="clearAll"
      >
        <v-icon>mdi-eraser</v-icon>
      </v-btn>

      <v-btn
        fab
        absolute
        style="bottom:60px;right:170px; z-index:999"
        class="elevation-2"
        @click="()=>{}"
      >
        <v-icon>mdi-pentagon</v-icon>
      </v-btn>
    </template>

    <v-btn
      v-if="!drawMode"
      color="white"
      absolute
      style="bottom:60px;left:30px; z-index:999"
      fab
      class="elevation-2 error--text"
      @click="confirmBack"
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
let distance2 = function(p1, p2) {
  return pow2(p1.lat - p2.lat) + pow2(p1.lng - p2.lng);
};

const provider = new OpenStreetMapProvider();

export default {
  props: ["value"],

  data() {
    return {
      map: null,
      heatmap: null,
      drawGroup: null,
      mouseDown: false,
      drawMode: false,
      searchTerm: "",

      // Drawing
      positionMarker: null,
      lastDrawCoords: null,
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
    this.raster = this.value || [];
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

      this.drawGroup = new L.FeatureGroup().addTo(this.map);
      // this.drawGroup.setOpacity(.5)

      // Init layers
      let watercolorLayer = Stamen_Watercolor();
      let labelsLayer = Stamen_TonerLabels();
      let heatmapLayer = this.initHeatmap();

      watercolorLayer.addTo(this.map);
      labelsLayer.addTo(this.map);

      // Heatmap setup
      heatmapLayer.addTo(this.map);
      this.heatmap = heatmapLayer;
      // Hide heatmap on zoom
      this.map.on("moveend", this.updateHeatmap);
      this.map.on("zoomstart", () => this.heatmap.setLatLngs([]));
      this.map.on("zoomend", this.updateHeatmap);

      // Trigger locate and add marker
      this.map.locate({ setView: true, maxZoom: 13 });
      this.map.on("locationfound", e => {
        if (this.positionMarker != null) {
          this.map.removeLayer(this.positionMarker);
        }
        this.positionMarker = L.marker(e.latlng)
          .addTo(this.map)
          .bindPopup(
            "You are within " + e.accuracy + " meters from this point"
          );
      });

      // mouse draw
      this.map.on("mousedown", () => (this.mouseDown = true));
      this.map.on("mouseup", () => (this.mouseDown = false));
      this.map.on("mouseout", () => (this.mouseDown = false));
      this.map.on("mousemove", this.handleDraw);
    },

    initHeatmap() {
      if (this.map != null && this.heatmap != null) {
        this.map.removeLayer(this.heatmap);
      }

      this.heatmap = L.heatLayer([], {});
      return this.heatmap;
    },

    clearAll() {
      if (!confirm("Erase all areas?")) return;
      this.drawGroup.clearLayers();
      // this.raster = [];
      // this.updateHeatmap();
    },

    getHeatmapData(bounds) {
      let workouts = this.$store.getters["workout/all"];
      let rasterData = [];

      for (let workout of workouts) {
        rasterData.push(...workout.raster);
      }
      return rasterData;
    },

    updateHeatmap(zoomLevel, data=null) {
      let max = 1;
      if (!!data) {
        // TODO: calculate data max
      }
      let newData = this.getHeatmapData();
      let newOptions = {
        // minOpacity: 0,
        // maxZoom: 1,
        max,
        radius: 15,
        blur: 30
      };

      this.heatmap.setLatLngs(newData);
      this.heatmap.setOptions(newOptions);
    },

    handleDraw(e) {
      if (!this.drawMode || !this.mouseDown) return;
      if (this.map.getZoom() < 14) {
        // show toast for more zoom
        if (this.$store.getters["toast/all"].length == 0) {
          this.$store.dispatch("toast/info", "Please zoom in more to draw");
        }
        return;
      }
      let { lat, lng } = e.latlng;

      if (
        !this.lastDrawCoords ||
        distance(this.lastDrawCoords, e.latlng) > 0.0025
      ) {
        L.circle([lat, lng], {
          radius: 250,
          stroke: false,
          color: "rgba(0,128,255,.5)",
          fillOpacity: 1
        }).addTo(this.drawGroup);
        this.lastDrawCoords = e.latlng;
      }
    },

    toggleDrawMode() {
      // TODO: Fix zoom
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
      this.map.flyTo([target.y, target.x], 14);
    },

    confirmBack() {
      if (!confirm("Go back? you will lose the marked area")) return;
      this.$emit("back");
    },

    confirmSave() {
      if(this.drawGroup.getLayers().length == 0){
        this.$store.dispatch('toast/error', {message:this.$t('pages.workoutCreate.errorNoneSelected')})
        return;
      }
      if (!confirm("Upload this workout plan?")) return;

      let layers = this.drawGroup.getLayers();
      layers = layers.map(l => l.getLatLng());
      layers = layers.map(l => [l.lat, l.lng, 1]);

      this.$emit("input", layers);
      this.$emit("change", layers);
    }
  }
};
</script>
