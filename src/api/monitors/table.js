import request from '@/utils/request'

export function getURLStatus(query) {
  return request({
    url: '/monitors/getURLStatus',
    method: 'get',
    params: query
  })
}

export function getMonitors(query) {
  return request({
    url: '/monitors',
    method: 'get',
    params: query
  })
}

export function createMonitors(data) {
  return request({
    url: '/monitors',
    method: 'post',
    data
  })
}

export function deleteMonitors(id) {
  return request({
    url: '/monitors/' + id,
    method: 'delete'
  })
}

export function getNodeStatus() {
  return request({
    url: '/monitors/getNodeStatus',
    method: 'get'
  })
}
