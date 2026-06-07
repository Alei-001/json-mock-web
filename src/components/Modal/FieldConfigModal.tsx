import { useState } from 'react'
import Modal from './Modal'

interface FieldConfigModalProps {
  open: boolean
  fieldName: string
  onClose: () => void
}

export default function FieldConfigModal({ open, fieldName, onClose }: FieldConfigModalProps) {
  const [required, setRequired] = useState(true)

  return (
    <Modal
      open={open}
      title="字段配置"
      subtitle={fieldName || '字段'}
      onClose={onClose}
      footer={
        <>
          <button className="btn-sm" onClick={onClose}>取消</button>
          <button className="btn-sm primary" onClick={onClose}>保存</button>
        </>
      }
    >
      <div className="form-grid">
        <div className="form-group full-width">
          <div className="toggle-row">
            <span className="toggle-label">必填</span>
            <button
              className={`toggle ${required ? 'active' : ''}`}
              aria-label="切换必填状态"
              onClick={() => setRequired(!required)}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Faker 类型</label>
          <select className="form-select" defaultValue="internet.email">
            <option>internet.email</option>
            <option>person.fullName</option>
            <option>phone.number</option>
            <option>lorem.sentence</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">格式</label>
          <select className="form-select" defaultValue="email">
            <option>email</option>
            <option>uri</option>
            <option>date-time</option>
            <option>uuid</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">最小长度</label>
          <input type="number" className="form-input" defaultValue={5} />
        </div>
        <div className="form-group">
          <label className="form-label">最大长度</label>
          <input type="number" className="form-input" defaultValue={254} />
        </div>
        <div className="form-group full-width">
          <label className="form-label">正则约束</label>
          <input
            type="text"
            className="form-input mono"
            placeholder="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
          />
        </div>
        <div className="form-group full-width">
          <label className="form-label">自定义表达式</label>
          <input type="text" className="form-input mono" placeholder="{{internet.email}}" />
        </div>
        <div className="form-group full-width form-divider">
          <div className="form-divider-line" />
          <span className="form-divider-label">数据源绑定</span>
        </div>
        <div className="form-group">
          <label className="form-label">绑定数据源</label>
          <select className="form-select" defaultValue="">
            <option value="">未绑定（使用 Faker）</option>
            <option value="users">用户列表 (120条)</option>
            <option value="cities">城市数据 (50条)</option>
            <option value="emails">邮箱库 (200条)</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">抽样策略</label>
          <select className="form-select" defaultValue="随机抽取">
            <option>随机抽取</option>
            <option>顺序循环</option>
          </select>
        </div>
        <div className="form-group full-width">
          <div className="form-hint">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            绑定后，该字段的值将从数据源中抽取，而非 Faker 生成
          </div>
        </div>
      </div>
    </Modal>
  )
}
