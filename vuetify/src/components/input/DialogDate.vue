<template>
  <v-dialog
    ref="dialog"
    v-model="dialog"
    :return-value.sync="date"
    persistent
    lazy
    full-width
    width="290px"
  >
    <template v-slot:activator="{ on }">
      <v-text-field
        v-model="date"
        :rules="rules"
        :label="label"
        prepend-icon="event"
        readonly
        v-on="on"
      />
    </template>
    <v-date-picker v-if="dialog" v-model="date" scrollable :allowed-dates="isValidDate">
      <v-spacer />
      <v-btn flat color="primary" @click="dialog = false">{{ $t('actions.cancel') }}</v-btn>
      <v-btn flat color="primary" @click="$refs.dialog.save(date);save()">{{ $t('actions.accept') }}</v-btn>
    </v-date-picker>
  </v-dialog>
</template>

<script>
export default {
  props: ["value", "label", "rules"],

  data() {
    return {
      date: null,
      dialog: false
    };
  },

  mounted() {
    this.date = this.value;
  },

  methods: {
    save() {
      this.$emit("input", this.date);
      this.$emit("change", this.date);
    },

    isValidDate(date) {
      let mdate = moment(date);
      let today = moment().add(-1, "d");
      return mdate.isAfter(today);
    }
  }
};
</script>
