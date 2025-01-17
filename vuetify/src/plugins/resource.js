import Vue from "vue"
import VueResource from "vue-resource";

import Cookies from "js-cookie";
Vue.use(VueResource);

export const API_SERVER = process.env.VUE_APP_API_SERVER

// Disable cookie credentials for cross-domain
// Vue.http.options.credentials = false;

// Setup VueResource to work with DRF Token Auth
Vue.http.interceptors.push(function(request) {
  let token = Cookies.get('authorization')
  if(token){
    request.headers.set('Authorization', `Bearer ${token}`);
  }
});

// Add patch method to API resources
const PATCH =  {patch: {method: "PATCH"}, update: {method: "PATCH"}}

export const UserResource                 = Vue.resource(API_SERVER + "/api/user{/id}", {}, PATCH);
export const WorkoutResource              = Vue.resource(API_SERVER + "/api/workout{/id}", {}, PATCH);

// export const ProjectResource              = Vue.resource(API_SERVER + "/v1/projects{/id}/", {}, PATCH);
// export const ProjectPhaseResource         = Vue.resource(API_SERVER + "/v1/projectphases{/id}/", {}, PATCH);
// export const ProjectAtPhaseResource       = Vue.resource(API_SERVER + "/v1/projectatphases{/id}/", {}, PATCH);
// export const KnowledgeAreaResource        = Vue.resource(API_SERVER + "/v1/knowledgeareas{/id}/", {}, PATCH);
// export const ParticipationResource        = Vue.resource(API_SERVER + "/v1/participations{/id}/", {}, PATCH);
// export const StructureResource            = Vue.resource(API_SERVER + "/v1/structures{/id}/", {}, PATCH);
// export const StructureValidationResource  = Vue.resource(API_SERVER + "/v1/structures/validations{/id}/", {}, PATCH);
// export const CollaborationResource        = Vue.resource(API_SERVER + "/v1/collaborations{/id}/", {}, PATCH);

// export const ProjectEvaluationsResource   = Vue.resource(API_SERVER + "/v1/eval/project{/id}/", {}, PATCH);
// export const EvaluationResource           = Vue.resource(API_SERVER + "/v1/eval/evaluations{/id}/", {}, PATCH);
// export const EvaluationQuestionsResource  = Vue.resource(API_SERVER + "/v1/eval/questions{/id}/", {}, PATCH);
// export const EvaluationResponsesResource  = Vue.resource(API_SERVER + "/v1/eval/responses{/id}/", {}, PATCH);
// export const QuestionResource             = Vue.resource(API_SERVER + "/v1/question{/id}/", {}, PATCH);
// export const ResponseResource             = Vue.resource(API_SERVER + "/v1/response{/id}/", {}, PATCH);
// export const SearchResource               = Vue.resource(API_SERVER + "/v1/search?term={term}");

export default Vue
