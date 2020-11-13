import request from '@/utils/request'

export function getFiles(query) {
  return request({
    url: '/files',
    method: 'get',
    params: query
  })
}

export function createDir(data) {
  return request({
    url: '/files/createDir',
    method: 'post',
    data
  })
}

export function updateFiles(data) {
  return request({
    url: '/files',
    method: 'put',
    data
  })
}

export function deleteFiles(data) {
  return request({
    url: '/files',
    method: 'delete',
    data
  })
}

export function createFiles(data, config) {
  return request({
    url: '/files',
    method: 'post',
    data,
    config
  })
}

export function moveFiles(data) {
  return request({
    url: '/files/move',
    method: 'post',
    data
  })
}
