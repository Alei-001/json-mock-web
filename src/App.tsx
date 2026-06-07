import { useState, useEffect, useCallback } from 'react'
import TopBar from './components/TopBar/TopBar'
import SchemaEditor from './components/SchemaEditor/SchemaEditor'
import DataPreview from './components/DataPreview/DataPreview'
import FieldConfigModal from './components/Modal/FieldConfigModal'
import Modal from './components/Modal/Modal'
import DataSourcePanel from './components/DataSourcePanel/DataSourcePanel'
import TemplateLibrary from './components/TemplateLibrary/TemplateLibrary'
import Toast from './components/Toast/Toast'
import { useProjectStore } from './store/useProjectStore'

function App() {
  const [fieldModalOpen, setFieldModalOpen] = useState(false)
  const [dsModalOpen, setDsModalOpen] = useState(false)
  const [tmplModalOpen, setTmplModalOpen] = useState(false)

  const selectedFieldId = useProjectStore((s) => s.selectedFieldId)
  const toastMessage = useProjectStore((s) => s.toastMessage)
  const theme = useProjectStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const handleEditField = useCallback(() => setFieldModalOpen(true), [])
  const handleCloseFieldModal = useCallback(() => setFieldModalOpen(false), [])
  const handleOpenDs = useCallback(() => setDsModalOpen(true), [])
  const handleCloseDs = useCallback(() => setDsModalOpen(false), [])
  const handleOpenTmpl = useCallback(() => setTmplModalOpen(true), [])
  const handleCloseTmpl = useCallback(() => setTmplModalOpen(false), [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (fieldModalOpen) setFieldModalOpen(false)
        else if (dsModalOpen) setDsModalOpen(false)
        else if (tmplModalOpen) setTmplModalOpen(false)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [fieldModalOpen, dsModalOpen, tmplModalOpen])

  return (
    <>
      <TopBar onTemplate={handleOpenTmpl} onDataSource={handleOpenDs} />
      <div className="main">
        <SchemaEditor onEditField={handleEditField} />
        <DataPreview />
      </div>
      <FieldConfigModal open={fieldModalOpen} fieldId={selectedFieldId} onClose={handleCloseFieldModal} />
      <Modal open={dsModalOpen} title="数据源管理" subtitle="管理已导入的数据源" onClose={handleCloseDs}>
        <DataSourcePanel />
      </Modal>
      <Modal open={tmplModalOpen} title="模板库" subtitle="选择一个预设模板开始" onClose={handleCloseTmpl}>
        <TemplateLibrary onSelect={handleCloseTmpl} />
      </Modal>
      <Toast visible={!!toastMessage} message={toastMessage ?? ''} />
    </>
  )
}

export default App