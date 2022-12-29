import React, { useEffect, useState } from 'react'

type NotificationConfig = {
  title: string
  message: string
  severity: 'info' | 'success' | 'warning' | 'error'
}

export const useNotification = () => {
  const [conf, setConf] = useState<NotificationConfig | undefined>(undefined)
  const [open, setOpen] = useState<boolean>(false)

  const handleClose = () => setOpen(false)

  useEffect(() => {
    if (conf?.message) {
      setOpen(true)
    }
  }, [conf])

  const getColor = () => {
    switch (conf?.severity) {
    case 'warning':
      return 'bg-orange-100 border-orange-500 text-orange-700'
    case 'success':
      return 'bg-green-100 border-green-500 text-green-700'
    case 'error':
      return 'bg-red-100 border-red-500 text-red-700'
    case 'info':
    default:
      return 'bg-blue-100 border-blue-500 text-blue-700'
    }
  }

  const SnackbarComponent = () => 
    <div className="border-l-4 p-4" role="alert">
      <p className="font-bold">{conf?.title}</p>
      <p>{conf?.message}</p>
    </div>

  return [setConf, SnackbarComponent] as const
}