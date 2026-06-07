import { useState, useEffect, useCallback } from 'react'
import TopBar from './components/TopBar/TopBar'
import SchemaEditor from './components/SchemaEditor/SchemaEditor'
import DataPreview from './components/DataPreview/DataPreview'
import FieldConfigModal from './components/Modal/FieldConfigModal'
import Modal from './components/Modal/Modal'
import DataSourcePanel from './components/DataSourcePanel/DataSourcePanel'
import { useProjectStore } from './store/useProjectStore'

function App() {
  const [fieldModalOpen, setFieldModalOpen] = useState(false)
  const [dsModalOpen, setDsModalOpen] = useState(false)

  const selectedFieldId = useProjectStore((s) => s.selectedFieldId)

  const handleEditField = useCallback(() => {
    setFieldModalOpen(true)
  }, [])

  const handleCloseFieldModal = useCallback(() => {
    setFieldModalOpen(false)
  }, [])

  const handleOpenDs = useCallback(() => {
    setDsModalOpen(true)
  }, [])

  const handleCloseDs = useCallback(() => {
    setDsModalOpen(false)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (fieldModalOpen) setFieldModalOpen(false)
        if (dsModalOpen) setDsModalOpen(false)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [fieldModalOpen, dsModalOpen])

  return (
    <>
      <TopBar onDataSource={handleOpenDs} />
      <div className="main">
        <SchemaEditor onEditField={handleEditField} />
        <DataPreview />
      </div>
      <FieldConfigModal
        open={fieldModalOpen}
        fieldId={selectedFieldId}
        onClose={handleCloseFieldModal}
      />
      <Modal
        open={dsModalOpen}
        title="数据源管理"
        subtitle="管理已导入的数据源"
        onClose={handleCloseDs}
      >
        <DataSourcePanel />
      </Modal>
    </>
  )
}

export default App