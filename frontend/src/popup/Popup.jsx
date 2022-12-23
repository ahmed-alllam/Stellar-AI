import '@picocss/pico'
import { MarkGithubIcon } from '@primer/octicons-react'
import { useCallback, useEffect, useState } from 'preact/hooks'
import { getUserConfig, TRIGGER_MODES, updateUserConfig } from '../config'
import './styles.css'

function Popup() {
  const [triggerMode, setTriggerMode] = useState()

  useEffect(() => {
    getUserConfig().then((config) => {
      setTriggerMode(config.triggerMode || 'enabled')
    })
  }, [])

  const onTriggerModeChange = useCallback((e) => {
    const mode = e.target.value
    setTriggerMode(mode)
    updateUserConfig({ triggerMode: mode })
  }, [])

  return (
    <div className="container">
      <form>
        <fieldset onChange={onTriggerModeChange}>
          <legend>Stellar AI Mode</legend>
          {Object.entries(TRIGGER_MODES).map(([value, label]) => {
            return (
              <label htmlFor={value} key={value}>
                <input
                  type="radio"
                  id={value}
                  name="triggerMode"
                  value={value}
                  checked={triggerMode === value}
                />
                {label}
              </label>
            )
          })}
        </fieldset>
      </form>

      <div className="footer">
        <p>
          Stellar AI is a tool that uses Artificial Intelligence to help you
          get summaries of articles you read and searches you do on the web.
        </p>

        <p>
          Developed and maintained by Ahmed Allam. For any inquiries, email me at ahmedeallam@aucegypt.edu.
        </p>
      </div>

      <div className="footer">
        <a href="
        https://www.facebook.com/ahmedemad9090/" target="_blank">
          <img src="https://img.icons8.com/color/48/000000/facebook-new.png" width="48" height="48" />
        </a>
        <a href="https://www.linkedin.com/in/ahmed-e-allam/" target="_blank">
          <img src="https://img.icons8.com/color/48/000000/linkedin.png" width="48" height="48" />
        </a>
        <a href="https://github.com/ahmedemad3965" target="_blank">
          <img src="https://img.icons8.com/windows/64/null/github.png" width="48" height="48" />
        </a>
      </div>
    </div>
  )
}

export default Popup
