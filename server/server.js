import express from 'express';
import cors from 'cors';
import './env.js';
import { clerkMiddleware, clerkClient, requireAuth, getAuth } from '@clerk/express'
import aiRouter from './routes/airoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRoutes.js';

const app = express()

await connectCloudinary()

let httpRequestCount = 0

app.use(cors())
app.use(express.json())
app.use(clerkMiddleware())

app.use((req, res, next) => {
    httpRequestCount += 1
    next()
})

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});
app.get('/', (req, res) => res.send('Server is Live!'))

app.get('/metrics', (req, res) => {
    const memory = process.memoryUsage()
    res.type('text/plain').send([
        '# HELP quickai_http_requests_total Total HTTP requests handled by the QuickAi API.',
        '# TYPE quickai_http_requests_total counter',
        `quickai_http_requests_total ${httpRequestCount}`,
        '# HELP quickai_process_uptime_seconds Process uptime in seconds.',
        '# TYPE quickai_process_uptime_seconds gauge',
        `quickai_process_uptime_seconds ${process.uptime()}`,
        '# HELP quickai_process_memory_heap_used_bytes Process heap memory used in bytes.',
        '# TYPE quickai_process_memory_heap_used_bytes gauge',
        `quickai_process_memory_heap_used_bytes ${memory.heapUsed}`,
        ''
    ].join('\n'))
})


app.use(requireAuth())
app.use('/api/ai', aiRouter)
app.use('/api/user', userRouter)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log('Server is running on port ', PORT)
})
