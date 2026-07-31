import { Worker } from 'bullmq'
import { sendShiftNotification } from '../../helpers/sendShiftNotification'
import { redis } from '../../../lib/redis'

const worker = new Worker('shiftNotification', async job => {
  console.log('📦 Job received:', job.name, job.data)

  await sendShiftNotification(job.data)

  console.log('✅ Notification sent for job:', job.id)
}, {
  connection: redis
})

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err)
})

worker.on('completed', job => {
  console.log(`🎉 Job ${job.id} completed`)
})
