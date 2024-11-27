import express from 'express';
import { Request, Response } from 'express';
import {configurePrometheusRoutes, configureRoutes} from './routes/routes';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import expressSession  from 'express-session';
import passport from 'passport';
import { configurePassport } from './passport/passport';
import mongoose from 'mongoose';
import cors from 'cors';
import promClient from 'prom-client';

const app = express();
const prometheusApp = express();
const serverHost = process.env.SERVER_HOST || 'localhost';
const port = process.env.SERVER_PORT || '5000';
const dbHost = process.env.MONGODB_HOST || 'mongodb';
const dbPort = process.env.MONGODB_PORT || '27017';
const db = process.env.MONGODB_DB || 'my_db';
const dbUrl = `mongodb://${dbHost}:${dbPort}/${db}`;
export const register = new promClient.Registry();

// Prometheus setup
promClient.collectDefaultMetrics({
    register,
    prefix: 'server_'
});

// Create custom metrics
export const httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'path', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1]
});

export const httpRequestTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'path', 'status_code']
});

const calculationErrors = new promClient.Counter({
    name: 'calculation_errors_total',
    help: 'Total number of calculation errors',
    labelNames: ['error_type']
});

const calculationTotal = new promClient.Counter({
    name: 'calculations_total',
    help: 'Total number of calculations performed',
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);


// mongodb connection
mongoose.connect(dbUrl).then((_) => {
    console.log('Successfully connected to MongoDB.');
}).catch(error => {
    console.log(error);
    return;
});

const clientHost = process.env.CLIENT_HOST || 'localhost';
const clientPort = process.env.CLIENT_PORT || 4200;

const whitelist = ['*', `http://localhost:4200`, `http://localhost:4201`, `http://localhost:4202`, `http://localhost:4203`];
const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allowed?: boolean) => void) => {
        if (whitelist.indexOf(origin!) !== -1) {
            callback(null, true);
        } else {
            callback(new Error(`Not allowed by CORS: ${origin!}`));
        }
    },
    credentials: true
}

app.use(cors(corsOptions));

// Add headers
// app.use(function (req, res, next) {
//
//     // Website you wish to allow to connect
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
//
//     // Request methods you wish to allow
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//
//     // Request headers you wish to allow
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//
//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.setHeader('Access-Control-Allow-Credentials', 'true');
//
//     // Pass to next layer of middleware
//     next();
// });

const prometheusHost = process.env.PROMETHEUS_HOST || 'prometheus';
const prometheusPort = process.env.PROMETHEUS_PORT || '4000';

// const prometheusWhitelist = [`*`];
// const prometheusCorsOptions = {
//     origin: (origin: string | undefined, callback: (err: Error | null, allowed?: boolean) => void) => {
//         if (prometheusWhitelist.indexOf(origin!) !== -1) {
//             callback(null, true);
//         } else {
//             callback(new Error(`Not allowed by CORS.`));
//         }
//     },
//     credentials: true
// }

// prometheusApp.use(cors(prometheusCorsOptions));

// bodyParser
app.use(bodyParser.urlencoded({extended: true}));
prometheusApp.use(bodyParser.urlencoded({extended: true}));

// cookieParser
app.use(cookieParser());

// session
const sessionOptions: expressSession.SessionOptions = {
    secret: 'testsecret',
    resave: false,
    saveUninitialized: false
};
app.use(expressSession(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());

configurePassport(passport);

app.use('/app', configureRoutes(passport, express.Router()));

prometheusApp.use('/', configurePrometheusRoutes(express.Router()));

app.listen(port, () => {
    console.log('Server is listening on port ' + port.toString());
});

prometheusApp.listen(prometheusPort, () => {
    console.log('Server is listening on Prometheus port ' + port.toString());
});

export const startTime = process.hrtime();

console.log('After server is ready.');
