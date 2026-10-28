"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const supabase_1 = require("./config/supabase");

if (env_1.isProduction && !supabase_1.supabase) {
    console.error("FATAL: Backend server cannot start in production without a valid SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
}

const port = env_1.env.PORT;
app_1.default.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});
