import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data,
    baseURL: process.env.VUE_APP_USER_API
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get'
    // params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

export function getUsers(query) {
  return request({
    url: '/user',
    method: 'get',
    params: query
  })
}

export function createUsers(data) {
  return request({
    url: '/user',
    method: 'post',
    data
  })
}

export function updateUsers(id) {
  return request({
    url: '/user/' + id,
    method: 'put'
  })
}

export function deleteUsers(id) {
  return request({
    url: '/user/' + id,
    method: 'delete'
  })
}

export function updatePassword(data) {
  return request({
    url: '/user/updatePassword',
    method: 'put',
    data
  })
}
