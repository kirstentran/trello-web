//export const API_ROOT = 'http://localhost:8000'

let apiRoot = ''
if (process.env.BUILD_MODE === 'dev') {
  apiRoot = 'http://localhost:8000'
}
if (process.env.BUILD_MODE === 'production') {
  apiRoot = 'https://trello-api-zl6u.onrender.com'
}
export const API_ROOT = apiRoot