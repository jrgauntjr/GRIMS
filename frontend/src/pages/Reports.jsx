import { Route, Routes } from 'react-router-dom'
import BuiltReports from '../components/BuiltReports'
import ReportCreate from '../components/ReportCreate'
import ReportDetail from '../components/ReportDetail'

function Reports() {
  return (
    <Routes>
      <Route index element={<BuiltReports />} />
      <Route path="new" element={<ReportCreate />} />
      <Route path=":slug" element={<ReportDetail />} />
    </Routes>
  )
}

export default Reports
