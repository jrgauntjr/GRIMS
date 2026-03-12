import { useState, useEffect } from 'react'

import './BuiltReports.css'

export default function BuiltReports() {
    const load = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await fetchReports()
            setReports(data || [])
        } catch (e) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        load()
    }, [])
}