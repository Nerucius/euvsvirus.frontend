<style>
.leaflet-control-attribution{
  white-space: nowrap;
  overflow: hidden;
}
</style>

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
        <v-text-field v-model="searchTerm" hide-details prepend-icon="search" single-line />
      </v-form>
      <v-btn :disabled="!canGeolocate" icon @click="map.locate({setView:true, maxZoom:13})">
        <v-icon>my_location</v-icon>
      </v-btn>
    </v-toolbar>

    <!-- Favicon buttons -->

    <!-- <v-speed-dial
      v-model="speeddial"
      absolute
      style="bottom:180px;right:30px; z-index:999"
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
    </v-speed-dial> -->

    <v-btn
      :to="{name:'workout-create'}"
      absolute
      style="bottom:110px;right:30px; z-index:999"
      fab
      class="elevation-2 success--text"
    >
      <v-icon>add</v-icon>
    </v-btn>

    <TimeToolbar v-model="selectedDatetime" @change="updateHeatmap" />

    <!-- Map -->
    <div id="heatmap" class="map" />
  </v-card>
</template>

<script>
import TimeToolbar from "@/components/home/TimeToolbar";

import { OpenStreetMapProvider } from "leaflet-geosearch";
import { Thunderforest_OpenCycleMap, Thunderforest_Outdoors } from "@/plugins/maplayers.js";

const LightThemeMap = Thunderforest_Outdoors
const DarkThemeMap = Thunderforest_Outdoors

const provider = new OpenStreetMapProvider();
noise.seed(Math.random());

export default {

  components:{
    TimeToolbar,
  },

  data() {
    return {
      speeddial: false,
      searchTerm: "",
      selectedDatetime: moment(),

      map: {},
      heatmap: null,
      raster: [],

      positionMarker: null,
      searchMarker: null
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

  destroyed(){
    this.map.off();
    this.map.remove();
  },

  methods: {
    initMap() {
      this.map = L.map("heatmap", {
        maxBounds: [
          [80, -180],
          [-70, 180]
        ],
        zoomControl: false,
        zoom: 13,
        minZoom: 2,
        maxZoom: 15,
        center: { lat: 41.37, lon: 2.187 } // Barcelona
      });

      // Init layers
      // switch by theme
      if(this.$store.getters['preferences/theme'] == 'light'){
        let mapLayer = LightThemeMap();
        mapLayer.addTo(this.map);
      }else{
        let mapLayer = DarkThemeMap();
        mapLayer.addTo(this.map);
      }

      // Heatmap setup
      let heatmapLayer = this.initHeatmap();
      heatmapLayer.addTo(this.map);

      // this.map.locate({ setView: true, maxZoom: 13 });
      this.map.on("locationfound", e => {
        if (this.positionMarker != null) {
          this.map.removeLayer(this.positionMarker);
        }
        this.positionMarker = L.marker(e.latlng)
          .addTo(this.map)
          .bindPopup(
            "You are within " + e.accuracy + " meters from this point"
          );

        // var radius = Math.min(e.accuracy, 1000);
        // L.circle(e.latlng, { radius }).addTo(this.map);
      });

      // listerners
      this.map.on("moveend", this.updateHeatmap);
      this.map.on("zoomstart", () => this.heatmap.setLatLngs([]));
    },

    initHeatmap() {
      if (this.map != null && this.heatmap != null) {
        this.map.removeLayer(this.heatmap);
      }

      this.heatmap = L.heatLayer([], {});
      this.updateHeatmap();
      return this.heatmap;
    },

    async updateHeatmap() {
      // generate new data and options
      let newData = await this.getHeatmapData();
      let newOptions = this.getHeatmapOptions(newData);

      this.heatmap.setLatLngs(newData);
      this.heatmap.setOptions(newOptions);
    },

    getHeatmapOptions(data) {
      let max = 1;
      if (!!data) {
        // TODO: calculate data max
      }
      var options = {
        // minOpacity: 0,
        // maxZoom: 15,
        max,
        radius: 15,
        blur: 30
        // gradient: {
        //   0: "rgba(255,255,255,.3)",
        //   0.4: "rgba(200,255,200,.3)",
        //   0.8: "rgba(200,200,255,.3)",
        //   1: "rgba(0,0,200,.1)"
        // }
      };

      return options;
    },

    async getHeatmapData(bounds) {
      await this.updateWorkouts()
      let workouts = this.$store.getters["workout/all"];
      let rasterData = [];

      for (let workout of workouts) {
        rasterData.push(...workout.raster);
      }
      return rasterData;
    },

    async updateWorkouts(){
      let datetime = moment(this.selectedDatetime).utc().format()
      let mapBounds = this.map.getBounds()
      let bounds = [
        [mapBounds.getNorth(), mapBounds.getEast()],
        [mapBounds.getSouth(), mapBounds.getWest()],
      ]
      await this.$store.dispatch('workout/load', {params:{bounds:JSON.stringify(bounds),datetime}})
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
    }
  }
};
</script>
