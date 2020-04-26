
<template>
  <v-layout>
    <v-flex xs12>
      <v-card flat>
        <v-card-title class="title">{{ $t('pages.myWorkouts.title') }}</v-card-title>
        <v-card-text class="pa-0">
          <v-list two-line subheader>

            <v-subheader>
              You have a total of {{ userWorkoutCount }} workouts registered in the system.
            </v-subheader>

            <v-list-tile avatar>
              <v-list-tile-content>
                <v-list-tile-title>{{ user.fullName }}</v-list-tile-title>
                <v-list-tile-sub-title>Full name</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>

          </v-list>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
// import { onlyUnique, slug2id, donwloadAsyncCSV } from "@/plugins/utils";
// import { API_SERVER } from "@/plugins/resource";
// import { cloneDeep } from "lodash";

export default {
  metaInfo() {
    return {
      title: this.$t("pages.myWorkouts.title")
    };
  },

  data() {
    return {};
  },

  computed: {
    /** Current User being displayed */
    user() {
      return this.$store.getters["user/current"];
    },
    userWorkoutCount(){
      return 3
    }
  },

  async mounted() {
    await this.$store.dispatch("user/load");
    await this.$store.dispatch("workout/load", {params:{user:this.user.id}});
  },

  methods: {}
};
</script>
