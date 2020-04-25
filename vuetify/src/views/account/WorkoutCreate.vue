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
              :items="sports"
              :label="$t('forms.fields.sport')"
            />
            <!-- Datetime pickers -->
            <DialogDate v-model="workout.date" :rules="[rules.required]" :label="$t('forms.fields.date')" />
            <v-layout row wrap>
              <v-flex xs12 sm6>
                <DialogTime
                  v-model="workout.timeStart"
                  :rules="[rules.required]"
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
                <v-btn @click="$router.go(-1)" color="error" outline>{{ $t('actions.cancel') }}</v-btn>
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
        <DrawMap @back="prev" />
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
      formPage: 0,
      isValid: false,
      workout: {
        date: moment().format("YYYY-MM-DD")
      },
      sports: ["Cycling", "Running", "Walk in the park", "Out with my children", "Other"],
      rules: {
        required: v => !!v || this.$t("forms.rules.requiredField"),
        isAfterStart: v => this.isAfterStart(v) || this.$t("forms.rules.mustBeAfterStart")
      }
    };
  },

  methods: {
    revalidate(){
      this.$refs.form.validate()
    },

    isAfterStart(time){
      if(!!this.workout.timeStart){
        let [sh, sm] = this.workout.timeStart.split(':').map(parseFloat)
        let [eh, em] = time.split(':').map(parseFloat)
        return (eh*60 + em) > (sh*60 + sm);
      }
      return false;
    },

    prev() {
      this.formPage -= 1;
    },
    next() {
      if (this.$refs.form.validate()) {
      }
      this.formPage += 1;
    },
    submit() {
      alert(JSON.stringify(this.workout));
    }
  }
};
</script>
