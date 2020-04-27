<style>
.time-bar {
  z-index: 999;
  position: absolute;
  bottom: 30px;
  left: 16px;
  right: 16px;
  white-space: nowrap;
  /* width: 60%; */
}
</style>

<style scoped>
.v-input--slider{
  margin: 12px 0 -4px 0;
}
</style>

<template>
  <v-card class="time-bar">
    <v-layout px-3 align-center>
      <v-flex shrink mr-3 class="subheading">
        <v-card
          @click="resetTime"
          :flat="!dirty"
          class="px-2 text-xs-center"
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
      now: moment(),
      selectedTime: moment(),
      timeSlice: null,
      dirty: false,
      rangeCenter: 0.25,
      updateTimeTask : null
    };
  },

  computed: {
    rangeValue(){
      return this.range || 6
    },
    rangeStart() {
      return moment(this.now).add(-((this.rangeValue / 2) * 60), "minutes");
    },
    rangeEnd() {
      return moment(this.now).add(+((this.rangeValue / 2) * 60), "minutes");
    },
    noSteps() {
      return this.rangeValue * 4; // 4 15 minute intervals in an hour
    },
    selectedTimeFormat() {
      return this.selectedTime.format("ddd D<br> <b>HH:mm</b>")
    }
  },

  mounted() {
    this.init()

    this.updateTimeTask = setInterval(()=>{
      if (this.dirty) return
      this.resetTime()
    }, 5000 * 60) // every 5 mminutes
  },

  destroyed(){
    if(this.updateTimeTask)
      clearInterval(this.updateTimeTask);
  },

  methods: {
    init(){
      this.dirty = false;
      this.now = moment()
      this.selectedTime = moment()
      this.timeSlice = this.noSteps * this.rangeCenter
    },

    resetTime(){
      this.init()
      this.emitChange()
    },

    updateSlice() {
      this.dirty = true;
      this.selectedTime = this.sliceToTime(this.timeSlice)
    },

    emitChange() {
      this.$emit('input',  this.selectedTime)
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
