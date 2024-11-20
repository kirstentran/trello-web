import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'
import { mapOrder } from '~/utils/sorts'
import { generatePlaceHolderCard } from '~/utils/formatters'
import { isEmpty } from 'lodash'

//KHởi tạo giá trị của 1 cái slice trong redux
const initialState = {
  currentActiveBoard: null
}
//Các hành động gọi api (bất đông bộ) và cập nhật dữ liệu vào Redux, dùng MiddleWare createAsyncThunk đi kèm với extraReducers
export const fetchBoardDetailsAPI = createAsyncThunk(
  'activeBoard/fetchBoardDetailsAPI',
  async (boardId) => {
    const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/boards/${boardId}`)
    //Axios sẽ trả kết quả về thông qua property của nó là data
    return response.data
  }
)

//Khởi tạo 1 slice trong kho lưu tữ Redux Store
export const activeBoardSlice = createSlice({
  name: 'activeBoard',
  initialState,
  //Reducers: Nơi xử lý dữ liệu đồng bộ
  reducers: {
    //Lưu ý: Luôn luôn cần 1 cặp ngoặc nhọn cho funtion trong reducers cho dù code bên trong là 1 dòng, đây là rule của Redux
    updateCurrentActiveBoard: (state, action) => {
      //Action payload chính là response.data trả về ở trên
      const board = action.payload

      //Xử lý dữ liệu nếu cần thiết ...
      // Update lại dữ liệu của curentActiveBoard
      state.currentActiveBoard = board
    }
  },
  //ExtraReducers: Nơi xử lý dữ liệu bất đồng bộ
  extraReducers: ( builder ) => {
    builder.addCase(fetchBoardDetailsAPI.fulfilled, (state, action) => {
      // Update lại dữ liệu của curentActiveBoard
      let board = action.payload

      //sap xep thu tự các column luôn trươc ở đây trước khi đưa dữ liệu xuống bên dưới các component con
      board.columns = mapOrder(board.columns, board.columnOrderIds, '_id')

      board.columns.forEach(column => {
        //Cần xử lý vấn đề kéo thả vào một column rỗng (video 37.2)
        //Khi f5 trang, can xử lý vấn đề kéo thả vào một column rỗng
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceHolderCard(column)]
          column.cardOrderIds = [generatePlaceHolderCard(column)._id]
        }
        else {
          //sắp xếp thứ tự các card luôn ở đây trước khi đưa dữ liệu xuống bên dưới các component con
          column.cards = mapOrder(column.cards, column.cardOrderIds, '_id')
        }
      })


      // Update lại dữ liệu của curentActiveBoard
      state.currentActiveBoard = board
    })
  }
})

// action là nơi dành cho các component bên dưới gọi bằng dispatch() tới nó để cập nhật lại dữ liệu thông qua reducer (chạy dồng bộ)
//để ý ở trên thì k thâý properties actions đâu cả, bởi vì những cái actions này đơn giản là đc thằng Redux tạo tự động theo tên của reducer nhé

export const { updateCurrentActiveBoard } = activeBoardSlice.actions

//selectors: Là nơi dành cho các components bên dưới gọi bằng hook useSelector() để lấy dữ liệu từ Redux Store ra sử dụng
export const selectCurrentActiveBoard = state => {
  return state.activeBoard.currentActiveBoard
}

//file này tên là activeBoardSlice nhưng mà chúng ta sẽ export một thứ tên là Reducer, LƯU Ý
// export default activeBoardSlice.reducer

export const activeBoardReducer = activeBoardSlice.reducer