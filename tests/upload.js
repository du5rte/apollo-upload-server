import fs from "fs"
import request from 'request-promise-native'

export default function(url) {
  return request.post({
    url,
    formData: {
      operations: fs.readFileSync(__dirname + '/operations.json'),
      'variables.avatar': {
        value:  fs.createReadStream(__dirname + '/avatar.gif'),
        options: {
          filename: 'avatar.gif',
          contentType: 'image/gif'
        }
      }
    }
  })
}
