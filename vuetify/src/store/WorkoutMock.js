import store from "../store";

const STORAGE_KEY = "store/workouts";

export default {
  namespaced: true,

  state: {
    workouts: [],
  },

  mutations: {
    SET(state, workouts) {
      state.workouts = [...workouts];
    },
    ADD(state, workout) {
      state.workouts = [...state.workouts, workout];
      localStorage[STORAGE_KEY] = JSON.stringify(state.workouts);
    },
    ADD_ALL(state, workouts) {
      state.workouts = [...state.workouts, ...workouts];
      localStorage[STORAGE_KEY] = JSON.stringify(state.workouts);
    },
  },

  actions: {
    load: function(context) {
      let storedWorkouts = localStorage[STORAGE_KEY];
      try{
        storedWorkouts = JSON.parse(storedWorkouts)
      }catch(error){
        storedWorkouts = []
        console.error("failed to load "+ storedWorkouts)
      }
      context.commit('SET', storedWorkouts)
    },
    create: function(context, item) {
      item.raster = item.points
      context.commit("ADD", item);
    },
  },

  getters: {
    all: (state) => {
      return state.workouts;
    },
  },
};
