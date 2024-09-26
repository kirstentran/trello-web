import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sorts'

import {
  DndContext,
  //PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useEffect, useState } from 'react'


function BoardContent( { board }) {
  //Ask the mouse move 10px, the activate the event of drag and drop, fix the click the call the event
  // const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })
  //if use pointerSensor will have some bugs, we have to use with CSS attribute touchAction: 'none' in Column.jsx
  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } })

  //Hold for 250ms and move 500px, then activate the event of drag and drop
  const touchSensor = useSensor(TouchSensor, { activationConstraint: {
    delay: 250,
    tolerance: 500
  } })

  // const sensors = useSensors(pointerSensor)
  //prioritize mouseSensor and touchSensor combined to have the best experience for users, no bugs
  const sensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumns, setOrderedColumns] = useState([])

  useEffect(() => {
    setOrderedColumns( mapOrder(board?.columns, board?.columnOrderIds, '_id') )
  }, [board])

  const handleDragEnd = (event) => {
    //console.log('handleDragEnd: ', event)
    const { active, over } = event

    //if there is no over, just drop nowhere, return
    if (!over) return

    //if the active column is different from the over column
    if (active.id !== over.id) {
      // Find index of the old column from active
      const oldIndex = orderedColumns.findIndex(c => c._id === active.id)
      // Find index of the new position from over
      const newIndex = orderedColumns.findIndex(c => c._id === over.id)
      //dndOrderedColumns is the new column after drag and drop
      //Use arrayMove to sort the array Columns at first
      const dndOrderedColumns = arrayMove(orderedColumns, oldIndex, newIndex)

      // const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
 
      //Hai dong console log sau dung de xu ly du lieu goi API
      // // console.log( 'dndOrderedColumns: ', dndOrderedColumns)
      // // console.log( 'dndOrderedColumnsIds: ', dndOrderedColumnsIds)

      //update the new column after drag and drop
      setOrderedColumns(dndOrderedColumns)
    }
  }
  return (
    <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
      <Box sx={{
        backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#34495e': '#1976d2'),
        width: '100%',
        height: (theme) => theme.trello.boardContentHeight,
        p: '10px 0'
      }}>
        <ListColumns columns ={orderedColumns} />
      </Box>
    </DndContext>
  )
}

export default BoardContent
