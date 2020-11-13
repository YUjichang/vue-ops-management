import request from '@/utils/request'

export function getHosts(query) {
  return request({
    url: '/hosts',
    method: 'get',
    params: query
  })
}

export function createHosts(data) {
  return request({
    url: '/hosts',
    method: 'post',
    data
  })
}

export function updateHosts(id, data) {
  return request({
    url: '/hosts/' + id,
    method: 'put',
    data
  })
}

export function deleteHosts(id) {
  return request({
    url: '/hosts/' + id,
    method: 'delete'
  })
}

export function importHosts(data, config) {
  return request({
    url: '/hosts/import',
    method: 'post',
    data,
    config
  })
}

export function getURL(query) {
  return request({
    url: '/hosts/getURL',
    method: 'get',
    params: query
  })
}
