import { createSlice } from '@reduxjs/toolkit'

//KHởi tạo giá trị của 1 cái slice trong redux
const initialState = {
  currentActiveBoard: null
}

//Khởi tạo 1 slice trong kho lưu tữ Redux Store
export const activeBoardSlice = createSlice({
  name: 'activeBoard',
  initialState,
  //Reducers: Nơi xử lý dữ liệu đồng bộ
  reducers: {
    //Lưu ý: Luôn luôn cần 1 cặp ngoặc nhọn cho funtion trong reducers cho dù code bên trong là 1 dòng, đây là rule của Redux
    updateCurrentActiveBoard: (state, action) => {
      //Action payload là chuẩn dặt tên nhận dữ liệu vào reducer, ở đây chúng ta gắn nó ra một biến có ý nghĩa hơn
      const fullBoard = action.payload

      //xử lý dữ liệu nếu cần thiết


      // Update lại dữ liệu của curentActiveBoard
      state.currentActiveBoard = fullBoard
    }
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