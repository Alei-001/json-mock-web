import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import TopBar from './components/TopBar/TopBar'
import SchemaEditor from './components/SchemaEditor/SchemaEditor'
import DataPreview from './components/DataPreview/DataPreview'
import FieldConfigModal from './components/Modal/FieldConfigModal'
import Modal from './components/Modal/Modal'
import DataSourcePanel from './components/DataSourcePanel/DataSourcePanel'
import TemplateLibrary from './components/TemplateLibrary/TemplateLibrary'
import Welcome from './components/Welcome/Welcome'
import Toast from './components/Toast/Toast'
import { useProjectStore } from './store/useProjectStore'

function App() {
  const { t } = useTranslation()
  const [fieldModalOpen, setFieldModalOpen] = useState(false)
  const [dsModalOpen, setDsModalOpen] = useState(false)
  const [tmplModalOpen, setTmplModalOpen] = useState(false)

  const selectedFieldId = useProjectStore((s) => s.selectedFieldId)
  const toastMessage = useProjectStore((s) => s.toastMessage)
  const theme = useProjectStore((s) => s.theme)
  const hasSeenWelcome = useProjectStore((s) => s.hasSeenWelcome)
  const schema = useProjectStore((s) => s.schema)
  const dismissWelcome = useProjectStore((s) => s.dismissWelcome)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    if (schema.children && schema.children.length > 0) {
      const state = useProjectStore.getState()
      if (!state.hasSeenWelcome) {
        dismissWelcome()
      }
    }
  }, [schema, dismissWelcome])

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
      {!hasSeenWelcome ? (
        <Welcome onOpenTemplates={handleOpenTmpl} />
      ) : (
        <>
          <TopBar onTemplate={handleOpenTmpl} onDataSource={handleOpenDs} />
          <div className="main">
            <SchemaEditor onEditField={handleEditField} />
            <DataPreview />
          </div>
          <FieldConfigModal key={fieldModalOpen ? selectedFieldId ?? 'no-field' : 'closed'} open={fieldModalOpen} fieldId={selectedFieldId} onClose={handleCloseFieldModal} />
          <Modal open={dsModalOpen} title={t('dataSource.title')} subtitle={t('dataSource.subtitle')} onClose={handleCloseDs}>
            <DataSourcePanel />
          </Modal>
          <Modal open={tmplModalOpen} title={t('template.title')} subtitle={t('template.subtitle')} onClose={handleCloseTmpl}>
            <TemplateLibrary onSelect={handleCloseTmpl} />
          </Modal>
          <Toast visible={!!toastMessage} message={toastMessage ?? ''} />
        </>
      )}
    </>
  )
}

export default App