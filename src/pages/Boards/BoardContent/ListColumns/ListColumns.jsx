import { useState } from 'react'
import { toast } from 'react-toastify'
import Box from '@mui/material/Box'
import Column from './Column/Column'
import Button from '@mui/material/Button'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'


function ListColumns({ columns, createNewColumn, createNewCard}) {
  const [openNewColumnForm, setOpenNewColumnForm] = useState(false)
  const toggleOpenNewColumnForm = () => setOpenNewColumnForm(!openNewColumnForm)

  const [newColumnTitle, setNewColumnTitle] = useState('')
  const addNewColumn = async () => {
    if (!newColumnTitle) {
      toast.error('Please enter column title!', { position: 'bottom-left' })
      return
    }
    // console.log('Adding new column with title:', newColumnTitle)
    //goi API de tao column moi o day...
    const newColumnData ={
      title: newColumnTitle
    }

    await createNewColumn(newColumnData)

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
        {columns?.map( column => <Column key = {column._id} column ={column} createNewCard = {createNewCard} /> )}

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

