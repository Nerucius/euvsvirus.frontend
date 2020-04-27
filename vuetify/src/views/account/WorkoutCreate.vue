<template>
  <v-layout justify-center align-start>
    <v-flex xs12>
      <v-card v-if="formPage==0" flat>
        <!-- <pre>{{ workout }}</pre> -->
        <v-card-title class="title">{{ $t('pages.workoutCreate.title') }}</v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="isValid" lazy-validation @submit.prevent="next">
            <!-- Sport picker -->
            <v-select
              v-model="workout.sport"
              :rules="[rules.required]"
              prepend-icon="mdi-basketball"
              :items="$store.getters['workout/sports']"
              :item-text="translate"
              item-value="id"
              :label="$t('forms.fields.sport')"
            />
            <!-- Datetime pickers -->
            <DialogDate v-model="workout.date" :rules="[rules.required]" :label="$t('forms.fields.date')" />
            <v-layout row wrap>
              <v-flex xs12 sm6>
                <DialogTime
                  v-model="workout.timeStart"
                  :rules="[rules.required, rules.isAfterNow]"
                  :label="$t('forms.fields.timeStart')"
                  @change="revalidate"
                />
              </v-flex>
              <v-flex xs12 sm6>
                <DialogTime
                  v-model="workout.timeEnd"
                  :rules="[rules.required, rules.isAfterStart]"
                  :label="$t('forms.fields.timeEnd')"
                />
              </v-flex>
            </v-layout>
            <v-layout mt-5>
              <v-flex shrink>
                <v-btn @click="$router.go(-1)" color="danger" outline>{{ $t('actions.cancel') }}</v-btn>
              </v-flex>
              <v-spacer />
              <v-flex shrink>
                <v-btn type="submit" color="success">{{ $t('actions.next') }}</v-btn>
              </v-flex>
            </v-layout>
          </v-form>
        </v-card-text>
      </v-card>
      <v-card v-else>
        <DrawMap v-model="workout.points" :datetime="dateStart" @back="prev" @change="submit" />
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import DialogDate from "@/components/input/DialogDate";
import DialogTime from "@/components/input/DialogTime";
import DrawMap from "@/components/input/DrawMap";

export default {
  components: {
    DialogDate,
    DialogTime,
    DrawMap,
  },

  metaInfo() {
    return {
      title: this.$t("pages.workoutCreate.title")
    };
  },

  data() {
    return {
      moment,
      formPage: 0,
      isValid: false,
      workout: {
        date: moment().format("YYYY-MM-DD"),
        points: [],
      },
      sports: ["Cycling", "Running", "Walk in the park", "Out with my children", "Other"],
      rules: {
        required: v => !!v || this.$t("forms.rules.requiredField"),
        isAfterStart: v => this.isAfterStart(v) || this.$t("forms.rules.mustBeAfterStart"),
        isAfterNow: v => this.isAfterNow(v) || this.$t("forms.rules.mustBeAfterNow"),
      }
    };
  },

  computed:{
    dateStart(){
      if(!this.workout.timeStart) return
      let [tsh, tsm] = this.workout.timeStart.split(':').map(parseFloat)
      return moment(this.date).hour(tsh).minute(tsm).utc()
    }
  },

  methods: {
    translate(obj){
      return this.$t(obj.name)
    },

    revalidate(){
      this.$refs.form.validate()
    },

    isAfterNow(time){
      if(!time) return true;

      let [sh, sm] = time.split(':').map(parseFloat)
      let timeMoment = moment(this.workout.date).hours(sh).minutes(sm)
      return timeMoment.isAfter(moment());
    },

    isAfterStart(time){
      // If no start time or no time
      if(!time || !this.workout.timeStart) return true;

      let [sh, sm] = this.workout.timeStart.split(':').map(parseFloat)
      let [eh, em] = time.split(':').map(parseFloat)
      return (eh*60 + em) > (sh*60 + sm);
    },

    prev() {
      this.formPage = 0;
    },
    next() {
      if (!this.$refs.form.validate()) return;
      this.formPage = 1;
    },

    async submit() {
      let [tsh, tsm] = this.workout.timeStart.split(':').map(parseFloat)
      let [teh, tem] = this.workout.timeEnd.split(':').map(parseFloat)

      this.workout.datetimeStart = moment(this.workout.date).hour(tsh).minute(tsm).utc().format()
      this.workout.datetimeEnd = moment(this.workout.date).hour(teh).minute(tem).utc().format()

      try{
        await this.$store.dispatch('workout/create', this.workout)
        this.$store.dispatch('toast/success', "Workout created!")
        this.$router.push({name:"home"})
      }catch(error){
        this.$store.dispatch('toast/error', {message:"Failed to create workout. Try again later", error})
      }
    }
  }
};
</script>
