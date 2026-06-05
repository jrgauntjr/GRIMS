import { Route, Routes, useParams } from 'react-router-dom'
import BuiltReports from '../components/BuiltReports'
import ReportCreate from '../components/ReportCreate'
import ReportDetail from '../components/ReportDetail'

function ReportDetailRoute() {
  const { slug } = useParams()
  return <ReportDetail key={slug} />
}

function Reports() {
  return (
    <Routes>
      <Route index element={<BuiltReports />} />
      <Route path="new" element={<ReportCreate />} />
      <Route path=":slug" element={<ReportDetailRoute />} />
    </Routes>
  )
}

export default Reports
