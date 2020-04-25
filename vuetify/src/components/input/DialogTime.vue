<template>
  <v-dialog
    ref="dialog"
    v-model="dialog"
    :return-value.sync="time"
    persistent
    lazy
    full-width
    width="290px"
  >
    <template v-slot:activator="{ on }">
      <v-text-field
        v-model="time"
        :rules="rules"
        :label="label"
        prepend-icon="access_time"
        readonly
        v-on="on"
      />
    </template>
    <v-time-picker
      v-if="dialog"
      v-model="time"
      scrollable
      :allowed-minutes="allowedStep"
      format="24hr"
    >
      <v-spacer />
      <v-btn flat color="primary" @click="dialog = false">{{ $t('actions.cancel') }}</v-btn>
      <v-btn flat color="primary" @click="$refs.dialog.save(time);save()">{{ $t('actions.accept') }}</v-btn>
    </v-time-picker>
  </v-dialog>
</template>

<script>
export default {
  props: ["value", "label", "rules"],

  data() {
    return {
      time: null,
      dialog: false,
      allowedStep: m => m % 15 === 0
    };
  },

  mounted() {
    this.time = this.value;
  },

  methods: {
    save() {
      this.$emit("input", this.time);
      this.$emit("change", this.time);
    }
  }
};
</script>
