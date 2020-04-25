<style>
/* Global Styles */
/* html{ overflow-y: hidden !important; } */
.application--wrap{
  height: auto !important;
  min-height: calc(var(--vh, 1vh) * 100) !important;
}

::-webkit-scrollbar {
  width: 0.65em;
}

::-webkit-scrollbar-track {
  margin-top: -1px;
  background: rgb(12, 77, 77);
  /* -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3); */
}

::-webkit-scrollbar-thumb {
  background: #00796b;
  border-top: 1px solid lightgray;
  border-bottom: 1px solid lightgray;
}

#toast-container {
  padding-top: 10px;
}
.v-snack {
  padding-top: 10px;
}
</style>

<style scoped>
/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.1s;
  transition-property: opacity;
  transition-timing-function: ease;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}

.slide-enter-active {
  transition: all .3s ease;
}
.slide-leave-active {
  transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-enter, .slide-leave-to {
  transform: translateY(60px);
  /* opacity: 0; */
}
</style>


<template>
  <v-app :[theme]="true">
    <template v-if="loading">
      <v-content>
        <v-container fill-height>
          <v-layout align-center justify-center>
            <v-flex xs12 class="text-xs-center">
              <v-btn fab large outline loading />
            </v-flex>
          </v-layout>
        </v-container>
      </v-content>
    </template>

    <template v-else>
      <!-- Navigation Drawer -->
      <NavigationDrawer v-if="showNavigation" ref="navigationDrawer" />
      <Toolbar ref="toolbar" :show-toggle-drawer="showNavigation" @toggleDrawer="toggleDrawer()" />

      <!-- Content -->
      <v-content>
        <v-container id="v-container" pa-0 fill-height fluid>
          <!-- Main Content Area -->
          <transition name="fade" mode="out-in">
            <router-view :key="routePathKey" />
          </transition>
          <!-- /Main Content Area -->
        </v-container>

        <!-- Snackbars -->
        <v-snackbar
          v-for="toast in toasts"
          :key="toast.key"
          v-model="toast.active"
          auto-height
          top
          :color="toast.color"
          :timeout="toast.timeout"
          style="z-index:999999"
        >
          <span v-html="toast.message" />
          <v-btn dark flat fab @click="toast.close()">
            <v-icon>close</v-icon>
          </v-btn>
        </v-snackbar>
        <!-- /Snackbars -->
      </v-content>

      <transition name="slide">
        <Footer v-if="showFooter" />
      </transition>
      <!-- Cookie Policy Toast -->
      <CookieToast />
    </template>
  </v-app>
</template>

<script>
import NavigationDrawer from "@/components/NavigationDrawer";
import CookieToast from "@/components/CookieToast";
import Toolbar from "@/components/Toolbar";
import Footer from "@/components/Footer";

export default {
  name: "App",
  components: {
    CookieToast,
    NavigationDrawer,
    Toolbar,
    Footer
  },

  metaInfo() {
    return {
      title: this.$t("app.name"),
      titleTemplate: `%s | ${this.$t("app.name")}`
    };
  },

  data() {
    return {
      loading: true,
      active: true,
      showFooterScroll: true,
    };
  },

  computed: {
    showFooter(){
      return !this.$route.meta.hasMap;
      // return this.showFooterScroll
      //   && !(
      //     !this.$route.name ||
      //     (this.$route.name.indexOf('home') != -1)
      //   )
    },
    toasts() {
      return this.$store.getters["toast/all"];
    },
    theme() {
      return this.$store.getters["preferences/theme"];
    },
    showNavigation() {
      return this.$store.getters["user/isLoggedIn"];
    },
    routePathKey() {
      // Returns a usable fullRoute key without the hash to use as in-page state
      return this.$route.fullPath.replace(/#.*/gi, "");
    }
  },

  async created() {
    // Block on the user status before allowing to show the app
    this.$store.dispatch("user/load");
    try{
      await this.$store.dispatch("user/loadCurrent");
    }catch(error){
      // this.$store.dispatch("toast/error", {message: 'Failed to login', error})
    }
    this.loading = false;
  },

  mounted(){
    window.addEventListener('scroll', this.handleScroll);
    // Fix body height

    let setMobileVH = () => {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    window.addEventListener('resize', setMobileVH)
    setMobileVH();

    // setTimeout(() => {
    //   document.getElementsByClassName('application--wrap')
    //     .style.height = window.innerHeight
    // }, 0)
  },

  methods: {
    handleScroll(){
      if(this.showFooterScroll)
        this.showFooterScroll = window.scrollY < 310;
      else
        this.showFooterScroll = window.scrollY < 50;
    },
    toggleDrawer() {
      this.$refs.navigationDrawer.toggleDrawer();
    }
  }
};
</script>
