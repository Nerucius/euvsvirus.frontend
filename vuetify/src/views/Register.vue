<style scoped>
th,
td {
  padding-bottom: 10px;
}
</style>


<template>
  <v-layout justify-center>
    <v-flex xs12 md10 lg8 xl6>
      <v-card flat>
        <v-card-title>
          <h2>{{ $t('pages.login.register') }}</h2>
        </v-card-title>
        <v-card-text>
          <v-layout row wrap>
            <v-flex pt-0>
              <v-layout row wrap justify-center>
                <v-flex xs12 sm8>
                  <v-form ref="form" v-model="valid">
                    <v-text-field
                      v-model="user.firstName"
                      :label="$t('forms.fields.firstName')"
                      :hint="$t('forms.hints.firstName')"
                      :rules="[rules.required]"
                      prepend-icon="person"
                      type="text"
                    />
                    <v-text-field
                      v-model="user.lastName"
                      :label="$t('forms.fields.lastName')"
                      :hint="$t('forms.hints.lastName')"
                      :rules="[rules.required]"
                      prepend-icon="person"
                      type="text"
                    />
                    <v-text-field
                      v-model="user.email"
                      :label="$t('forms.fields.email')"
                      :hint="$t('forms.hints.email')"
                      :rules="[rules.required, rules.isEmail]"
                      prepend-icon="person"
                      type="text"
                    />
                    <v-text-field
                      v-model="user.password"
                      :label="$t('forms.fields.password')"
                      :hint="$t('forms.hints.password')"
                      :rules="[rules.required, rules.minimunLength, rules.passwordValid]"
                      prepend-icon="lock"
                      type="password"
                      @input="$refs.form.validate()"
                    />
                    <v-text-field
                      v-model="user.password2"
                      prepend-icon="lock"
                      :label="$t('forms.fields.passwordRepeat')"
                      :rules="[rules.passwordMatch]"
                      type="password"
                    />
                  </v-form>
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
        </v-card-text>

        <v-card-actions class="mt-2 pb-3 px-3">
          <v-spacer />
          <v-flex shrink>
            <v-btn
              color="primary"
              :disabled="!valid"
              @click="submitRegister()"
            >
              {{ $t("actions.register") }}
            </v-btn>
          </v-flex>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  metaInfo() {
    return {
      title: this.$t("actions.register")
    };
  },

  data() {
    return {
      valid: true,
      failedRegistration: false,

      user: {},
      rules: {
        required: v => !!v || this.$t("forms.rules.requiredField"),
        validUsername: v =>
          this.isValidUsername(v) || this.$t("forms.rules.invalidUsername"),
        unusedUsername: v =>
          this.isUsernameFree(v) || this.$t("forms.rules.usernameInUse"),
        minimunLength6: v =>
          (v || "").length >= 6 ||
          this.$t("forms.rules.minimunLength", { length: 6 }),
        minimunLength: v =>
          (v || "").length >= 8 ||
          this.$t("forms.rules.minimunLength", { length: 8 }),
        passwordValid: v =>
          this.isValidPassword(v) || this.$t("forms.rules.passwordField"),
        passwordMatch: v =>
          this.user.password == this.user.password2 ||
          this.$t("forms.rules.passwordMatch"),
        isEmail: v => this.isEmail(v) || this.$t("forms.rules.requiredField")
      }
    };
  },

  mounted() {
    this.$store.dispatch("user/logout");
  },

  methods: {
    async submitRegister() {
      if (!this.valid) {
        return;
      }
      let newUser = { ...this.user };
      delete newUser["password2"];

      try {
        let response = await this.$store.dispatch("user/register", newUser);
        await this.$store.dispatch("user/login", {
          email: newUser.email,
          password: newUser.password
        });
        this.$store.dispatch("toast/success", this.$t("pages.register.registrationSuccess"));
        this.$router.push({ name: "home" });
      } catch (error) {
        this.$store.dispatch("toast/error", {
          message: this.$t("pages.register.registrationFailure"),
          error
        });
        this.failedRegistration = true;
      }
    },

    isValidUsername(username) {
      return /^[a-zA-Z0-9@\.\+\-_]{6,32}$/.test(username);
    },

    isUsernameFree(username) {
      return true;
      // let allUsers = this.$store.getters["user/all"];
      // return allUsers.filter(u => u.username == username).length == 0;
    },

    isEmail(value = "") {
      let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(value).toLowerCase());
    },

    isValidPassword(value = "") {
      value = value.toLowerCase();
      return (
        true &&
        value != "12345678" &&
        value != "password" &&
        value != "password1" &&
        value != "password12" &&
        value != "password123" &&
        value != "password1234" &&
        value != this.user.username
      );
    },

    isCompleted(stepIdx) {
      let required = this.steps[stepIdx - 1].required;
      required = Object.values(required);
      return required == [] || required.every(v => !!v);
    },

    nextStep() {
      this.registrationStep = Math.min(
        this.steps.length,
        this.registrationStep + 1
      );
    }
  }
};
</script>
