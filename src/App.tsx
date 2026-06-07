import { useState, useEffect, useCallback } from 'react'
import TopBar from './components/TopBar/TopBar'
import SchemaEditor from './components/SchemaEditor/SchemaEditor'
import DataPreview from './components/DataPreview/DataPreview'
import FieldConfigModal from './components/Modal/FieldConfigModal'
import Toast from './components/Toast/Toast'

function App() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedField, setSelectedField] = useState('email')
  const [toastVisible, setToastVisible] = useState(false)

  const handleSelectField = useCallback((name: string) => {
    setSelectedField(name)
    setModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setModalOpen(false)
  }, [])

  const handleCopy = useCallback(() => {
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2000)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalOpen) {
        setModalOpen(false)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [modalOpen])

  return (
    <>
      <TopBar />
      <div className="main">
        <SchemaEditor onSelectField={handleSelectField} />
        <DataPreview onCopy={handleCopy} />
      </div>
      <FieldConfigModal
        open={modalOpen}
        fieldName={selectedField}
        onClose={handleCloseModal}
      />
      <Toast visible={toastVisible} />
    </>
  )
}

export default App
