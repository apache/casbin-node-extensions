// Copyright 2026 The Apache Software Foundation
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { WhereOptions, Op } from 'sequelize';

export enum CombineType {
    OR = 'OR',
    AND = 'AND',
}

const operatorMapping: Record<string, keyof typeof Op> = {
    '=': 'eq',
    '<': 'lt',
    '>': 'gt',
    '<=': 'lte',
    '>=': 'gte',
    '<>': 'ne',
};

export function parseCondition(condition: string): WhereOptions {
    const regex = /^(\w+)\s*(=|<|>|<=|>=|<>)\s*([\w\.\d]+)$/;
    const match = condition.match(regex);

    if (!match) {
        throw new Error(`Invalid condition: ${condition}`);
    }

    const [, column, operator, value] = match;
    const parsedValue = !isNaN(parseFloat(value)) ? parseFloat(value) : value;

    return {
        [column]: {
            [Op[operatorMapping[operator]]]: parsedValue,
        },
    };
}

export function conditionsToSequelizeQuery(conditions: string[], combineType: CombineType): WhereOptions {
    const where: WhereOptions = {};

    if (combineType === CombineType.OR) {
        (where as any)[Op.or] = conditions.map(parseCondition);
    } else if (combineType === CombineType.AND) {
        (where as any)[Op.and] = conditions.map(parseCondition);
    }

    return where;
}
