import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import DashboardIcon from '@mui/icons-material/Dashboard'
import VpnLockIcon from '@mui/icons-material/VpnLock'
import AddToDriveIcon from '@mui/icons-material/AddToDrive'
import BoltIcon from '@mui/icons-material/Bolt'
import FilterListIcon from '@mui/icons-material/FilterList'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import { Tooltip } from '@mui/material'
import Button from '@mui/material/Button'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'

const MENU_STYLES = {
  color: 'white',
  backgroundColor: 'transparent',
  border: 'none',
  paddingX: '5px',
  borderRadius: '4px',
  '.MuiSvgIcon-root': {
    color:'white'
  },
  '&:hover': {
    bgColor: 'primary.50'
  }
}

function BoardBar() {
  return (
    <Box sx ={{
      width: '100%',
      height: (theme) => theme.trello.boardBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      paddingX: 2,
      overflowX: 'auto',
      backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#34495e': '#1976d2')
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Chip
          sx={MENU_STYLES}
          icon={<DashboardIcon />}
          label="KirstenTran MERN Stack Board"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<VpnLockIcon />}
          label="Public/Private Workspace"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<AddToDriveIcon />}
          label="Add to Google Drive"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<BoltIcon/>}
          label="Automation"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<FilterListIcon />}
          label="Filters"
          clickable
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<PersonAddIcon />}
          sx={{
            color: 'white',
            borderColor: 'white',
            '&: hover': { borderColor: 'white' }
          }}
        >Invite</Button>
        <AvatarGroup
          max={7}
          sx={{
            gap:'10px',
            '& .MuiAvatar-root': {
              width: 34,
              height: 34,
              fontSize: '16px',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              '&: first-of-type': {backgroundColor: '#a4b0be' }
            }
          }}
        >
          <Tooltip title ="KirstenTran" >
            <Avatar
              alt="KirstenTran"
              src="https://lh3.googleusercontent.com/a/ACg8ocIxiZcD01tJ5aUwlsCwJ3p-Gq8_ld2sXJVYn2QuZgo40h53ZOLZ=s288-c-no" />
          </Tooltip>
          <Tooltip title ="KirstenTran" >
            <Avatar
              alt="KirstenTran"
              src="https://th.bing.com/th/id/OIP.hiMmUETOF-W2CqLzAtrBhAHaE7?rs=1&pid=ImgDetMain" />
          </Tooltip>
          <Tooltip title ="KirstenTran" >
            <Avatar
              alt="KirstenTran"
              src="https://th.bing.com/th/id/R.7e1b23634e608c02128a7f094aaa8f53?rik=46Ji5O0jfVyfWg&pid=ImgRaw&r=0" />
          </Tooltip>
          <Tooltip title ="KirstenTran" >
            <Avatar
              alt="KirstenTran"
              src="https://i.pinimg.com/originals/6d/c0/a5/6dc0a5a69971c687f0c965c6fccde346.png" />
          </Tooltip>
          <Tooltip title ="KirstenTran" >
            <Avatar
              alt="KirstenTran"
              src="https://th.bing.com/th/id/OIP.8u18PqEZUJdWVJbvqMf2JQHaE9?rs=1&pid=ImgDetMain" />
          </Tooltip>
          <Tooltip title ="KirstenTran" >
            <Avatar
              alt="KirstenTran"
              src="https://th.bing.com/th/id/OIP.-d5TNTE2knLvk47mDigFsgHaJE?rs=1&pid=ImgDetMain" />
          </Tooltip>
          <Tooltip title ="KirstenTran" >
            <Avatar
              alt="KirstenTran"
              src="https://th.bing.com/th/id/OIP.-d5TNTE2knLvk47mDigFsgHaJE?rs=1&pid=ImgDetMain" />
          </Tooltip>
          <Tooltip title ="KirstenTran" >
            <Avatar
              alt="KirstenTran"
              src="https://th.bing.com/th/id/OIP.-d5TNTE2knLvk47mDigFsgHaJE?rs=1&pid=ImgDetMain" />
          </Tooltip>
        </AvatarGroup>
      </Box>
    </Box>
  )
}

export default BoardBar
