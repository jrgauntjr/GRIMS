import { useState, useEffect } from 'react'

import './InventoryManage.css'

export default function InventoryManage() {
    const load = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await fetchInventory()
            setInventory(data || [])
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

