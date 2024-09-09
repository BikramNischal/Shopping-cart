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
		printf(
			(info) =>
				`${
					info.req.socket.remoteAddress ||
					info.req.headers["x-forwarded-for"]
				} [${info.timestamp}] ${info.level} ${
					info.req.method
				} ${info.req.originalUrl} ${info.res.statusCode} ${info.message}`
		)
	),

	transports: [fileRotateTransport],
});
