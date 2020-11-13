import request from '@/utils/request'

export function getGroups(query) {
  return request({
    url: '/groups',
    method: 'get',
    params: query
  })
}

export function createGroups(data) {
  return request({
    url: '/groups',
    method: 'post',
    data
  })
}
