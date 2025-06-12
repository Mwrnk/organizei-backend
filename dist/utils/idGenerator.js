"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatedId = void 0;
const uuid_1 = require("uuid");
const generatedId = () => {
    return (0, uuid_1.v4)();
};
exports.generatedId = generatedId;
