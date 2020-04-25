import Cookies from 'js-cookie'

import Vue from "vue";
import Router from "vue-router";
import Meta from 'vue-meta'

import Home from "./views/Home.vue";
import Login from "./views/Login.vue";
import Error404 from "./views/error/404.vue";

Vue.use(Router);
Vue.use(Meta);

const router = new Router({
    mode: 'history',
    scrollBehavior (to, from, savedPosition) {
        // Scroll to top on any route changes
        if (savedPosition) return savedPosition
        return { x: 0, y: 0 }
    },
    routes: [
        {
            path: "/login",
            name: "login",
            component: Login,
        },
        {
            path: "/reset-password",
            name: "reset-password",
            component: () => import( /* webpackChunkName: "reset-password" */ "./views/account/ResetPassword.vue"),
        },
        {
            path: "/register",
            name: "register",
            component: () => import( /* webpackChunkName: "register" */ "./views/Register.vue"),
        },
        {
            path: "/",
            name: "home",
            component: Home,
        },
        {
            path: "/about-us",
            name: "about",
            component: () => import( /* webpackChunkName: "about" */ "./views/About.vue")
        },
        // {
        //     path: "/about-us/terms-of-service",
        //     name: "terms-of-service",
        //     component: () => import( /* webpackChunkName: "terms-of-service" */ "./views/about/TermsOfService.vue")
        // },
        // {
        //     path: "/about-us/legal-notice",
        //     name: "legal-notice",
        //     component: () => import( /* webpackChunkName: "legal-notice" */ "./views/about/LegalNotice.vue")
        // },
        // {
        //     path: "/about-us/privacy-policy",
        //     name: "privacy-policy",
        //     component: () => import( /* webpackChunkName: "privacy-policy" */ "./views/about/PrivacyPolicy.vue")
        // },
        // {
        //     path: "/about-us/cookie-policy",
        //     name: "cookie-policy",
        //     component: () => import( /* webpackChunkName: "cookie-policy" */ "./views/about/CookiePolicy.vue")
        // },
        // ======= SEARCH =======
        // {
        //     path: "/search",
        //     name: "search",
        //     component: () => import( /* webpackChunkName: "search" */ "./views/Search.vue")
        // },
        // ======= ACCOUNT ROUTES =======
        {
            path: "/account/workouts",
            name: "workout-list",
            component: () => import( /* webpackChunkName: "workout-list" */ "./views/account/Account.vue"),
            meta: {requiresAuth: true}
        },
        {
            path: "/account/workout/new",
            name: "workout-create",
            component: () => import( /* webpackChunkName: "workout-create" */ "./views/account/WorkoutCreate.vue"),
            // meta: {requiresAuth: true}
        },
        {
            path: "/account",
            name: "account",
            component: () => import( /* webpackChunkName: "account" */ "./views/account/Account.vue"),
            meta: {requiresAuth: true}
        },
        // ======= ADMINISTRATIVE ROUTES =======
        // {
        //     path: "/administration/",
        //     name: "administration",
        //     component: () => import( /* webpackChunkName: "administration" */ "./views/admin/Administration.vue"),
        //     meta: {requiresAuth: true}
        // },
        // ======= Catch-ALL Error =======
        {
            path: "*",
            name: "404",
            component: Error404,
        }
    ]
});


router.beforeEach((to, from, next) => {
    if(to.matched.some(record => record.meta.requiresAuth)) {
        // For a route marked as "requiresAuth", perform a check
        let hasAuth = Cookies.get("authorization") != null

        if (!hasAuth) {
            // Redirect to login
            console.log("force login for route")
            next({
                name: 'login',
                query: { redirect: to.fullPath }
            })
        } else {
            next()
        }

    }

    next()

})


export default router;
