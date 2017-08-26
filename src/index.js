import mkdirp from 'mkdirp'
import formidable from 'formidable'
import objectPath, { get, set } from 'object-path'

// References

// Anatomy of a multipart form
// http://derpturkey.com/node-multipart-form-data-explained/

// Comparisson of multipart form parsers
// https://stackoverflow.com/questions/23717879/how-could-i-upload-files-in-expressjs-4-x/23718166#23718166

// How formidable Parses file uploads at 500 mb/s
// http://debuggable.com/posts/parsing-a-form-in-node-js-1:4b0bff13-4244-4ebc-8455-4975cbdd56cb

export function processRequest(request, options = {}) {
  const form = formidable.IncomingForm(options)

  // customize the multipart stream
  // handle fields that are not files
  // skip handle files stream
  form.onPart = function(part) {
    if (!part.filename) {
      // let formidable handle all non-file parts
      form.handlePart(part)
    } else {
      // emit files as stream to this.parse
      this.emit('file', part.name, part)
    }
  }

  // Parse the multipart form request
  return new Promise((resolve, reject) => {
    form.parse(request, (error, fields, files) => {
      try {
        if (error) throw error

        // Decode the GraphQL operation(s). This is an array if batching is
        // enabled.
        const operations = JSON.parse(fields.operations)

        // Check if files were uploaded
        if (Object.keys(files).length) {
          // File field names contain the original path to the File object in the
          // GraphQL operation input variables. Relevent data for each uploaded
          // file now gets placed back in the variables.
          Object.entries(files).forEach(([fieldname, file]) => {
            // pull the metadata sent with the operation within variables
            const meta = get(operations, fieldname)

            if (meta) {
              // add metadata do file
              set(file, 'size', meta.size)
              set(file, 'headers.length', meta.size)
              set(file, 'name', file.filename)
              set(file, 'type', file.mime)

              // overwrite variable metadata with file stream
              set(operations, fieldname, file)
            }
          })
        }

        // Provide fields for replacement request body
        resolve(operations)
      } catch (error) {
        reject(error)
      }
    })
  })
}

export function apolloUploadKoa(options) {
  return async function(ctx, next) {
    // Skip if there are no uploads
    if (ctx.request.is('multipart/form-data'))
      ctx.request.body = await processRequest(ctx.req, options)
    await next()
  }
}

export function apolloUploadExpress(options) {
  return (request, response, next) => {
    // Skip if there are no uploads
    if (!request.is('multipart/form-data')) return next()
    processRequest(request, options).then(body => {
      request.body = body
      next()
    })
  }
}
