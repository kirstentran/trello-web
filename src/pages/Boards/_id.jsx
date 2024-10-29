import { useEffect, useState } from 'react'
import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
import { mapOrder } from '~/utils/sorts'
//import { mockData } from '~/apis/mock-data'
import {
  fetchBoardDetailsAPI,
  createNewColumnAPI,
  createNewCardAPI,
  updateBoardDetailsAPI,
  updateColumnDetailsAPI,
  moveCardToDifferentColumnAPI,
  deleteColumnDetailsAPI
} from '~/apis'
import { generatePlaceHolderCard } from '~/utils/formatters'
import { isEmpty } from 'lodash'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { Typography } from '@mui/material'
import { toast } from 'react-toastify'


function Board() {
  const [board, setBoard] = useState(null)

  useEffect(() => {
    //Tajm thời fix cứng boardId, sử dụng react-router-dom để lấy
    //chuẩn boardId từ ỦRL về
    const boardId = '6715d538052c1ca0cb07f089'

    //Goi API o day, API can boardId
    fetchBoardDetailsAPI(boardId).then(board => {
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

      setBoard(board)
    })
  }, [])

  //Function nay co nhiem vu goi API tao moi column va lam lai du lieu state board
  const createNewColumn = async (newColumnData) => {
    const createdColumn = await createNewColumnAPI({
      ...newColumnData,
      boardId: board._id
    })

    //Khi tạo column mới thì chưa có card, cần xử lý về vấn đề kéo thả trong một column rỗng
    createdColumn.cards = [generatePlaceHolderCard(createdColumn)]
    createdColumn.cardOrderIds = [generatePlaceHolderCard(createdColumn)._id]

    //CAp nhat lai state board
    //Chúng ta tự làm đúng lại state data board (thay vì phải gọi lại API fetchBoardDetailsAPI)
    const newBoard = { ...board }
    newBoard.columns.push(createdColumn)
    newBoard.columnOrderIds.push(createdColumn._id)
    setBoard(newBoard)
  }

  //Function nay co nhiem vu goi API tao moi card va lam lai du lieu state board
  const createNewCard = async (newCardData) => {
    const createdCard = await createNewCardAPI({
      ...newCardData,
      boardId: board._id
    })


    //CAp nhat lai state board
    //Chúng ta tự làm đúng lại state data board (thay vì phải gọi lại API fetchBoardDetailsAPI)
    //Tuong tu nhu createNewColumn
    const newBoard = { ...board }
    //Tim ra column chua no truoc roi moi cap nhat lai mang cards va cardOrderIds
    const columnToUpdate = newBoard.columns.find(column => column._id === createdCard.columnId)
    if (columnToUpdate) {
      //Nếu column chưa có card nào thì xóa đi card place holder, vì bản chất làm FE cho column đang chứa 1 PLACEHOLDER
      if (columnToUpdate.cards.some(card => card.FE_PlaceholderCard)) {
        columnToUpdate.cards = [createdCard]
        columnToUpdate.cardOrderIds = [createdCard._id]
      } else {
        columnToUpdate.cards.push(createdCard)
        columnToUpdate.cardOrderIds.push(createdCard._id)
      }
    }

    setBoard(newBoard)
  }

  //Function này có nhiệm vụ gọi API va xun ly khi keo tha column xong xuoi
  const moveColumns = (dndOrderedColumns) => {
    //Update cho chuẩn dữ liệu state board
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    setBoard(newBoard)

    //Goi API update board
    updateBoardDetailsAPI(newBoard._id, { columnOrderIds: dndOrderedColumnsIds })
  }

  //FUnction nay có nhiệm vụ gọi API va xử lý khi kéo thả card trong cùng một column
  const moveCardInTheSameColumn =(dndOrderedCards, dndOrderedCardIds, columnId) => {
    //GOi API Update column
    const newBoard = { ...board }
    const columnToUpdate = newBoard.columns.find(column => column._id ===columnId)
    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderedCards
      columnToUpdate.cardOrderIds = dndOrderedCardIds
    }
    setBoard(newBoard)

    //Goi API update column
    updateColumnDetailsAPI( columnId, { cardOrderIds: dndOrderedCardIds })
  }

  // video 73 comment dai
  const moveCardToDifferentColumn = (currentCardId, prevColumnId, nextColumnId, dndOrderedColumns) => {
    //Update cho chuẩn dữ liệu state board
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    setBoard(newBoard)

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

  //Xu ly xoa 1 column va card ben trong no
  const deleteColumnDetails = (columnId) => {
    //update chuản dữ liệu state board
    const newBoard = { ...board }
    newBoard.columns = newBoard.columns.filter(c => c._id !== columnId)
    newBoard.columnOrderIds = newBoard.columnOrderIds.filter(_id => _id !== columnId)
    setBoard(newBoard)

    //gọi api xư lý phía backend
    deleteColumnDetailsAPI(columnId).then(res => {
      toast.success(res?.deleteResult)
      console.log('🚀 ~ deleteColumnDetailsAPI ~ res:', res)
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

        createNewColumn ={createNewColumn}
        createNewCard ={createNewCard}
        moveColumns ={moveColumns}
        moveCardInTheSameColumn={moveCardInTheSameColumn}
        moveCardToDifferentColumn={moveCardToDifferentColumn}
        deleteColumnDetails={deleteColumnDetails}
      />
    </Container>
  )
}

export default Board
