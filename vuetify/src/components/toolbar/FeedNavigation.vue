<style scoped>
</style>

<template>
  <v-layout justify-space-between row style="overflow-x:hidden">
    <v-flex v-for="button in buttons" :key="button.name" shrink px-0 pb-2 class="text-xs-center">
      <v-layout row wrap>
        <v-flex xs12 px-2>
          <v-btn small flat fab :color="button.color">
            <v-icon large>
              {{ button.icon }}
            </v-icon>
          </v-btn>
        </v-flex>
        <v-flex xs12>
          <small style="color:black">
            <b>{{ button.name | uppercase }}</b>
          </small>
        </v-flex>
      </v-layout>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data() {
    return {
      buttons: [
        { name: "Farmacy", color: "red", icon: "mdi-hospital" },
        { name: "Food", color: "brown", icon: "mdi-food" },
        { name: "Clothes", color: "orange", icon: "mdi-tshirt-crew" },
        { name: "More", color: "black", icon: "mdi-dots-horizontal" }
      ]
    };
  }
};
</script>

<style>
</style>
