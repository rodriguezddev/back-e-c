import { Reflector } from "@nestjs/core";

export const AllowRoles = Reflector.createDecorator<string[]>();