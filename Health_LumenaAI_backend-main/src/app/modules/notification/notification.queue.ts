import { Queue } from 'bullmq'
import { redis } from '../../../lib/redis'

export const shiftNotificationQueue = new Queue('shiftNotification', {
  connection: redis,
})
