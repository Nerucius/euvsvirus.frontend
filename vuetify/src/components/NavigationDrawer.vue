<style scoped>
.subheading {
  line-height: 120%;
}

.sidebar-header{
    background: repeating-linear-gradient(
      -45deg,
      #673ec5 ,
      #673ec5  40px,
      #512da8  40px,
      #512da8  80px
    );
  }
.sidebar-header small {
  color: lightgray;
}

.v-list > div {
  margin-bottom: 4px;
}
</style>


<template>
  <v-navigation-drawer v-model="showDrawer" app temporary style="z-index:9999">
    <v-layout column justify-start fill-height>
      <!-- Avatar and Name -->
      <v-flex shrink>
        <v-sheet class="sidebar-header">
          <v-layout pt-4 px-3 pb-3 column>
            <v-flex shrink>
              <v-avatar size="80">
                <img :src="currentUser.imageUrl" alt="avatar">
              </v-avatar>
            </v-flex>

            <v-flex mt-3 class="subheading white--text">
              {{ currentUser.firstName }} {{ currentUser.lastName }}
              <br>
              <small>{{ currentUser.mail }}</small>
            </v-flex>
          </v-layout>
        </v-sheet>
      </v-flex>

      <v-list>
        <!-- My account -->
        <v-list-tile to="/account" exact>
          <v-list-tile-action>
            <v-icon color="primary darken-2">
              person
            </v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ $t('pages.account.title') }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-divider />
        <!-- My Shops -->
        <v-list-tile to="/account/shops">
          <v-list-tile-action>
            <v-icon color="red darken-2">
              store
            </v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ $t('pages.myShops.title') }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-divider />
        <!-- Map -->
        <v-list-tile to="/map">
          <v-list-tile-action>
            <v-icon color="green darken-2">
              map
            </v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ $t('pages.map.title') }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-divider />
        <!-- Favourites -->
        <v-list-tile to="/favourites">
          <v-list-tile-action>
            <v-icon color="orange darken-2">
              star
            </v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ $t('pages.favourites.title') }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-divider />
      </v-list>

      <v-spacer />

      <!-- <v-divider />
      <v-flex shrink>
        <ThemeSelector />
      </v-flex>-->
    </v-layout>
  </v-navigation-drawer>
</template>

<script>
// import ThemeSelector from "@/components/drawer/ThemeSelector";

export default {
  name: "NavigationDrawer",

  components: {
    // ThemeSelector
  },

  data() {
    return {
      showDrawer: null,
      showAccountMenu: false
    };
  },

  computed: {
    currentUser() {
      return this.$store.getters["user/current"];
    }
  },

  methods: {
    toggleDrawer() {
      this.showDrawer = !this.showDrawer;
    },
    toggleAccountMenu() {
      this.showAccountMenu = !this.showAccountMenu;
    }
  }
};
</script>
