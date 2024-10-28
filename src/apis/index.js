import axios from 'axios'
import { API_ROOT } from '~/utils/constants'

//Giải thích vì sao không có try catch 15:08 video số 61
//Bat buoc phai la get

//BOARDS
export const fetchBoardDetailsAPI = async (boardId) => {
  const response = await axios.get(`${API_ROOT}/v1/boards/${boardId}`)
  //Axios sẽ trả kết quả về thông qua property của nó là data
  return response.data
}
export const updateBoardDetailsAPI = async (boardId, updateData) => {
  const response = await axios.put(`${API_ROOT}/v1/boards/${boardId}`, updateData)
  //Axios sẽ trả kết quả về thông qua property của nó là data
  return response.data
}

//COLUMNS
export const createNewColumnAPI = async (newColumnData) => {
  const response = await axios.post(`${API_ROOT}/v1/columns`, newColumnData)
  return response.data
}

export const updateColumnDetailsAPI = async (columnId, updateData) => {
  const response = await axios.put(`${API_ROOT}/v1/columns/${columnId}`, updateData)
  //Axios sẽ trả kết quả về thông qua property của nó là data
  return response.data
}

//CARDS
export const createNewCardAPI = async (newCardData) => {
  const response = await axios.post(`${API_ROOT}/v1/cards`, newCardData)
  return response.data
}