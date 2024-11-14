//import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '~/App.jsx'
import CssBaseline from '@mui/material/CssBaseline'
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles'
import theme from '~/theme'

//Cau hinh react toastify
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

//Cau hinh material-ui-dialog
import { ConfirmProvider } from 'material-ui-confirm'

//cấu hình redux store
import { Provider } from 'react-redux'
import { store } from '~/redux/store'

//cấu hinh react-router DOM với BrowserRouter
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter basename='/'>
    <Provider store={store} >
      <CssVarsProvider theme={theme}>
        <ConfirmProvider defaultOptions={{
          allowClose: false,
          dialogProps: { maxWidth: 'xs' },
          confirmationButtonProps: {
            variant: 'contained',
            color: 'secondary'
          },
          cancellationButtonProps: {
            variant: 'contained',
            color: 'inherit'
          },
          buttonOrder: ['cancel', 'confirm']
        }}>
          <CssBaseline />
          <App />
          <ToastContainer position="bottom-right" theme="colored"/>
        </ConfirmProvider>
      </CssVarsProvider >
    </Provider>
  </BrowserRouter>
)

