import server from './nodeServer'
import upload from './upload'

const PORT = 1337
const serverURL = `http://localhost:${PORT}`

describe('nodeServer', () => {
  test('processRequest', async () => {
    expect.assertions(1)

    server.listen(PORT)

    try {
      const result = await upload(serverURL)

      expect(result).toMatchSnapshot();
    } catch (error) {
      console.error(error.message)
    } finally {
      server.close()
    }
  })
})
