import winston from "winston";
import "winston-daily-rotate-file";
import path, { format } from "path";

const { combine, timestamp, align, json, printf } = winston.format;
const timestampFormat = "MMM-DD-YYYY HH:mm:ss";

// rotation file config
const fileRotateTransport = new winston.transports.DailyRotateFile({
	dirname: "logs",
	filename: "system-%DATE%.log",
	datePattern: "YYYY-MM-DD",
	maxFiles: "7d",
});

export const httpLogger = winston.createLogger({
	level: "info",
	format: combine(
		timestamp({ format: timestampFormat }),
		align(),
		printf((info) => {
			return `[${info.timestamp}] ${info.level}: ${info.user} ${info.req.method} ${info.req.originalUrl} ${info.res.statusCode} ${info.message}`;
		})
	),

	transports: [fileRotateTransport],
});
