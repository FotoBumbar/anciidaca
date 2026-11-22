import server from '../dist/server/server.js'

export default {
  fetch(request) {
    return server.fetch(request)
  },
}
