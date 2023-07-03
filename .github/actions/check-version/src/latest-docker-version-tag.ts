import * as httpm from '@actions/http-client'
import * as am from '@actions/http-client/lib/auth'
import {TypedResponse} from '@actions/http-client/lib/interfaces'
import semverSort from 'semver/functions/rsort'
import satisfies from 'semver/functions/satisfies'

export interface LatestDockerVersionTagParams {
  username?: string
  password?: string
  owner: string
  repository: string
}

interface NonNullResult<T> {
  result: T
}

interface UnauthorizedErrorResponse {
  detail: string
}

interface ErrorResponse {
  errinfo: Record<string, string>
  message: string
}

interface TagsListResponse {
  results: ReadonlyArray<Tag>
}

interface Tag {
  last_updated: string
  name: string
}

interface TokenResponse {
  token: string
}

type AuthErrorResponse = UnauthorizedErrorResponse | ErrorResponse

type AuthResponse = TokenResponse | AuthErrorResponse

type TagResponse = TagsListResponse | ErrorResponse

export const latestDockerVersionTag = async ({
  username,
  password,
  owner,
  repository
}: LatestDockerVersionTagParams): Promise<string> => {
  if (someIsNull(username, password)) {
    throw new Error(
      'Both username and password must be specified, or none of them'
    )
  }
  const token =
    username != null && password != null
      ? await login(username, password)
      : undefined
  const tags = await getTags(owner, repository, token)
  const tag = findLatest(tags)
  return tag
}

async function login(username: string, password: string) {
  const http: httpm.HttpClient = new httpm.HttpClient()
  const resp = await http.postJson<AuthResponse>(
    'https://hub.docker.com/v2/users/login',
    {username, password}
  )

  if (isSuccess(resp) && isTokenResult(resp)) {
    return resp.result.token
  } else if (isSuccess(resp)) {
    throw new Error(
      'Error when trying to log in to dockerhub. Success result with unexpected body value' +
        JSON.stringify(resp.result)
    )
  } else {
    throw new Error(
      'Error when trying to log in to dockerhub.' + JSON.stringify(resp.result)
    )
  }
}

function isSuccess<T>(resp: TypedResponse<T>): boolean {
  return resp.statusCode === 200
}

function isTokenResult(
  resp: TypedResponse<AuthResponse>
): resp is TypedResponse<AuthResponse> & NonNullResult<TokenResponse> {
  return (
    resp.result != null && 'token' in resp.result && resp.result.token != null
  )
}

async function getTags(
  owner: string,
  repository: string,
  token: string = ''
): Promise<ReadonlyArray<Tag>> {
  const http: httpm.HttpClient = new httpm.HttpClient('http-client', [
    new am.BearerCredentialHandler(token)
  ])

  const resp = await http.getJson<TagResponse>(
    `https://hub.docker.com/v2/repositories/${owner}/${repository}/tags/?page_size=100`
  )
  if (isSuccess(resp) && isTagsResult(resp)) {
    return resp.result.results
  } else if (isSuccess(resp)) {
    throw new Error(
      'Error when trying to get image tags from dockerhub. Success result with unexpected body value' +
        JSON.stringify(resp.result)
    )
  } else {
    throw new Error(
      'Error when trying to get image tags from dockerhub.' +
        JSON.stringify(resp.result)
    )
  }
}

function isTagsResult(
  resp: TypedResponse<TagResponse>
): resp is TypedResponse<TagResponse> & NonNullResult<TagsListResponse> {
  return (
    resp.result != null &&
    'results' in resp.result &&
    resp.result.results != null
  )
}

function findLatest(tags: ReadonlyArray<Tag>): string {
  const fullVersions = tags.map(t => t.name).filter(t => satisfies(t, 'x.x.x'))
  const sorted = semverSort(fullVersions)
  const latest = sorted.shift()
  if (latest == null) {
    throw new Error(
      'Cannot find latest full version number within tags.' +
        JSON.stringify(tags, null, 1)
    )
  }
  return latest
}

function someIsNull(...args: unknown[]) {
  const nonNullElements = args.filter(it => it != null)
  return nonNullElements.length !== 0 && nonNullElements.length < args.length
}
