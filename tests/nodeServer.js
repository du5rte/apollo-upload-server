import http from 'http'
import util from 'util'

import { processRequest } from '../src'

const options = {
  uploadDir: __dirname,
  keepExtensions: true
}

export default http.createServer((req, res) => {
  processRequest(req, options)
    .then(operations => {
      res.writeHead(200)
      res.end(util.inspect(operations))
    })
    .catch(error => {
      res.writeHead(500)
      res.end(util.inspect(error))
    })
})
