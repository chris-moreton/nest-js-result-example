"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionalValidationPipe = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const E = require("fp-ts/Either");
let FunctionalValidationPipe = class FunctionalValidationPipe {
    async transform(value, { metatype }) {
        if (!metatype || !this.toValidate(metatype)) {
            return value;
        }
        const object = (0, class_transformer_1.plainToInstance)(metatype, value);
        const validationResult = await this.validateObject(object);
        if (E.isLeft(validationResult)) {
            throw new common_1.BadRequestException({
                message: 'Validation failed',
                errors: validationResult.left,
            });
        }
        return validationResult.right;
    }
    toValidate(metatype) {
        const types = [String, Boolean, Number, Array, Object];
        return !types.includes(metatype);
    }
    async validateObject(object) {
        const errors = await (0, class_validator_1.validate)(object);
        if (errors.length > 0) {
            const validationErrors = errors.map((error) => ({
                field: error.property,
                constraints: Object.values(error.constraints || {}),
            }));
            return E.left(validationErrors);
        }
        return E.right(object);
    }
};
exports.FunctionalValidationPipe = FunctionalValidationPipe;
exports.FunctionalValidationPipe = FunctionalValidationPipe = __decorate([
    (0, common_1.Injectable)()
], FunctionalValidationPipe);
//# sourceMappingURL=functional-validation.pipe.js.map