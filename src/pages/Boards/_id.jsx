import { useEffect } from 'react'
import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
//import { mockData } from '~/apis/mock-data'

import {
  updateBoardDetailsAPI,
  updateColumnDetailsAPI,
  moveCardToDifferentColumnAPI
} from '~/apis'
import { cloneDeep } from 'lodash'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { Typography } from '@mui/material'
import {
  fetchBoardDetailsAPI,
  updateCurrentActiveBoard,
  selectCurrentActiveBoard
} from '~/redux/activeBoard/activeBoardSlice'
import { useDispatch, useSelector } from 'react-redux'

function Board() {
  const dispatch = useDispatch()
  //Không dùng state của component mà chuyển qua dùng state của Redux
  // const [board, setBoard] = useState(null)
  const board = useSelector(selectCurrentActiveBoard)

  useEffect(() => {
    //Tajm thời fix cứng boardId, sử dụng react-router-dom để lấy
    //chuẩn boardId từ ỦRL về
    const boardId = '6715d538052c1ca0cb07f089'

    //Goi API o day, API can boardId
    dispatch(fetchBoardDetailsAPI(boardId))
  }, [dispatch])


  //Function này có nhiệm vụ gọi API va xun ly khi keo tha column xong xuoi
  const moveColumns = (dndOrderedColumns) => {
    //Update cho chuẩn dữ liệu state board
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
    // Trường hợp dùng Spread Operator (Shallow Copy)lại k có lỗi, vì k dùng push như trên làm thay đổi trực tiếp kiểu mở rộng mảng, mà chỉ đang gán lại 
    // toàn bộ gtri columns và columnsOrderIds bằng 2 mảng mới. Tương tự như cachs làm concast ở trg hợp createColumn
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    // setBoard(newBoard)
    dispatch(updateCurrentActiveBoard(newBoard))

    //Goi API update board
    updateBoardDetailsAPI(newBoard._id, { columnOrderIds: dndOrderedColumnsIds })
  }

  //FUnction nay có nhiệm vụ gọi API va xử lý khi kéo thả card trong cùng một column
  const moveCardInTheSameColumn =(dndOrderedCards, dndOrderedCardIds, columnId) => {
    //GOi API Update column
    //Cannot assign to read only property 'cards' of object '#<Object>'
    //Trường hợp Immutability ở đây đã đụng tới gtri của cards đang đc coi là chỉ đọc read-only (nested object - can thiệp sâu dữ liệu)
    //const newBoard = { ...board }
    const newBoard = cloneDeep(board)
    const columnToUpdate = newBoard.columns.find(column => column._id ===columnId)
    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderedCards
      columnToUpdate.cardOrderIds = dndOrderedCardIds
    }
    //setBoard(newBoard)
    dispatch(updateCurrentActiveBoard(newBoard))

    //Goi API update column
    updateColumnDetailsAPI( columnId, { cardOrderIds: dndOrderedCardIds })
  }

  // video 73 comment dai
  const moveCardToDifferentColumn = (currentCardId, prevColumnId, nextColumnId, dndOrderedColumns) => {
    //Update cho chuẩn dữ liệu state board
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
    //Tương tự xử lý chỗ hàm moveColumns nên sẽ k ảnh hưởng Redux Toolkit Immutability gì ở dây cả
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    //setBoard(newBoard)
    dispatch(updateCurrentActiveBoard(newBoard))

    //Goi API xu ly phia backend
    let prevCardOrderIds = dndOrderedColumns.find(c => c._id === prevColumnId)?.cardOrderIds
    //Xu lý vấn đề khi kéo thả card cuối cùng và để lại một column rỗng, cần xóa place holder card trc khi gửi lên BE
    if (prevCardOrderIds[0].includes('placeholder-card')) {
      prevCardOrderIds = []
    }

    moveCardToDifferentColumnAPI({
      currentCardId,
      prevColumnId,
      prevCardOrderIds,
      nextColumnId,
      nextCardOrderIds: dndOrderedColumns.find(c => c._id === nextColumnId)?.cardOrderIds
    })
  }

  if (!board) {
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        width: '100vw',
        height: '100vh'
      }}>
        <CircularProgress />
        <Typography>Loading Board...</Typography>
      </Box>
    )
  }

  return (
    <Container disableGutters maxWidth ={false} sx={{ height: '100vh' }}>
      <AppBar />
      <BoardBar board ={board}/>
      <BoardContent
        board ={board}

        //3 trường hợp move dưới đây sẽ giữ nguyên vì để code xử lý kéo thả phần BoardContent k quá dài mất kiểm soát khi đọc code, maintain
        moveColumns ={moveColumns}
        moveCardInTheSameColumn={moveCardInTheSameColumn}
        moveCardToDifferentColumn={moveCardToDifferentColumn}

      />
    </Container>
  )
}

export default Board
