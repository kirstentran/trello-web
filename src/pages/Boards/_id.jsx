import { useEffect, useState } from 'react'
import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
//import { mockData } from '~/apis/mock-data'
import { fetchBoardDetailsAPI, createNewColumnAPI, createNewCardAPI } from '~/apis'

function Board() {
  const [board, setBoard] = useState(null)

  useEffect(() => {
    //Tajm thời fix cứng boardId, sử dủnhj react-router-dom để lấy 
    //chuẩn boardId từ ỦRL về
    const boardId = '6715d538052c1ca0cb07f089'

    //Goi API o day, API can boardId
    fetchBoardDetailsAPI(boardId).then(board => {
      setBoard(board)
    })
  }, [])

  //Function nay co nhiem vu goi API tao moi column va lam lai du lieu state board
  const createNewColumn = async (newColumnData) => {
    const createdColumn = await createNewColumnAPI({
      ...newColumnData,
      boardId: board._id
    })

    console.log('createNewColumn', createdColumn)

    //CAp nhat lai state board
  }

  //Function nay co nhiem vu goi API tao moi card va lam lai du lieu state board
  const createNewCard = async (newCardData) => {
    const createdCard = await createNewCardAPI({
      ...newCardData,
      boardId: board._id
    })

    console.log('createNewColumn', createdCard)

    //CAp nhat lai state board
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
