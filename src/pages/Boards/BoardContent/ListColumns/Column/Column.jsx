import { useState } from 'react'
import { toast } from 'react-toastify'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import ContentCut from '@mui/icons-material/ContentCut'
import ContentCopy from '@mui/icons-material/ContentCopy'
import ContentPaste from '@mui/icons-material/ContentPaste'
import Cloud from '@mui/icons-material/Cloud'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Tooltip from '@mui/material/Tooltip'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import AddCardIcon from '@mui/icons-material/AddCard'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import ListCards from './ListCards/ListCards'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'
import { useConfirm } from 'material-ui-confirm'
import { createNewCardAPI, deleteColumnDetailsAPI } from '~/apis'
import {
  updateCurrentActiveBoard,
  selectCurrentActiveBoard
} from '~/redux/activeBoard/activeBoardSlice'
import { useDispatch, useSelector } from 'react-redux'
import { cloneDeep } from 'lodash'

function Column( { column }) {

  const dispatch = useDispatch()
  const board = useSelector(selectCurrentActiveBoard)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column._id,
    data: { ...column }
  })
  const dndKitColumnStyles = {
    // touchAction: 'none', //For sensitive touch screen (PointerSensor)
    //use CSS Transform like docs will happen some bugs as stretch bug
    transform: CSS.Translate.toString(transform),
    transition,
    //Height has to be 100% to fix the bug of dragging short column to long column
    //Avoid flickering, but set listener to avoid moving the blue part
    //Listener ust be inside the Box, not the div (video32)
    height: '100%',
    opacity: isDragging ? 0.5 : undefined
  }

  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event) => {setAnchorEl(event.currentTarget)}
  const handleClose = () => setAnchorEl(null)

  //column đã đc sx ở component cha cao nhất, video 71
  const orderedCards = column.cards

  const [openNewCardForm, setOpenNewCardForm] = useState(false)
  const toggleOpenNewCardForm = () => setOpenNewCardForm(!openNewCardForm)

  const [newCardTitle, setNewCardTitle] = useState('')

  const addNewCard = async () => {
    if (!newCardTitle) {
      toast.error('Please enter card title!', { position: 'bottom-right' })
      return
    }
    //Tao du lieu card de goi API
    const newCardData = {
      title: newCardTitle,
      columnId: column._id
    }

    //goi API tao moi card va lam lai du lieu state board
    const createdCard = await createNewCardAPI({
      ...newCardData,
      boardId: board._id
    })


    //CAp nhat lai state board
    //Chúng ta tự làm đúng lại state data board (thay vì phải gọi lại API fetchBoardDetailsAPI)
    //Tuong tu nhu createNewColumn nên dùng cloneDeep

    const newBoard = cloneDeep(board)
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

    // setBoard(newBoard)
    dispatch(updateCurrentActiveBoard(newBoard))

    //Dong lai trang thai them Card moi & clear input
    toggleOpenNewCardForm()
    setNewCardTitle('')
  }

  //XỬ lý xóa 1 column và cards bên trong nó
  const confirmDeleteColumn = useConfirm()
  const handleDeleteColumn = () => {
    confirmDeleteColumn({
      title: 'Delete this column?',
      description: 'This action will permanently delete your column and cards inside it! Are you sure?',
      confirmationText: 'Yes, delete it!',
      cancellationText: 'No, keep it!',

      //content: 'test',
      // allowClose: false,
      // dialogProps: { maxWidth: 'xs' },
      // confirmationButtonProps: {
      //   variant: 'contained',
      //   color: 'secondary'
      // },
      // cancellationButtonProps: {
      //   variant: 'contained',
      //   color: 'inherit'
      // },
      //description: 'phaỉ nhập chữ kirstentran mới đc confirm (confirm mới sáng lên)'
      //confirmationKeyword: 'kirstentran'
      // buttonOrder: ['cancel', 'confirm']
    })
      .then(() => {
        //update chuản dữ liệu state board

        //Tương tự xử lý chỗ hàm moveColumns nên sẽ k ảnh hưởng Redux Toolkit Immutability gì ở dây cả
        const newBoard = { ...board }
        // filter trong JS cũng tạo ra mảng mới (gióng array.concat), nên k ảnh hưởng gì đến Redux Toolkit Immutability
        newBoard.columns = newBoard.columns.filter(c => c._id !== column._id)
        newBoard.columnOrderIds = newBoard.columnOrderIds.filter(_id => _id !== column._id)
        //setBoard(newBoard)
        dispatch(updateCurrentActiveBoard(newBoard))

        //gọi api xư lý phía backend
        deleteColumnDetailsAPI(column._id).then(res => {
          toast.success(res?.deleteResult)
        })
      })
      .catch(() => {})
  }

  return (
    <div ref ={setNodeRef} style = {dndKitColumnStyles}{...attributes}>
      <Box
        {...listeners}
        sx={{
          minWidth: '300px',
          maxWidth: '300px',
          backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#333643' : '#ebecf0'),
          ml: 2,
          borderRadius: '6px',
          height: 'fit-content',
          maxHeight: (theme) => `calc(${theme.trello.boardContentHeight} - ${theme.spacing(5)})`
        }}
      >
        {/*Box Column Header*/}
        <Box sx={{
          height: (theme) => theme.trello.columnHeaderHeight,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6" sx = {{
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            {column?.title}
          </Typography>
          <Box>
            <Tooltip title = "More Options" >
              <ExpandMoreIcon
                sx={{ color: 'text.primary', cursor: 'pointer' }}
                id="basic-column-dropdown"
                aria-controls={open ? 'basic-menu-column-dropdown' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}/>
            </Tooltip>
            <Menu
              id="basic-menu-column-dropdown"
              anchorEl={anchorEl}
              open={open}
              onClose={ handleClose }
              onClick= { handleClose }
              MenuListProps={{
                'aria-labelledby': 'basic-column-dropdown'
              }}
            >
              <MenuItem
                onClick ={toggleOpenNewCardForm}
                sx = {{
                  '&:hover': {
                    color: 'success.light',
                    '& .add-card-icon': { color: 'success.light' }
                  }
                }}
              >
                <ListItemIcon><AddCardIcon className='add-card-icon' fontSize="small" /></ListItemIcon>
                <ListItemText>Add new card</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon><ContentCut fontSize="small" /></ListItemIcon>
                <ListItemText>Cut</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon><ContentCopy fontSize="small" /></ListItemIcon>
                <ListItemText>Copy</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon><ContentPaste fontSize="small" /></ListItemIcon>
                <ListItemText>Paste</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem
                onClick ={handleDeleteColumn}
                sx = {{
                  '&:hover': {
                    color: 'warning.dark',
                    '& .delete-forever-icon': { color: 'warning.dark' }
                  }
                }}
              >
                <ListItemIcon><DeleteForeverIcon className="delete-forever-icon" fontSize="small" /></ListItemIcon>
                <ListItemText>Delete this column</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon><Cloud fontSize="small" /></ListItemIcon>
                <ListItemText>Archive this column</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/*Box List Cards*/}
        <ListCards cards = {orderedCards} />

        {/*Box Column Footer*/}
        <Box sx={{
          height:(theme) => theme.trello.columnFooterHeight,
          p: 2
        }}>
          {!openNewCardForm
            ? <Box sx = {{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Button startIcon={<AddCardIcon />} onClick ={toggleOpenNewCardForm}> Add new card</Button>
              <Tooltip title ="Drag to move">
                <DragHandleIcon sx={{ cursor:'pointer' }} />
              </Tooltip>
            </Box>
            : <Box sx= {{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <TextField
                label="Enter card title..."
                type="text"
                size="small"
                variant ="outlined"
                autoFocus
                data-no-dnd ="true"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                sx={{
                  '& label': { color: 'text.primary' },
                  '& input': {
                    color: (theme) => theme.palette.primary.main,
                    backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#333643' : 'white')
                  },
                  '& label.Mui-focused': { color: (theme) => theme.palette.primary.main },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor:(theme) => theme.palette.primary.main },
                    '&:hover fieldset': { borderColor: (theme) => theme.palette.primary.main },
                    '&.Mui-focused fieldset': { borderColor:(theme) => theme.palette.primary.main }
                  },
                  '& .MuiOutlinedInput-input': {
                    borderRadius: 1
                  }
                }}
              />
              <Box sx ={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  className= "interceptor-loading"
                  data-no-dnd ="true"
                  onClick = {addNewCard}
                  variant = "contained" color='success' size='small'
                  sx ={{
                    boxShadow: 'none',
                    border: '0.5px solid',
                    borderColor: (theme) => theme.palette.success.main,
                    '&:hover': { backgroundColor: (theme) => theme.palette.success.main }
                  }}

                >Add</Button>
                <CloseIcon
                  fontSize='small'
                  sx={{
                    color: { color: (theme) => theme.palette.warning.light },
                    cursor: 'pointer'
                    // '&:hover' :
                  }}
                  onClick ={toggleOpenNewCardForm}
                />
              </Box>
            </Box>
          }
        </Box>
      </Box>
    </div>
  )
}

export default Column