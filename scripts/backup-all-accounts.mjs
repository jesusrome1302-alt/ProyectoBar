import fs from 'fs'
import path from 'path'

const TOPICS = [
  'rockbar_proyectobar_master_v3',
  'rockbar_v3_bar_yisus_bar',
  'rockbar_v3_eml_jesusrome1302_gmail_com',
  'rockbar_v3_usr_jesus_arias',
  'rockbar_v3_vault_backups',
]

async function runPreChangeBackup() {
  console.log('🛡️ [Pre-Change Backup] Ejecutando copia de seguridad de todas las cuentas registradas...')
  const backupDir = path.resolve(process.cwd(), 'backups')
  fs.mkdirSync(backupDir, { recursive: true })

  const snapshotsByAccount = {}

  // 1. Incluir siempre la base recuperada local como piso de seguridad
  const localRecoveredPath = path.resolve(process.cwd(), 'src/lib/recoveredYisusBarSnapshot.json')
  if (fs.existsSync(localRecoveredPath)) {
    try {
      const snap = JSON.parse(fs.readFileSync(localRecoveredPath, 'utf8'))
      const key = snap.ownerUser?.email || snap.businessId || 'yisus_bar'
      snapshotsByAccount[key] = snap
    } catch {
      // Ignorar error de lectura local
    }
  }

  // 2. Consultar todos los tópicos en una sola llamada combinada para respaldar todas las cuentas en la nube
  try {
    const combined = TOPICS.join(',')
    const res = await fetch(`https://ntfy.sh/${combined}/json?poll=1&since=all`)
    if (res.ok) {
      const text = await res.text()
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
      for (const line of lines) {
        try {
          const evt = JSON.parse(line)
          if (evt.event !== 'message') continue
          let snap = null
          if (evt.attachment?.url) {
            const attRes = await fetch(evt.attachment.url)
            if (attRes.ok) snap = await attRes.json()
          } else if (evt.message && evt.message.trim().startsWith('{')) {
            snap = JSON.parse(evt.message)
          }
          if (snap && snap.barData) {
            const prodCount = snap.barData.products?.length || 0
            const salesCount = snap.barData.closedSales?.length || 0
            const hasPlaceholders = (snap.barData.products || []).some((p) =>
              String(p.id || '').startsWith('yisus-prod-')
            )
            if ((prodCount > 0 || salesCount > 0) && !hasPlaceholders) {
              const key = snap.ownerUser?.email || snap.businessId || `account_${evt.id}`
              const prev = snapshotsByAccount[key]
              const prevSales = prev?.barData?.closedSales?.length || 0
              if (!prev || salesCount >= prevSales) {
                snapshotsByAccount[key] = snap
              }
            }
          }
        } catch {
          // Ignorar evento individual
        }
      }
    }
  } catch (err) {
    console.warn('⚠️ [Pre-Change Backup] Aviso consultando Cloud Relay (se conserva respaldo local):', err.message)
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const outFile = path.join(backupDir, `backup-accounts-${timestamp}.json`)
  const latestFile = path.join(backupDir, 'latest-all-accounts-backup.json')

  const payload = {
    backupCreatedAt: new Date().toISOString(),
    accountsCount: Object.keys(snapshotsByAccount).length,
    accounts: snapshotsByAccount,
  }

  fs.writeFileSync(outFile, JSON.stringify(payload, null, 2), 'utf8')
  fs.writeFileSync(latestFile, JSON.stringify(payload, null, 2), 'utf8')
  console.log(`✅ [Pre-Change Backup] Respaldo completado (${payload.accountsCount} cuenta(s)) en: ${latestFile}`)
}

runPreChangeBackup().catch((e) => {
  console.warn('⚠️ [Pre-Change Backup] No bloqueante:', e.message)
  process.exit(0)
})
