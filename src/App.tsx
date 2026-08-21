import { useState } from 'react'
import { StoreProvider, useStore } from './store'
import Today from './views/Today'
import Plan from './views/Plan'
import Log from './views/Log'
import Library from './views/Library'
import Progress from './views/Progress'
import SettingsView from './views/SettingsView'
import Welcome from './views/Welcome'
import { currentPlace, withPlace } from './engine/places'

/**
 * Five tabs, not eight.
 *
 * Routines used to be a tab of its own and Settings took a sixth of the bar.
 * Neither earns a permanent slot on a phone: Today already suggests the routine
 * you should do, the full list belongs with the week that schedules it, and
 * Settings is somewhere you go twice a month. That freed the room for Plan,
 * which is the screen the goals and the week live on.
 */
type Tab = 'today' | 'plan' | 'log' | 'library' | 'progress'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'today', label: 'Today', icon: '⚡' },
  { id: 'plan', label: 'Plan', icon: '🗓' },
  { id: 'log', label: 'Log', icon: '📝' },
  { id: 'library', label: 'Library', icon: '📚' },
  { id: 'progress', label: 'Progress', icon: '📈' },
]

function Shell() {
  const [tab, setTab] = useState<Tab>('today')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [placeOpen, setPlaceOpen] = useState(false)
  // Set when a Today card sends you straight into a specific routine, so Plan
  // opens on a ready-to-run flow instead of a menu.
  const [pendingRoutineId, setPendingRoutineId] = useState<string | undefined>()
  const { activeSession, data, updateSettings } = useStore()
  const place = currentPlace(data.settings)

  // First run: the front door, and the four questions the app cannot guess.
  // It renders instead of everything else, tab bar included — there is nothing
  // to navigate to yet.
  if (!data.settings.onboarded) {
    return (
      <main className="app-main">
        <Welcome onDone={() => updateSettings({ onboarded: true })} />
      </main>
    )
  }

  function openRoutine(id: string) {
    setPendingRoutineId(id)
    setTab('plan')
  }

  // Settings is a full-screen overlay rather than a destination. It covers the
  // tab bar on purpose: you are configuring the app, not navigating it.
  if (settingsOpen) {
    return (
      <main className="app-main">
        <button className="btn btn-sm" style={{ marginBottom: 12 }} onClick={() => setSettingsOpen(false)}>
          ← Done
        </button>
        <SettingsView />
      </main>
    )
  }

  return (
    <>
      {/*
        An opaque strip across the top edge. Installed on iOS the page runs
        under the translucent status bar, and the place button is a solid
        circle sitting over a scrolling column -- so without this, scrolled
        text renders behind the clock and loses a 44px bite out of its
        right-hand end. A full-width strip means content disappears under a
        header edge, which is what a header is for.
      */}
      <div className="top-scrim" aria-hidden="true" />
      {/*
        Not on Log: it floats over the top-right corner, which mid-session is
        exactly where the tick boxes are. Nothing about where you are training
        changes while you are already training.
      */}
      {tab !== 'log' && (
      <>
      {/*
        This button shows where you are and switches it. It used to show the
        place icon and open Settings, which is a button lying about what it
        does -- and switching place is a daily action while Settings is a
        monthly one, so the frequent thing gets the corner.
      */}
      <button
        className="settings-button"
        onClick={() => setPlaceOpen(true)}
        aria-label={place ? `You are at ${place.name}. Change place.` : 'Choose a place'}
      >
        {place?.icon ?? '📍'}
      </button>

      {placeOpen && (
        <div className="sheet-backdrop" onClick={() => setPlaceOpen(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 2px' }}>Where are you?</h3>
            <p className="faint" style={{ margin: '0 0 10px' }}>
              Only what is here gets offered.
            </p>

            {(data.settings.places ?? []).map((pl) => (
              <button
                key={pl.id}
                className={`sheet-row${pl.id === data.settings.currentPlaceId ? ' is-on' : ''}`}
                onClick={() => {
                  updateSettings(withPlace(data.settings, pl.id))
                  setPlaceOpen(false)
                }}
              >
                <span className="place-icon">{pl.icon ?? '📍'}</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{pl.name}</span>
                <span className="faint">{pl.equipment.length} things</span>
              </button>
            ))}

            <button
              className="sheet-row"
              onClick={() => {
                setPlaceOpen(false)
                setSettingsOpen(true)
              }}
            >
              <span className="place-icon">⚙️</span>
              <span style={{ flex: 1, textAlign: 'left' }}>Settings</span>
            </button>
          </div>
        </div>
      )}

      </>
      )}

      <main className="app-main">
        {tab === 'today' && <Today goToLog={() => setTab('log')} goToRoutine={openRoutine} />}
        {tab === 'plan' && <Plan initialRoutineId={pendingRoutineId} />}
        {tab === 'log' && <Log goToToday={() => setTab('today')} />}
        {tab === 'library' && <Library />}
        {tab === 'progress' && <Progress />}
      </main>

      <nav className="tabbar">
        <div className="tabbar-inner">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                if (t.id !== 'plan') setPendingRoutineId(undefined)
                setTab(t.id)
              }}
              aria-current={tab === t.id ? 'page' : undefined}
            >
              <span className="icon">
                {/* A live session gets a dot so you cannot forget you are mid-workout. */}
                {t.id === 'log' && activeSession ? '🔴' : t.icon}
              </span>
              <span className="tab-label">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
