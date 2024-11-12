import { useState } from 'react'
import { toast } from 'react-toastify'
import Box from '@mui/material/Box'
import Column from './Column/Column'
import Button from '@mui/material/Button'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { createNewColumnAPI } from '~/apis'
import { generatePlaceHolderCard } from '~/utils/formatters'
import {
  updateCurrentActiveBoard,
  selectCurrentActiveBoard
} from '~/redux/activeBoard/activeBoardSlice'
import { useDispatch, useSelector } from 'react-redux'
import { cloneDeep } from 'lodash'


function ListColumns({ columns }) {

  const dispatch = useDispatch()
  const board = useSelector(selectCurrentActiveBoard)

  const [openNewColumnForm, setOpenNewColumnForm] = useState(false)
  const toggleOpenNewColumnForm = () => setOpenNewColumnForm(!openNewColumnForm)

  const [newColumnTitle, setNewColumnTitle] = useState('')

  const addNewColumn = async () => {
    if (!newColumnTitle) {
      toast.error('Please enter column title!', { position: 'bottom-left' })
      return
    }

    //goi API de tao column moi o day...
    const newColumnData ={
      title: newColumnTitle
    }

    //goi API tao moi column va lam lai du lieu state board
    const createdColumn = await createNewColumnAPI({
      ...newColumnData,
      boardId: board._id
    })

    //Khi tạo column mới thì chưa có card, cần xử lý về vấn đề kéo thả trong một column rỗng
    createdColumn.cards = [generatePlaceHolderCard(createdColumn)]
    createdColumn.cardOrderIds = [generatePlaceHolderCard(createdColumn)._id]

    //CAp nhat lai state board
    //FE chúng ta tự làm đúng lại state data board (thay vì phải gọi lại API fetchBoardDetailsAPI)
    //Tùy Dự án, nếu BE làm thì FE k cân cần phải làm
    // __________0.0____________
    //Đoạn này sẽ dính lỗi object is not extensible, dù đã copy/clone ra giá trị newBoard nhưng bản chất của spread operator
    //là Shallow Copy/Clone, nên dính phải rules Immutability trong Redux Tôlkit không dùng đc hàm PUSH( sửa giá trị mảng trực tiếp), cách
    //đơn giản nhanh gọn nhất ở trg hợp này là dùng tơi Deep Copy/Clone toàn bộ cái Board cho dễ hiểu và code ngắn gọn

    //const newBoard = { ...board }
    //sao chép toàn bô dữ liệu của board ra một địa chỉ ô nhớ mới, nên k lo lắng j đến dữ liệu cũ nên chỉnh sửa thoải mái, còn nếu dùng spread operator (shallow copy) 
    // (... board) thì sẽ dính vào rule của Redux là k đc bất biến dữ liệu (Immutability)
    const newBoard = cloneDeep(board)
    newBoard.columns.push(createdColumn)
    newBoard.columnOrderIds.push(createdColumn._id)

    /*
    Ngoài ra, c2: vẫn có thể dùng array.concat thay cho push như docs của Redux Toolkit ở trên, vì push sẽ thay đổi giá tị mảng trực tiếp, còn concat thì sẽ marge - ghép 
    mảng lại và tạp ra 1 mảng mới để chúng ta gán lại gtri nền mà vẫn sẽ k bị gì
    concat thì tạo ra mảng mới bằng cách merge mảng, còn push thì thay đổi trực tiếp gtri của array đó

    const newBoard = { ...board }
    newBoard.columns = newBoard.columns.concat([createdColumn])
    newBoard.columnOrderIds = newBoard.columnOrderIds.concat([createdColumn._id])
    */

    //Cập nhật dữ liệu board vào trong Redux store
    dispatch(updateCurrentActiveBoard(newBoard))

    //Dong lai trang thai them column moi & clear input
    toggleOpenNewColumnForm()
    setNewColumnTitle('')
  }

  return (
    /*Long comment video 30 */
    <SortableContext items ={columns?.map(c => c._id)} strategy={horizontalListSortingStrategy}>
      <Box sx ={{
        backgroundColor: 'inherit',
        width: '100%',
        height: '100%',
        display: 'flex',
        overflowX: 'auto',
        overflowY: 'hidden',
        '&::-webkit-scrollbar-track': { m: 2 }
      }}>
        {columns?.map( column =>
          <Column key = {column._id} column ={column} />
        )}

        {/*Box Add new Column CTA*/}
        {!openNewColumnForm
          ? <Box onClick = {toggleOpenNewColumnForm} sx ={{
            minWidth:'250px',
            maxWidth: '250px',
            mx: 2,
            borderRadius: '6px',
            height: 'fit-content',
            backgroundColor: '#ffffff3d'
          }}>
            <Button
              startIcon ={ <NoteAddIcon /> }
              sx ={{
                color: 'white',
                width: '100%',
                justifyContent: 'flex-start',
                pl: 2.5,
                py: 1
              }}
            >
              Add new Column
            </Button>
          </Box>
          :<Box sx={{
            minWidth: '250px',
            maxWidth: '250px',
            mx: 2,
            p: 1,
            borderRadius: '6px',
            height: 'fit-content',
            backgroundColor: '#ffffff3d',
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}>
            <TextField
              label="Enter column title..."
              type="text"
              size="small"
              variant ="outlined"
              autoFocus
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              sx={{
                '& label': { color: 'white' },
                '& input': { color: 'white' },
                '& label.Mui-focused': { color: 'white' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor:'white' },
                  '&:hover fieldset': { borderColor: 'white' },
                  '&.Mui-focused fieldset': { borderColor:'white' }
                }
              }}
            />
            <Box sx ={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                onClick = {addNewColumn}
                variant = "contained" color='success' size='small'
                sx ={{
                  boxShadow: 'none',
                  border: '0.5px solid',
                  borderColor: (theme) => theme.palette.success.main,
                  '&:hover': { backgroundColor: (theme) => theme.palette.success.main }
                }}

              >Add Column</Button>
              <CloseIcon
                fontSize='small'
                sx={{
                  color: 'white',
                  cursor: 'pointer',
                  '&:hover' : { color: (theme) => theme.palette.warning.light }
                }}
                onClick ={toggleOpenNewColumnForm}
              />
            </Box>
          </Box>
        }
      </Box>
    </SortableContext>
  )
}

export default ListColumns

