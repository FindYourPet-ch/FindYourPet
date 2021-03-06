import axios from "axios";
import { useCookies } from "vue3-cookies";

const {cookies} = useCookies();

axios.interceptors.request.use(function (config) {
    const token = cookies.get('token');
    if (token !== null) {
        config.headers.Authorization = `Bearer ${token.accessToken}`;
    }
    return config;
});


/***************** Token Management ********************/

export function memberIsConnected() {
    return cookies.isKey('token')
        && cookies.get('token') !== null
        && cookies.get('token') !== undefined;
}

export function getMemberConnectedEmail() {
    if(memberIsConnected()) {
        return cookies.get('token').email;
    }
}

export function getMemberConnectedId() {
    if(memberIsConnected()) {
        return cookies.get('token').id;
    }
}

export function destroyMemberToken() {
    cookies.set('token', null);
    cookies.remove('token');
}

/***************** Species ********************/

export async function getAllSpeciesFromLang(lang) {
    return axios.get(`${process.env.VUE_APP_ROOT_API}/species/${lang}`);
}

export async function getSpeciesByIdFromLang(id, lang) {
    return axios.get(`${process.env.VUE_APP_ROOT_API}/species/${lang}/id/${id}`);
}

/***************** Adverts ********************/


export async function getMemberAdverts(id, lang) {
    return axios.get(`${process.env.VUE_APP_ROOT_API}/adverts/${lang}/members/${getMemberConnectedId()}`);
}

export async function createAdvert(advertInformations) {
    return axios.post(`${process.env.VUE_APP_ROOT_API}/adverts`, advertInformations);
}

export async function updateAdvert(advertInformations) {
    return axios.put(`${process.env.VUE_APP_ROOT_API}/adverts`, advertInformations);
}

export async function deleteAdvert(id) {
    if(confirm('are you sure?')){
        return axios.delete(`${process.env.VUE_APP_ROOT_API}/adverts/${id}`)
            .then(result => {
                console.log(result.data);
            })
            .catch(error => {
                this.error = error;
            });
    }else{
        return null;
    }
}

export async function getPageAdverts(pageNum, lang) {
    return axios.get(`${process.env.VUE_APP_ROOT_API}/adverts/${lang}/page/${pageNum}`);
}

export async function getPageFilteredAdverts(pageNum, lang, filters) {
    return axios.post(`${process.env.VUE_APP_ROOT_API}/adverts/${lang}/filters/page/${pageNum}`, filters);
}

export async function getRecentAdverts(lang) {
    return axios.get(`${process.env.VUE_APP_ROOT_API}/adverts/${lang}/recent`);
}

export async function getAdvertById(id, lang) {
    return axios.get(`${process.env.VUE_APP_ROOT_API}/adverts/${lang}/id/${id}`);
}

export async function getAdvertsByMember(memberId, lang) {
    return axios.get(`${process.env.VUE_APP_ROOT_API}/adverts/${lang}/members/${memberId}`);
}
/***************** Authentification ********************/

export async function register(userInformations) {
    return axios.post(`${process.env.VUE_APP_ROOT_API}/auth/register`, userInformations);
}

export async function login(credentials) {
    return axios.post(`${process.env.VUE_APP_ROOT_API}/auth/login`, credentials)
        .then(result => {
            cookies.set('token', result.data);
            return result;
        });
}

/***************** Files ********************/

export async function getFileById(idFile) {
    return axios.get(`${process.env.VUE_APP_ROOT_API}/files/${idFile}`,{responseType: 'arraybuffer'});
}

export async function addFile(idAdvert, image) {
    var FormData = require('form-data');
    var data = new FormData();
    data.append('image', image);
    return axios.post(`${process.env.VUE_APP_ROOT_API}/files/adverts/${idAdvert}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
    });
}

/***************** Members ********************/

export async function getMemberByEmail(email) {
    return axios.get(`${process.env.VUE_APP_ROOT_API}/members/email/${email}`);
}

export async function updateMemberByEmail(memberInformations) {
    return axios.put(`${process.env.VUE_APP_ROOT_API}/members/`, memberInformations);
}

/***************** api3.geo.admin.ch ********************/

export async function getSwissAdress(addr) {
    return await axios
        .get(`https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=${addr}&type=locations`)
        .then((resp) => {
            return resp.data.results;
        });
}