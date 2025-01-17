import Vue from "../plugins/resource";
import Cookies from "js-cookie";
import {
  API_SERVER,
  UserResource,
} from "../plugins/resource";
import { obj2slug } from "../plugins/utils";

const userLoginUrl = API_SERVER + "/api/user/login";
const currentUserUrl = API_SERVER + "/api/user/current";
const userRegisterUrl = API_SERVER + "/api/user/register/";

// const userResetPasswordRequestUrl = API_SERVER + "/user/resetpassword/";
// const userResetPasswordSubmitUrl = API_SERVER + "/user/resetpasswordsubmit/";

function md5(str){
  return CryptoJS.MD5(str).toString();
}

function createLink(obj){
  obj.link = {name:"account", params:{slug:obj2slug(obj, 'full_name')}}
  obj.fullName = `${obj.firstName} ${obj.lastName}`
  obj.imageUrl = `https://www.gravatar.com/avatar/${md5(obj.email)}`
  return obj
}

export default {
  namespaced: true,

  state: {
    current: null,
    items: {},
    itemsDetail: {},

  },

  mutations: {
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

    SET_CURRENT(state, item){
      if(!!item)
        state.current = createLink(item)
      else
        state.current = null
    }
  },

  actions: {
    load: async function (context, payload={}) {
      context.dispatch('loadCurrent')
      return;
      if (Array.isArray(payload)){
        // Ids provided, get detailed information on given pids
        let ids = payload
        let items = await Promise.all(ids.map(id => UserResource.get({id})))
        items = items.map(i => i.body)
        context.commit("ADD_DETAIL", items)

      }else{
        // await context.dispatch("loadCurrent")
        // No ids provided, just get list of all
        let params = payload.params || {}
        let query = {...params}

        let response = (await UserResource.get(query)).body
        let items = response.userDetails

        // Iteratively get all pages
        let next = response.next
        while(next){
          response = (await Vue.http.get(next)).body
          items = [...items, ...response.results]
          next = response.next
        }

        context.commit("ADD", items)
      }
    },

    loadCurrent: async function (context) {
      try{
        let response = (await Vue.http.get(currentUserUrl)).body
        console.log(response)
        context.commit('SET_CURRENT', response)
      }catch(error){
        // User not logged in
        context.commit('SET_CURRENT', null)
        Cookies.remove('authorization')
      }
      // let user = response
      // context.commit("SET_CURRENT", user);

      // for(let user of users){
      //   if(user.userId == currentUserId){
      //     context.commit("SET_CURRENT", user);
      //   }
      // }

      // try{
        // let id = Cookies.get('user_id')
        // let response = await UserResource.get({id})
        // let user = response.body
        // user.is_administrator = user.groups.indexOf(2) >= 0;
        // context.commit("SET_CURRENT", user);
        // context.commit("ADD_DETAIL", [user]);
      // catch(err){
      //   // no auth
      //   console.log("Authentication not found. User not logged in")
      //   Cookies.remove('authorization')
      //   context.commit("SET_CURRENT", null)
      // }
    },

    login: async function (context, credentials) {
        let user = (await Vue.http.post(userLoginUrl, credentials)).body
        let token = user.token
        Cookies.set('authorization', token, { expires: 365 })
        context.commit("SET_CURRENT", user)

        // Not needed since login returns entire user
        // await context.dispatch("loadCurrent");
    },

    logout: async function (context) {
      // await Vue.http.get(userLogoutUrl);
      Cookies.remove('authorization')
      Cookies.remove('user_id')
      context.commit("SET_CURRENT", null)
    },

    // updateCurrent: async function(context, user){
    //   let changed = (await UserResource.update({id:user.id}, user)).body
    //   context.commit("SET_CURRENT", changed)
    //   return changed
    // },

    register: async function(context, newUser){
      // await Vue.http.get(userRegisterUrl, {params: {...newUser}});
      // let response = await Vue.http.post(userRegisterUrl, newUser, { emulateJSON: true })
      let response = await UserResource.save(newUser)
      context.commit("SET_CURRENT", response.body)
      // return response.body
    }
  },

  getters: {
    all: state => {
      return Object.values(state.items)
    },

    get: state =>{
      return ( id ) => (state.items[id] || {})
    },

    detail: state =>{
      return ( id ) => state.itemsDetail[id]
    },

    current: state => {
      return state.current || createLink({
        id: -1,
        first_name: "Anonymous",
        last_name: "",
        email: ""
      });
    },

    isLoggedIn: state => {
      return state.current != null;
    },

  }
};
