<style>
.v-toolbar__title .router-link {
  color: inherit;
  text-decoration: inherit;
}
.v-toolbar__title .router-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
.v-toolbar__extension {
  height: auto !important;
  padding: 0px !important;
}
</style>

<template>
  <v-toolbar
    app
    flat
    :extended="showExtension"
    scroll-off-screen
    dense
    dark
    color="primary"
    style="z-index:999"
  >
    <v-toolbar-side-icon v-if="showToggleDrawer" @click="$emit('toggleDrawer')" />
    <v-toolbar-title class="headline text-uppercase">
      <router-link :to="{name:'home'}" active-class="router-link">
        <span style="text-transform:none">
          <small class="hidden-sm-and-up">{{ $t('app.name') }}</small>
          <small class="hidden-xs-only">{{ $t('app.longname') }}</small>
        </span>
      </router-link>
    </v-toolbar-title>

    <v-spacer />

    <v-toolbar-items>
      <v-btn class="hidden-xs-only" flat :to="{name:'about'}">{{ $t('pages.about.title') }}</v-btn>
      <v-divider vertical />
      <LoginLogoutButton />
    </v-toolbar-items>

    <!-- <template v-if="showExtension" v-slot:extension>
      <div style="background-color:white; width:100%">
      </div>
    </template>-->
  </v-toolbar>
</template>

<script>
import LoginLogoutButton from "@/components/toolbar/LoginLogoutButton";
import LanguageSelector from "@/components/toolbar/LanguageSelector";
// import FeedNavigation from "@/components/toolbar/FeedNavigation";

export default {
  components: {
    LoginLogoutButton
    // LanguageSelector,
    // FeedNavigation
  },

  props: ["showToggleDrawer"],

  data() {
    return {
      searchTerm: "",
      menuLinks: [
        // {name: "home", label:"navigation.links.home"},
      ],
      rules: {
        minimunLength: v =>
          !v ||
          v.length >= 3 ||
          this.$t("forms.rules.minimunLength", { length: 3 })
      }
    };
  },

  computed: {
    links() {
      return [];
    },

    showExtension() {
      // let show = this.$route.name == 'home';
      // document.getElementsByTagName('main').classList.add('extended')
      // return show
      return false;
    },

    _links() {
      if (this.userIsLoggedIn) {
        let links = [
          {
            miniOnly: true,
            name: "account",
            label: this.currentUser.first_name
          }
        ];
        if (this.currentUser.is_administrator) {
          links.push({ miniOnly: true, divider: true });
          links.push({
            miniOnly: true,
            name: "administration",
            label: "Administration"
          });
        }

        links.push({ miniOnly: true, divider: true });
        links.push(...this.$data.menuLinks);

        return links;
      }
      return this.menuLinks;
    },
    userIsLoggedIn() {
      return this.$store.getters["user/isLoggedIn"];
    },
    currentUser() {
      return this.$store.getters["user/current"];
    }
  },

  created() {
    this.searchTerm = this.$route.query["term"];
  },

  methods: {
    search() {
      if (this.$refs.searchForm.validate()) {
        this.$router.push({ name: "search", query: { q: this.searchTerm } });
      }
    },
    getCourses() {
      this.$router.push("/courses");
    },
    getCalendar() {},
    logout() {
      this.$store.dispatch("user/logout");
      this.$router.push({ name: "home" });
    }
  }
};
</script>
