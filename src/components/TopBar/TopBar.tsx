import styles from './TopBar.module.css'

function Logo() {
  return (
    <a href="javascript:void(0)" className={styles.logo}>
      <div className={styles.logoMark}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7c0-1.7 1.3-3 3-3h10c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3z" />
          <path d="M9 10h6" />
          <path d="M12 7v6" />
        </svg>
      </div>
      <span className={styles.logoText}>JSON Mock</span>
    </a>
  )
}

function NavButton({ icon, children, active = false }: { icon: React.ReactNode; children: React.ReactNode; active?: boolean }) {
  return (
    <button className={`${styles.navBtn} ${active ? styles.active : ''}`}>
      {icon}
      {children}
    </button>
  )
}

function SaveButton() {
  return (
    <button className="btn-primary">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
      </svg>
      保存
    </button>
  )
}

const templateIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
)

const dataSourceIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5" />
    <path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3" />
  </svg>
)

const projectIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

export default function TopBar() {
  return (
    <header className={styles.topbar}>
      <div className={styles.topbarLeft}>
        <Logo />
        <nav className={styles.topbarNav}>
          <NavButton icon={templateIcon}>模板库</NavButton>
          <NavButton icon={dataSourceIcon}>数据源</NavButton>
          <NavButton icon={projectIcon}>项目</NavButton>
        </nav>
      </div>
      <div className={styles.topbarRight}>
        <SaveButton />
      </div>
    </header>
  )
}
