import pino from 'pino';
import dayjs from 'dayjs';
// @ts-ignore
const log = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true
        }
    },
    base: {
        pid: false
    },
    timestamp: () => `,"time":"${dayjs().format()}"`
});
export default log;
