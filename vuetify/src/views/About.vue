<template>
  <v-layout row wrap justify-center>
    <v-flex xs12 md10 xl8>
      <v-card flat>
        <v-card-text>
          <v-layout wrap>
            <v-flex xs12 sm6 pr-4>
              <h1>About Us</h1>
              <p>We are Herman Dempere and Christian Solero, two University of Barcelona alumni. We are experts in the field of Cloud computing and Mathematics. We currently live in Barcelona and are suffering, as many other people are, the ongoing CoVID19 pandemic.</p>
              <v-layout>
                <v-flex>
                  <v-card href="https://www.linkedin.com/in/herman-dempere/">
                    <v-img
                      height="180"
                      src="https://media-exp1.licdn.com/dms/image/C5603AQE64SZdPH3QsQ/profile-displayphoto-shrink_200_200/0?e=1593648000&v=beta&t=zrWzC__ya_EcBN8NJkfL9jPKuAN_tPNVsI-A1Ug9dB4"
                    />
                    <v-card-text><b>Herman Dempere</b> on Linkedin</v-card-text>
                  </v-card>
                </v-flex>
                <v-flex xs1></v-flex>
                <v-flex>
                  <v-card href="https://www.linkedin.com/in/christian-jose-soler/">
                    <v-img
                      height="180"
                      src="https://media-exp1.licdn.com/dms/image/C4D03AQGIuRf1lEv7IA/profile-displayphoto-shrink_200_200/0?e=1593648000&v=beta&t=aeNTKlBFg0vRJk80ML9Mm_hJ15cPaM8OvsAdI8FJ19o"
                    />
                    <v-card-text><b>Christian José Soler</b> on Linkedin</v-card-text>
                  </v-card>
                </v-flex>
              </v-layout>
              <br>
              <p>During these trying times, we want to contribute our time and expertise in creating new and innovative tools that can help all of us come of this crisis ahead.</p>
              <h1>About EUvsVirus</h1>
              <p>The European Commission, led by the European Innovation Council and in close collaboration with the EU member states, will host a pan-European hackathon to connect civil society, innovators, partners and investors across Europe in order to develop innovative solutions for coronavirus-related challenges.</p>
              <h1>About this project</h1>
              <h2>Inspiration</h2>
              <p>We are looking towards a bittersweet future where we might still need to distance ourselves from other people while we are outside. And that includes when we work out. Imagine going out for a jog and having to come into close contact with other people who had the same idea as you, and unfortunately went to the same nice park at the same time as you. If only you could have known!</p>
              <h2>What it does</h2>
              <p>This is where Social Distance Workouts comes into play. Be able to take a quick glance of your city and know exactly where people are planning to go cycling, jogging, swimming. And avoid those areas! Want to contribute to the platform and mark an area where you're going to be minding your business? You can do that aswell. Bonus points, people will also avoid you now that they know wherein you plan to workout. Everyone wins.</p>
            </v-flex>
            <v-flex xs12 sm6>
              <v-img width="100%" src="/img/branding/euvsvirus.jpeg" />
            </v-flex>
          </v-layout>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  metaInfo() {
    return {
      title: this.$t("pages.about.title")
    };
  },

  components: {},
  data() {
    return {};
  }
};
</script>
