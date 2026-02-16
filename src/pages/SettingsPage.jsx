import React, { useMemo, useState } from 'react';
import { Card, Metric } from '../components/ui';
import { useAppStore } from '../context/AppContext';
import { decryptSensitive, encryptSensitive } from '../lib/crypto';
import { calculateDayInJourney, calculateMonthInJourney } from '../lib/utils';

export default function SettingsPage({ onToast }) {
  const { state, mutate, exportJson, importJson, resetState, pullFromServer, pushToServer } = useAppStore();
  const [passphrase, setPassphrase] = useState('');
  const [plainKey, setPlainKey] = useState('');
  const [decryptedKey, setDecryptedKey] = useState('');

  const startSummary = useMemo(() => ({
    day: calculateDayInJourney(state.profile.startDate),
    month: calculateMonthInJourney(state.profile.startDate)
  }), [state.profile.startDate]);

  return (
    <div className="space-y-4">
      <Card title="Profile & Preferences" subtitle="Founder profile, company context, and interface settings">
        <div className="grid gap-2 md:grid-cols-3">
          <input className="input" placeholder="Founder name" value={state.profile.founderName} onChange={(e) => mutate((d) => { d.profile.founderName = e.target.value; })} />
          <input className="input" placeholder="Company name" value={state.profile.companyName} onChange={(e) => mutate((d) => { d.profile.companyName = e.target.value; })} />
          <input className="input" placeholder="Stage" value={state.profile.stage} onChange={(e) => mutate((d) => { d.profile.stage = e.target.value; })} />
          <input className="input" type="date" value={state.profile.startDate} onChange={(e) => mutate((d) => { d.profile.startDate = e.target.value; })} />
          <input className="input" type="date" value={state.profile.targetSeriesADate} onChange={(e) => mutate((d) => { d.profile.targetSeriesADate = e.target.value; })} />
          <input className="input" placeholder="Industry/domain" value={state.profile.industry} onChange={(e) => mutate((d) => { d.profile.industry = e.target.value; })} />
          <input className="input" placeholder="Business model" value={state.profile.businessModel} onChange={(e) => mutate((d) => { d.profile.businessModel = e.target.value; })} />
          <input className="input" type="number" placeholder="Hourly rate" value={state.profile.hourlyRate} onChange={(e) => mutate((d) => { d.profile.hourlyRate = Number(e.target.value); })} />
          <select className="select" value={state.settings.colorScheme} onChange={(e) => mutate((d) => { d.settings.colorScheme = e.target.value; })}>
            <option value="blue">Blue</option>
            <option value="emerald">Emerald</option>
            <option value="amber">Amber</option>
          </select>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
          <Metric label="Journey day" value={startSummary.day} />
          <Metric label="Journey month" value={startSummary.month} />
          <Metric label="External integrations" value={state.settings.externalIntegrationsEnabled ? 'Enabled' : 'Disabled'} />
          <Metric label="Keyboard shortcuts" value={state.settings.keyboardShortcutsEnabled ? 'On' : 'Off'} />
        </div>
      </Card>

      <Card title="Sensitive Data Encryption" subtitle="Encrypt API keys before local storage persistence">
        <div className="grid gap-2 md:grid-cols-2">
          <input className="input" type="password" placeholder="Encryption passphrase" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} />
          <input className="input" placeholder="API key hint" value={state.profile.aiApiKeyHint} onChange={(e) => mutate((d) => { d.profile.aiApiKeyHint = e.target.value; })} />
          <input className="input md:col-span-2" placeholder="AI API key (optional)" value={plainKey} onChange={(e) => setPlainKey(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            className="btn-primary"
            onClick={async () => {
              if (!plainKey || !passphrase) {
                onToast('Provide both API key and passphrase.');
                return;
              }
              const encrypted = await encryptSensitive(plainKey, passphrase);
              mutate((draft) => { draft.profile.aiApiKeyEncrypted = encrypted; });
              setPlainKey('');
              onToast('API key encrypted and stored.');
            }}
          >
            Encrypt & Save
          </button>
          <button
            className="btn-secondary"
            onClick={async () => {
              if (!state.profile.aiApiKeyEncrypted || !passphrase) {
                onToast('No encrypted key or passphrase missing.');
                return;
              }
              try {
                const value = await decryptSensitive(state.profile.aiApiKeyEncrypted, passphrase);
                setDecryptedKey(value || '(unable to decrypt)');
              } catch {
                setDecryptedKey('(failed to decrypt)');
              }
            }}
          >
            Decrypt Preview
          </button>
        </div>
        {decryptedKey ? <p className="text-sm mt-2 break-all">Preview: {decryptedKey}</p> : null}
      </Card>

      <Card title="Data Management" subtitle="Export, import, sync, and reset">
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={() => { exportJson(); onToast('Exported JSON.'); }}>Export all data</button>
          <label className="btn-secondary cursor-pointer">
            Import data
            <input type="file" accept="application/json,.json" className="hidden" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              await importJson(file);
              onToast('Imported JSON data.');
              e.target.value = '';
            }} />
          </label>
          <button className="btn-secondary" onClick={async () => { await pushToServer(); onToast('Pushed to cloud sync.'); }}>Backup to cloud</button>
          <button className="btn-secondary" onClick={async () => { await pullFromServer(); onToast('Pulled from cloud sync.'); }}>Restore from cloud</button>
          <button
            className="btn-danger"
            onClick={() => {
              if (!window.confirm('Clear all local data? Export first if needed.')) return;
              resetState();
              onToast('All local data cleared.');
            }}
          >
            Clear data
          </button>
        </div>
      </Card>

      <Card title="Notifications & Reminders">
        <div className="grid gap-2 md:grid-cols-2">
          {Object.entries(state.settings.notifications).map(([key, value]) => (
            <label key={key} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm">
              <span>{key}</span>
              <input type="checkbox" checked={value} onChange={(e) => mutate((d) => { d.settings.notifications[key] = e.target.checked; })} />
            </label>
          ))}
        </div>
      </Card>

      <Card title="Integrations">
        <p className="text-sm text-slate-500 mb-2">No external data transmission unless explicitly enabled.</p>
        <label className="flex items-center gap-2 text-sm mb-2">
          <input type="checkbox" checked={state.settings.externalIntegrationsEnabled} onChange={(e) => mutate((d) => { d.settings.externalIntegrationsEnabled = e.target.checked; })} />
          Enable external integrations
        </label>
        <div className="grid gap-2 md:grid-cols-3">
          {Object.entries(state.settings.integrations).map(([key, value]) => (
            <label key={key} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm">
              <span>{key}</span>
              <input
                type="checkbox"
                checked={value}
                disabled={!state.settings.externalIntegrationsEnabled}
                onChange={(e) => mutate((d) => { d.settings.integrations[key] = e.target.checked; })}
              />
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
}
