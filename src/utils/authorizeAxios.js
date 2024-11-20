import axios from 'axios'
import { toast } from 'react-toastify'
import { interceptorLoadingElements } from '~/utils/formatters'

//Khởi tạo một đối tượng Axios (authorizedAxiosInstance) mục đích để custom và cấu hình chung cho dự án.
let authorizedAxiosInstance = axios.create({})
// Thời gian chờ tối đa của 1 request: để 10 phút
authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 10 // 10 minutes
//withCredentials: true: cho phép axios tự động gửi cookie trong môic request lên BE (phục vụ việc chúng ta sẽ lưu JWT tokens
//(refresh & access) vào trong httpOnly cookie của trình duyệt
authorizedAxiosInstance.defaults.withCredentials = true

//cấu hình intercerptor (Bộ đánh chặn vào giữa mọi request và response)
//interceptor request (can thiệp vào giữa những cái request api)
authorizedAxiosInstance.interceptors.request.use((config) => {
  //Kỹ thuật chặn spam click (xem kỹ moo tả ở file formatters chứa function)
  interceptorLoadingElements(true)

  return config
}, (error) => {
  // Do something with request error
  return Promise.reject(error)
})

//interceptor response (can thiệp vào giữa những cái response nhận về)
authorizedAxiosInstance.interceptors.response.use((response) => {
  //Kỹ thuật chặn spam click (xem kỹ mô tả ở file formatters chứa function)
  interceptorLoadingElements(false)

  return response
}, (error) => {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  //mọi mã http status code nằm ngoài khoảng 200-299 sẽ là error và sẽ rơi vao vào đây

  //Kỹ thuật chặn spam click (xem kỹ mô tả ở file formatters chứa function)
  interceptorLoadingElements(false)

  //xử lý tập trung phần hiển thị thông báo lỗi trả về từ mọi API ở đây (viết code một lần clean code)
  //console.log error ra là sẽ thấy cấu trúc data dẫn tới message lỗi như dưới đây
  let errorMessage = error?.message
  if (error?.response?.data?.message) {
    errorMessage = error?.response?.data?.message
  }
  //dùng toastify để hiển thị thông báo lỗi (ngoại trừ lỗi 410)- GONE phục vụ việc tự động refresh lại token
  if (error?.response?.status !== 410) {
    toast.error(errorMessage)
  }
  return Promise.reject(error)
})

export default authorizedAxiosInstance