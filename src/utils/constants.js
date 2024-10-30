//export const API_ROOT = 'http://localhost:8000'

let apiRoot = ''
if (process.env.NODE_ENV === 'dev') {
  apiRoot = 'http://localhost:8000'
}
if (process.env.NODE_ENV === 'production') {
  apiRoot = 'https://trello-api-zl6u.onrender.com'
}
export const API_ROOT = apiRoot