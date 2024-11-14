import { Routes, Route, Navigate } from 'react-router-dom'

import Board from '~/pages/Boards/_id'
import NotFound from '~/pages/404/NotFound'
import Auth from '~/pages/Auth/Auth'

function App() {
  return (
    <Routes>
      {/*Redirect Route */}
      <Route path = '/' element = {
        //ở đây cần replace giá trị true để nó thay thế route /, có thể hiểu là route / sẽ không còn nằm trong history của browser
        //Thực hành dễ hiểu hơn = cách nhấn Go Home rừ trang 404 xong thử quay lại = nút bavck của trình duyệt giữa 2 trương hợp
        //có hoặc k có replace
        <Navigate to = "/boards/6715d538052c1ca0cb07f089" replace ={true}/>
      }/>

      {/*Board Details */}
      <Route path = '/boards/:boardId' element = {<Board/> }/>

      {/*Authentication*/}
      <Route path = '/login' element = {<Auth/>}/>
      <Route path = '/register' element = {<Auth/>}/>

      {/*Page 404 NOT FOUND Route */}
      <Route path = '*' element = {<NotFound/>}/>
    </Routes>
  )
}

export default App

