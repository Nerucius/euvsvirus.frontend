<style>
.time-bar {
  z-index: 999;
  position: absolute;
  bottom: 30px;
  left: 16px;
  right: 16px;
  /* width: 60%; */
}
</style>

<template>
  <v-card class="time-bar">
    <v-layout px-3 align-center>
      <v-flex shrink mr-3 class="subheading">
        <v-card
          @click="resetTime"
          :flat="!dirty"
          class="px-2"
          v-html="selectedTimeFormat" />
      </v-flex>
      <v-flex>
        <v-slider
          v-model="timeSlice"
          :min="0"
          :max="noSteps"
          step="1"
          prepend-icon="mdi-clock"
          @input="updateSlice()"
          @change="emitChange()"
        />
      </v-flex>
    </v-layout>
  </v-card>
</template>

<script>
export default {
  props: ["value", "range"],

  data() {
    return {
      selectedTime: moment(),
      timeSlice: null,
      dirty: false,
      rangeCenter: 0.25
    };
  },

  computed: {
    rangeValue(){
      return this.range || 6
    },
    rangeStart() {
      return moment().add(-((this.rangeValue / 2) * 60), "minutes");
    },
    rangeEnd() {
      return moment().add(+((this.rangeValue / 2) * 60), "minutes");
    },
    noSteps() {
      return this.rangeValue * 4; // 4 15 minute intervals in an hour
    },
    selectedTimeFormat() {
      return this.selectedTime.format("ddd D<br> <b>HH:mm</b>")
    }
  },

  mounted() {
    this.timeSlice = this.noSteps * this.rangeCenter
  },

  methods: {
    resetTime(){
      this.selectedTime = moment();
      this.timeSlice = this.noSteps * this.rangeCenter
      this.dirty = false;
      // TODO: test if double change
      this.emitChange()
    },

    updateSlice() {
      this.dirty = true;
      this.selectedTime = this.sliceToTime(this.timeSlice)
    },

    emitChange() {
      this.$emit('input', this.selectedTime)
      this.$emit('change', this.selectedTime)
    },

    sliceToTime(slice){
      let centerSlice = slice - (this.noSteps * this.rangeCenter)
      let minuteOffset = centerSlice  * 15;
      return moment()
        .add(minuteOffset, 'minutes')
    }
  }
};
</script>
