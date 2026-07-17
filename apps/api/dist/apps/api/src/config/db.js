"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../utils/logger");
const env_1 = require("./env");
let mongod = null;
async function connectDB() {
    try {
        mongoose_1.default.set('strictQuery', false);
        logger_1.logger.info(`Attempting database connection to: ${env_1.env.MONGO_URI}`);
        await mongoose_1.default.connect(env_1.env.MONGO_URI, { serverSelectionTimeoutMS: 4000 });
        logger_1.logger.info(`MongoDB connected: ${mongoose_1.default.connection.host}`);
    }
    catch (error) {
        logger_1.logger.warn('MongoDB connection failed. Booting local in-memory MongoDB server fallback...');
        try {
            const { MongoMemoryServer } = await Promise.resolve().then(() => __importStar(require('mongodb-memory-server')));
            mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            await mongoose_1.default.connect(uri);
            logger_1.logger.info(`🚀 In-memory MongoDB connected: ${uri}`);
            // Programmatically run seed script
            const { seedDatabase } = await Promise.resolve().then(() => __importStar(require('../seed/index')));
            await seedDatabase();
            logger_1.logger.info('🎉 In-memory database seeded successfully with mock neighborhood data.');
        }
        catch (memError) {
            logger_1.logger.error('Failed to boot local in-memory MongoDB fallback:', memError);
            process.exit(1);
        }
    }
}
mongoose_1.default.connection.on('disconnected', () => {
    logger_1.logger.warn('MongoDB disconnected.');
});
mongoose_1.default.connection.on('reconnected', () => {
    logger_1.logger.info('MongoDB reconnected.');
});
//# sourceMappingURL=db.js.map