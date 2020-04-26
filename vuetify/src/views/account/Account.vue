
<template>
  <v-layout>
    <v-flex xs12>
      <v-card flat>
        <v-card-title class="title">{{ $t('pages.account.title') }}</v-card-title>
        <v-card-text class="pa-0">
          <v-list two-line subheader>
            <v-subheader>My profile</v-subheader>

            <v-list-tile avatar>
              <v-list-tile-content>
                <v-list-tile-title>{{ user.fullName }}</v-list-tile-title>
                <v-list-tile-sub-title>Full name</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>

            <v-list-tile avatar>
              <v-list-tile-content>
                <v-list-tile-title>{{ user.email }}</v-list-tile-title>
                <v-list-tile-sub-title>Your email (only visible to you)</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>

            <v-subheader>My Workouts</v-subheader>

            <v-list-tile avatar>
              <v-list-tile-content>
                <v-list-tile-title>{{ user.email }}</v-list-tile-title>
                <v-list-tile-sub-title>Your email (only visible to you)</v-list-tile-sub-title>
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
      title: this.$t("pages.account.title")
    };
  },

  data() {
    return {};
  },

  computed: {
    /** Current User being displayed */
    user() {
      return this.$store.getters["user/current"];
    }
  },

  async mounted() {
    await this.$store.dispatch("user/load");
  },

  methods: {}
};
</script>
