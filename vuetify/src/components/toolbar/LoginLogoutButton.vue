<template>
  <v-btn v-if="!isLoggedIn" flat :to="{name:'login'}">
    {{ $t('actions.login') }}
    <v-icon right>
      lock_open
    </v-icon>
  </v-btn>

  <!-- <v-btn v-else flat @click="logout()">
    {{ $t('actions.logout') }}
    <v-icon right>
      exit_to_app
    </v-icon>
  </v-btn>-->

  <v-menu v-else offset-y>
    <v-btn slot="activator" flat>
      <!-- <v-avatar size="36">
        <img
          :src="user.imageUrl"
          :alt="user.firstName"
        >
      </v-avatar> -->
      {{ user.firstName }}
      <v-icon>
        expand_more
      </v-icon>
    </v-btn>

    <v-list>
      <v-list-tile :to="{name:'account'}" exact>
        <v-list-tile-title>
          <v-icon left>
            person
          </v-icon>
          {{ $t('pages.account.title') }}
        </v-list-tile-title>
      </v-list-tile>
      <v-list-tile @click="logout()">
        <v-list-tile-title>
          <v-icon left>
            exit_to_app
          </v-icon>
          Log out
        </v-list-tile-title>
      </v-list-tile>
    </v-list>
  </v-menu>
</template>


<script>
export default {
  name: "LoginLogoutButton",

  computed: {
    isLoggedIn() {
      return this.$store.getters["user/isLoggedIn"];
    },
    user() {
      return this.$store.getters["user/current"];
    }
  },

  methods: {
    async logout() {
      await this.$store.dispatch("user/logout");
      this.$store.dispatch("toast/info", this.$t('forms.toasts.loggedOut'));
      try{this.$router.push({ name: 'home'})} catch(error){}
    }
  }
};
</script>
