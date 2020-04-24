<template>
  <v-layout row wrap align-content-start>
    <v-flex xs12>
      <HeatMap />
    </v-flex>
  </v-layout>
</template>

<script>
// import { GeoJSONCountries } from "@/plugins/i18n";
// import { GeoJSONCountriesDetail, Countries } from "@/plugins/i18n";
import HeatMap from "@/components/home/HeatMap";


export default {
  components: {
    HeatMap
  },

  metaInfo() {
    return {
      title: this.$t('pages.home.title'),
    }
  },

  data() {
    return {
    };
  },

  computed: {},

  created() {
    console.log('Home.created')
  },

  mounted() {
    console.log('Home.mounted')
  },

  methods: {
  }
};
</script>
