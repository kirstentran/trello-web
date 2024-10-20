import axios from 'axios'
import { API_ROOT } from '~/utils/constants'

//Giải thích vì sao không có try catch 15:08 video số 61
//Bat buoc phai la get 
export const fetchBoardDetailsAPI = async (boardId) => {
  const response = await axios.get(`${API_ROOT}/v1/boards/${boardId}`)
  //Axios sẽ trả kết quả về thông qua property của nó là data
  return response.data
}