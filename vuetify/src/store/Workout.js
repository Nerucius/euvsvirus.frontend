import Vue from "../plugins/resource";
import { WorkoutResource } from "../plugins/resource";
// import { cloneDeep } from "lodash";
// import { obj2slug } from "@/plugins/utils";

const Resource = WorkoutResource

export function createLink(obj){
  // obj.link = {name:"project-detail", params:{slug:obj2slug(obj)}}
  // obj.image_url = obj.image_url || "https://app.inspiresproject.com/img/static/project.jpg"
  return obj
}

export default {
  namespaced: true,

  state: {
    items: {},
    itemsDetail: {},

    sports: [
      {value:"RUNNING",             name: "models.sport.running"},
      {value:"CYCLING",             name: "models.sport.cycling"},
      {value:"SKATING",             name: "models.sport.skating"},
      {value:"PARK_WITH_KIDS",      name: "models.sport.parkWithKids"},
      {value:"WALK_THE_DOG",        name: "models.sport.walkTheDog"},
      {value:"OTHER",               name: "models.sport.other"},
    ],

  },

  mutations: {
    SET(state, items){
      let newItems = {}
      items.map(createLink).forEach(i => {newItems[i.id] = i})
      state.items = {...newItems}
    },

    ADD(state, items){
      let newItems = {}
      items.map(createLink).forEach(i => {newItems[i.id] = i})
      state.items = { ...state.items, ...newItems}
    },

    ADD_DETAIL(state, items) {
      let newItems = {}
      items.map(createLink).forEach(i => {newItems[i.id] = i})
      state.itemsDetail = { ...state.itemsDetail, ...newItems }
    },

    CLEAR(state){
      state.items = []
      state.itemsDetail = []
    },

    DELETE(state, id){
      delete state.items[id]
      delete state.itemsDetail[id]
    }
  },

  actions: {
    load: async function (context, payload={}) {
      if (Array.isArray(payload)){
        // Ids provided, get detailed information on given pids
        let ids = payload
        let items = await Promise.all(ids.map(id => Resource.get({id})))
        items = items.map(i => i.body)
        context.commit("ADD_DETAIL", items)

      }else{
        // No ids provided, just get list of all
        let params = payload.params || {}
        // Disabled since ordering will be hammered by dictionary
        // let query = {ordering: "-modified_at", ...params}
        let query = {...params}

        let response = (await Resource.get(query)).body
        let items = response.results

        // Iteratively get all pages
        // let next = response.next
        // while(next){
        //   response = (await Vue.http.get(next)).body
        //   items = [...items, ...response.results]
        //   next = response.next
        // }

        context.commit("SET", items)
      }
    },

    search: async function (context, params) {
      let query = {ordering: "-modified_at", ...params}

      let response = (await Resource.get(query)).body
      let items = response.results

      // Iteratively get all pages
      let next = response.next
      while(next){
        response = (await Vue.http.get(next)).body
        items = [...items, ...response.results]
        next = response.next
      }

      return items.map(createLink)
    },

    clear: function(context, _){
      context.commit("CLEAR")
    },

    create: async function (context, object){
      let newItem = (await Resource.save(object)).body
      // await context.dispatch("load", [newItem.id])
      return newItem
    },

    update: async function (context, object){
      let updatedItem = (await Resource.update({id:object.id}, object)).body
      context.commit("ADD_DETAIL", [updatedItem])
      return updatedItem
    },

    delete: async function (context, id){
      let result = (await Resource.delete({id}))
      context.dispatch("delete", id)
      return result
    },
  },

  getters: {
    all: state => {
      return Object.values(state.items)
    },

    get: state =>{
      return ( id ) => state.items[id] || {}
    },

    detail: state =>{
      return ( id ) => state.itemsDetail[id] || {}
    },

    sports: state => state.sports,
  }
};
