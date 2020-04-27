<template>
  <v-footer app height="36">
    <v-layout>
      <v-flex xs12>
        <v-card flat>
          <v-card-text class="py-2 px-3 grey--text">
            <v-layout>
              <v-flex shrink>
                {{ $t('app.name') }}
                | <router-link :to="{name:'about'}">{{ $t('pages.about.title') }}</router-link>
              </v-flex>
              <v-spacer />
              <v-flex shrink>
                &copy; {{ $t('app.company') }} | {{ currentYear }}
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-footer>
</template>

<script>
export default {
  data() {
    return {
      currentYear: new Date().getFullYear()
    };
  }
};
</script>
