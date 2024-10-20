import { useEffect, useState } from 'react'
import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
import { mockData } from '~/apis/mock-data'
import { fetchBoardDetailsAPI } from '~/apis'

function Board() {
  const [board, setBoard] = useState(null)

  useEffect(() => {
    //Tajm thời fix cứng boardId, sử dủnhj react-router-dom để lấy 
    //chuẩn boardId từ ỦRL về
    const boardId = '612f6f9a5d7c8e2e1c7b6e6d'

    //Goi API o day, API can boardId
    fetchBoardDetailsAPI(boardId).then(board => {
      setBoard(board)
    })
      .catch(error => {
        console.log('error:', error)
      })
  }, [])

  return (
    <Container disableGutters maxWidth ={false} sx={{ height: '100vh' }}>
      <AppBar />
      <BoardBar board ={board}/>
      <BoardContent board ={board}/>
    </Container>
  )
}

export default Board
