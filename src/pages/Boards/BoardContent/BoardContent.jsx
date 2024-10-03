import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sorts'

import {
  DndContext,
  //PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners,
  closestCenter,
  pointerWithin,
  rectIntersection,
  getFirstCollision
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useEffect, useState, useCallback, useRef } from 'react'
import { cloneDeep, over } from 'lodash'

import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}
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

  //At the same time, only either card or column can be dragged
  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState(null)

  //Diem va cham cuoi cung (Xu ly thuat toan phat hien va cham), video 37
  const lastOverId = useRef(null)

  useEffect(() => {
    setOrderedColumns( mapOrder(board?.columns, board?.columnOrderIds, '_id') )
  }, [board])
  //find a column by cardId
  const findColumnByCardId = (cardId) => {
    //làm dữ liệu cho hoàn chỉnh r, cập nhật ngược lại state, r chúng ta mới tạo ra cardOrderIds mới
    return orderedColumns.find(column => column?.cards?.map(card => card._id)?.includes(cardId))
  }
  //When start dragging (trigger), we have to know the active item id, type and data
  const handleDragStart = (event) => {
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current)

    //if drag card, we do actions to set the value for oldColumn
    if (event?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id))
    }
  }

  //Trigger when dragging over
  const handleDragOver = (event) => {
    //Do nothing if dragging Column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return

    //if drag card, we do more things to drag card to another column
    //console.log('handleDragOver: ', event)
    const { active, over } = event

    //Make sure if there is no over, or active (drag out of the container box) just return (do nothing)
    if (!active || !over) return

    //activeDraggingCard: is a Dragging Card
    const { id: activeDraggingCardId, data: { current:activeDraggingCardData } } = active
    //overCard: is a Card that we are interacting with above or below the dragged card
    const { id: overCardId } = over

    //Find 2 columns based on cardId
    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)

    //If there is no activeColumn or overColumn, just return (do nothing), avoid crashing web
    if (!activeColumn || !overColumn) return

    //logic process when dragging card to another column, if in the same column, do nothing
    //This just when dragging (handleDragOver), when done dragging, it will be handled in handleDragEnd
    if (activeColumn._id !== overColumn._id) {
      setOrderedColumns (prevColumns => {
        //find the index of the overCard in the destination column (when card is dragged to)
        const overCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId)

        //logical calculation the new cardIndex (above or below the overCard)
        //Take the source code of the primitive library
        let newCardIndex
        const isBelowOverItem = active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height
        const modifier = isBelowOverItem ? 1 : 0

        newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1

        //Clone array old orderedColumnsState into a new one to process data then return,
        // and update the new orderedColumnsState
        const nextColumns = cloneDeep (prevColumns)
        const nextActiveColumn = nextColumns.find(column => column._id === activeColumn._id)
        const nextOverColumn = nextColumns.find(column => column._id === overColumn._id)

        //Old column
        if (nextActiveColumn) {
          //Remove card from the active column (aka old column), the moment when drag card out
          //of that column into a new column
          nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)

          //update the new array cardOrderIds for correct data
          nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
        }

        //New column
        if (nextOverColumn) {
          //check if the dragging card exists in the overColumn, if yes, delete it first
          nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDraggingCardId)

          //Next, insert the dragging card into overColumn (based on newCardIndex)
          nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, activeDraggingCardData)

          //update the new array cardOrderIds for correct data
          nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)
        }

        console.log('nextColumns: ', nextColumns)
        return nextColumns
      })
    }
  }

  //When end dragging (drop), we have to know the active item id, type and data
  const handleDragEnd = (event) => {

    //Make sure if there is no over, or active (drag out of the container box) just return (do nothing)
    //Avoiding page crashing
    const { active, over } = event

    //if there is no over and no active, just drop nowhere, return
    if (!active || !over ) return

    //xu ly keo the card
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      //activeDraggingCard: is a Dragging Card
      const { id: activeDraggingCardId, data: { current:activeDraggingCardData } } = active
      //overCard: is a Card that we are interacting with above or below the dragged card
      const { id: overCardId } = over

      //Find 2 columns based on cardId
      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)

      //If there is no activeColumn or overColumn, just return (do nothing), avoid crashing web
      if (!activeColumn || !overColumn) return

      //kéo qua 2 columns khác nhau
      //Phải dùng tới activeDragItemData.columnId or oldColumnWhenDraggingCard._id (set vào state từ bước handleDragStart), 
      //chứ k phải activeData trong scope handleDragEnd này vì sau khi đi qua onDragOver tới đây là state của card 
      //dã bị updated một lần rồi
      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        //
      }
      else {
        //Drag drop card in the same column

        // Get index of the old column from oldColumnWhenDraggingCard
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(c => c._id === activeDragItemId)
        // Find index of the new position from over
        const newCardIndex = overColumn?.cards?.findIndex(c => c._id === overCardId)

        //use arrayMove to keo card trong 1 cai column ti tuong tu logic cua keo column trong mot
        //cai boardContent
        const dndOrderedCards = arrayMove(oldColumnWhenDraggingCard?.cards, oldCardIndex, newCardIndex)

        setOrderedColumns(prevColumns => {
        //Clone array old orderedColumnsState into a new one to process data then return,
        // and update the new orderedColumnsState
          const nextColumns = cloneDeep (prevColumns)

          //Find the column that we want to drag
          const targetColumn = nextColumns.find(column => column._id === overColumn._id)

          //Update 2 new values: cards and cardOrderIds in the targetColumn
          targetColumn.cards = dndOrderedCards
          targetColumn.cardOrderIds = dndOrderedCards.map(card => card._id)

          //Tra ve gia tri state moi chuan vi tri
          return nextColumns
        })
      }
    }

    //xu ly keo tha column trong 1 cai boardContent
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
    //if the active column is different from the over column
      if (active.id !== over.id) {
        // Find index of the old column from active
        const oldColumnIndex = orderedColumns.findIndex(c => c._id === active.id)
        // Find index of the new position from over
        const newColumnIndex = orderedColumns.findIndex(c => c._id === over.id)
        //dndOrderedColumns is the new column after drag and drop
        //Use arrayMove to sort the array Columns at first

        const dndOrderedColumns = arrayMove(orderedColumns, oldColumnIndex, newColumnIndex)

        //Hai dong console log sau dung de xu ly du lieu goi API
        // // console.log( 'dndOrderedColumns: ', dndOrderedColumns)
        // // console.log( 'dndOrderedColumnsIds: ', dndOrderedColumnsIds)

        //update the new column after drag and drop
        setOrderedColumns(dndOrderedColumns)
      }
    }

    //the data after drag and drop, always have been reset to null
    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumnWhenDraggingCard(null)
  }

  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active:{ opacity: '0.5' } } })
  }

  //chúng ta sẽ custom laị chiến lược/ thuật toán phát hiện va chạm tối ưu cho việc kéo thả card giữ nhiều 
  //columns (video 37 fix bug important)
  // args = arguments = Các đối số, tham số
  const collisionDetectionStrategy = useCallback((args) => {

    //Truong hop keo column thi dung thuat toan closestCorners la chuan nhat
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      return closestCorners ({ ...args })
    }

    //Tim cac diem giao nhau va cham voi con tro
    //Disable Eslint la dc
    const pointerIntersections = pointerWithin (args)

    //Thuat toan phat hien va cham se tra ve mot mang cac va cham o day
    const intersections = !!pointerIntersections?.length
      ? pointerIntersections
      : rectIntersection(args)

    //Tim overId dau tien trong dam intersection o tren, dung let dee sau nay co the ghi de lai dc gia tri
    let overId = getFirstCollision(intersections, 'id')

    if (overId ) {
      //Video 37 de fix doan flickering bug.
      //Neu cai over no la column thi se tim toi cai cardId gan nhat ben trong khu vuc
      //va cham do dua vao thuat toan phat hien va cham closestCenter hoac closestCorners deu dc.
      //Tuy nhien dung closestCenter se muot ma hon
      const checkColumn = orderedColumns.find(column => column._id === overId)
      if (checkColumn) {
        //console.log('overId before: ', overId)

        overId = closestCenter ({
          ...args,
          droppableContainers: args.droppableContainers.filter(container => {
            return (container.id !== overId) && (checkColumn?.cardOderIds?.includes(container.id))
          })
        })[0]?.id
        //console.log('overId after: ', overId)
      }

      lastOverId.current = overId
      return [{ id: overId }]
    }

    //Neu overId la null thi tra ve mang rong, tranh bug crash trang
    return lastOverId.current ? [{ id: lastOverId.current }] : []
  }, [activeDragItemType, orderedColumns])

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      //Sensor explained in video 30
      sensors={sensors}

      //Thuat toan phat hien va xu ly va cham( neu k co no thi card va cover lon se k keo qua dc column khac)
      //vi luc nay no dang bi conflict giua card va column, we use closestCorners instead of closestCenter
      //update video 37: neu chi dung closestCorners se co bug flickering + sai lech du lieu
      //fixed in video 37
      //collisionDetection={closestCorners}

      //Tu custom nang cao thuat toan phat hien va cham (video fic bug so 37)
      collisionDetection={collisionDetectionStrategy}
    >
      <Box sx={{
        backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#34495e': '#1976d2'),
        width: '100%',
        height: (theme) => theme.trello.boardContentHeight,
        p: '10px 0'
      }}>
        <ListColumns columns ={orderedColumns} />
        <DragOverlay dropAnimation={customDropAnimation}>
          {(!activeDragItemType) && null }
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) && <Column column = {activeDragItemData}/>}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) && <Card card = {activeDragItemData}/>}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent
