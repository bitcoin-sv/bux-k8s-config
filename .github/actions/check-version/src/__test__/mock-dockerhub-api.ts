import {rest} from 'msw'
import * as constants from './constants'
import * as tagsResponse from './example-tags-response.json'
import {setupServer} from 'msw/node'

export const mockDockerhubApi = (handlers = defaultHandlers) => {
  return setupServer(...handlers)
}

export const defaultHandlers = [
  // Handles a POST /login request
  rest.post('https://hub.docker.com/v2/users/login', async (req, res, ctx) => {
    const body = await req.json()
    if (!body?.username || !body?.password) {
      return res(
        ctx.status(400),
        ctx.json({errinfo: {}, message: 'malformed request'})
      )
    }

    const {username, password} = body

    if (username !== constants.username || password != constants.password) {
      return res(
        ctx.status(401),
        ctx.json({detail: 'Incorrect authentication credentials'})
      )
    }

    return res(ctx.status(200), ctx.json({token: constants.token}))
  }),

  // Handles a GET /tags for private repository request
  rest.get(
    `https://hub.docker.com/v2/repositories/${constants.owner}/${constants.privateRepository}/tags/`,
    async (req, res, ctx) => {
      const authHeader = req.headers.get('Authorization')

      if (authHeader !== `Bearer ${constants.token}`) {
        return res(
          ctx.status(404),
          ctx.json({
            message: 'httperror 404: object not found',
            errinfo: {
              namespace: '4chainstudio',
              repository: 'bux-server'
            }
          })
        )
      }

      return res(ctx.status(200), ctx.json(tagsResponse))
    }
  ),

  // Handles a GET /tags for public repository request
  rest.get(
    `https://hub.docker.com/v2/repositories/${constants.owner}/${constants.publicRepository}/tags/`,
    async (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(tagsResponse))
    }
  )
]
