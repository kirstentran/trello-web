import { useEffect, useState } from 'react'
import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
//import { mockData } from '~/apis/mock-data'
import { fetchBoardDetailsAPI, createNewColumnAPI, createNewCardAPI } from '~/apis'
import { generatePlaceHolderCard } from '~/utils/formatters'
import { isEmpty } from 'lodash'


function Board() {
  const [board, setBoard] = useState(null)

  useEffect(() => {
    //Tajm thời fix cứng boardId, sử dụng react-router-dom để lấy
    //chuẩn boardId từ ỦRL về
    const boardId = '6715d538052c1ca0cb07f089'

    //Goi API o day, API can boardId
    fetchBoardDetailsAPI(boardId).then(board => {
      //Khi f5 trang, can xử lý vấn đề kéo thả vào một column rỗng
      board.columns.forEach(column => {
        //Cần xử lý vấn đề kéo thả vào một column rỗng (video 37.2)
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceHolderCard(column)]
          column.cardOrderIds = [generatePlaceHolderCard(column)._id]
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
    const columnToUpdate = newBoard.columns.find(column => column._id === newCardData.columnId)
    if (columnToUpdate) {
      columnToUpdate.cards.push(createdCard)
      columnToUpdate.cardOrderIds.push(createdCard._id)
    }
  }


  return (
    <Container disableGutters maxWidth ={false} sx={{ height: '100vh' }}>
      <AppBar />
      <BoardBar board ={board}/>
      <BoardContent
        board ={board}
        createNewColumn ={createNewColumn}
        createNewCard ={createNewCard}
      />
    </Container>
  )
}

export default Board
